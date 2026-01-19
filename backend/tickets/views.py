from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from django.conf import settings
from .models import Ticket
from .serializers import TicketSerializer
import requests
import os

class InitiatePaymentView(APIView):
    def post(self, request):
        reference = request.data.get('reference')
        email = request.data.get('email')
        phone_number = request.data.get('phone_number')
        names = request.data.get('names', [])
        name = request.data.get('name') # Fallback if single name

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
                 
                 for attendee_name in names:
                    Ticket.objects.create(
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
        total_tickets = Ticket.objects.count()
        verified_tickets = Ticket.objects.filter(verified=True).count()
        # Revenue: Assuming fixed price of 50 GHS per ticket for now as per frontend
        # In a real app, we should store price in the Ticket model or Transaction model
        total_revenue = verified_tickets * 50 
        
        recent_sales = Ticket.objects.filter(verified=True).order_by('-created_at')[:5]
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

