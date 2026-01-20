from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from django.conf import settings
from .models import Ticket, Event
from .serializers import TicketSerializer, EventSerializer
import requests
import os
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter

class InitiatePaymentView(APIView):
    def post(self, request):
        reference = request.data.get('reference')
        email = request.data.get('email')
        phone_number = request.data.get('phone_number')
        names = request.data.get('names', [])
        name = request.data.get('name') # Fallback if single name
        
        # Get active event
        event = Event.objects.filter(is_active=True).first()
        if not event:
             # Fallback or error - for now fallback to creating one or getting first
             event = Event.objects.first()
             if not event:
                 event = Event.objects.create(name="Waakye Fest 2026", is_active=True)

        if not names and name:
            names = [name]

        if not reference or not email or not names:
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if already exists to prevent duplicates
        if Ticket.objects.filter(paystack_reference=reference).exists():
             return Response({'message': 'Transaction already initialized'}, status=status.HTTP_200_OK)

        tickets = []
        for attendee_name in names:
            ticket = Ticket.objects.create(
                event=event,
                name=attendee_name,
                email=email,
                phone_number=phone_number,
                paystack_reference=reference,
                verified=False # Pending
            )
            tickets.append(ticket)
        
        return Response({'message': 'Transaction initialized', 'count': len(tickets)}, status=status.HTTP_201_CREATED)

class VerifyPaymentView(APIView):
    def post(self, request):
        reference = request.data.get('reference')
        
        if not reference:
            return Response({'error': 'No reference provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify with Paystack
        secret_key = os.environ.get('PAYSTACK_SECRET_KEY')
        verify_success = True 
        
        if secret_key:
             try:
                headers = {
                    'Authorization': f'Bearer {secret_key}',
                    'Content-Type': 'application/json',
                }
                url = f"https://api.paystack.co/transaction/verify/{reference}"
                response = requests.get(url, headers=headers)
                data = response.json()
                if not data['status'] or data['data']['status'] != 'success':
                    verify_success = False
                    print(f"Paystack verification failed: {data}")
             except Exception as e:
                 print(f"Paystack verification error: {e}")
                 # verification failed due to network?
                 pass

        if verify_success:
            # Update existing tickets as verified
            updated_count = Ticket.objects.filter(paystack_reference=reference).update(verified=True)
            
            # If no tickets found (maybe initialization failed or direct verify call), create them
            if updated_count == 0:
                 name = request.data.get('name')
                 email = request.data.get('email')
                 phone_number = request.data.get('phone_number')
                 names = request.data.get('names', [])
                 if not names and name: names = [name]
                 
                 # Active event
                 event = Event.objects.filter(is_active=True).first()
                 if not event: event = Event.objects.create(name="Waakye Fest 2026", is_active=True)

                 for attendee_name in names:
                    Ticket.objects.create(
                        event=event,
                        name=attendee_name,
                        email=email,
                        phone_number=phone_number,
                        paystack_reference=reference, 
                        verified=True
                    )
            
            # Fetch and return tickets
            tickets = Ticket.objects.filter(paystack_reference=reference)
            serializer = TicketSerializer(tickets, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response({'error': 'Payment verification failed'}, status=status.HTTP_400_BAD_REQUEST)

class TicketDetailView(generics.RetrieveAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    lookup_field = 'id'

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        # Filter by active event if desired, or all? 
        # For now, let's keep it simple and show all stats or filter by active event
        # Let's filter by active event to support multi-year goal
        event = Event.objects.filter(is_active=True).first()
        if event:
            tickets_qs = Ticket.objects.filter(event=event)
        else:
            tickets_qs = Ticket.objects.all()

        total_tickets = tickets_qs.count()
        verified_tickets = tickets_qs.filter(verified=True).count()
        # Revenue: Use ticket_price from event or default to 50.00
        price = event.ticket_price if event else 50.00
        # Convert Decimal to float for simple multiplication if needed, or keep as Decimal
        total_revenue = verified_tickets * float(price) 
        
        recent_sales = tickets_qs.filter(verified=True).order_by('-created_at')[:5]
        recent_sales_data = TicketSerializer(recent_sales, many=True).data

        return Response({
            'total_tickets': total_tickets,
            'verified_tickets': verified_tickets,
            'total_revenue': total_revenue,
            'recent_sales': recent_sales_data
        })

from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class TransactionListView(generics.ListAPIView):
    queryset = Ticket.objects.all().order_by('-created_at')
    serializer_class = TicketSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter]
    search_fields = ['name', 'email', 'paystack_reference', 'phone_number']
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
         # Optionally filter by active event
         qs = super().get_queryset()
         event = Event.objects.filter(is_active=True).first()
         if event:
             return qs.filter(event=event)
         return qs


class EventSettingsView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request):
        # Get active event or create default
        event = Event.objects.filter(is_active=True).first()
        if not event:
             event = Event.objects.create(name="Waakye Fest 2026", is_active=True)
        serializer = EventSerializer(event)
        return Response(serializer.data)

    def post(self, request):
        # Update active event
        event = Event.objects.filter(is_active=True).first()
        if not event:
            event = Event.objects.create(name="Waakye Fest 2026", is_active=True)
            
        serializer = EventSerializer(event, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CheckInView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        ticket_id = request.data.get('ticket_id')
        ticket_code = request.data.get('ticket_code') # For manual entry short code
        qr_content = request.data.get('qr_code_content')
        ticket_ids = request.data.get('ticket_ids', []) # For bulk check-in via checkbox

        # Resolve short code to ID if provided
        if ticket_code:
            try:
                ticket = Ticket.objects.get(short_code=ticket_code.upper()) # Case insensitive
                ticket_id = ticket.id
            except Ticket.DoesNotExist:
                 return Response({'error': 'Invalid ticket code'}, status=status.HTTP_404_NOT_FOUND)

        # Parse QR content if provided (expecting JSON string or raw ID)
        if qr_content:
            try:
                # Try JSON parse
                import json
                data = json.loads(qr_content)
                if 'id' in data:
                    ticket_id = data['id']
            except:
                # Assuming raw ID or unsupported format
                ticket_id = qr_content
        
        ids_to_process = ticket_ids
        if ticket_id:
             ids_to_process.append(ticket_id)
        
        if not ids_to_process:
             return Response({'error': 'No ticket ID provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Process check-ins
        tickets_to_check_in = Ticket.objects.filter(id__in=ids_to_process, verified=True)
        updated_count = tickets_to_check_in.update(checked_in=True)
        
        if updated_count == 0:
             # Check if ticket exists but not verified vs just doesn't exist/already checked in logic could be better
             # But for MVP:
             return Response({'error': 'Ticket invalid or not paid (verified)'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Serialize the checked-in tickets to return details
        # We re-fetch or reuse queryset (update doesn't invalidate filter if we just want data)
        # However, update might not reflect in queryset cache if not refreshed usually, but here we just need names
        attendees = TicketSerializer(tickets_to_check_in, many=True).data

        return Response({
            'message': f'Successfully checked in.', 
            'count': updated_count,
            'attendees': attendees
        }, status=status.HTTP_200_OK)
