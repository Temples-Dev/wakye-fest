from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .models import Ticket, Event
from .serializers import EventSerializer as BaseEventSerializer # Rename to avoid conflict if we define one here
from rest_framework import serializers

class EventAnalyticsSerializer(serializers.ModelSerializer):
    total_revenue = serializers.SerializerMethodField()
    tickets_sold = serializers.SerializerMethodField()
    checked_in = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = ['id', 'name', 'date', 'is_active', 'tickets_sold', 'checked_in', 'total_revenue']

    def get_tickets_sold(self, obj):
        return obj.tickets.count()

    def get_checked_in(self, obj):
        return obj.tickets.filter(checked_in=True).count()
        
    def get_total_revenue(self, obj):
        # Assuming 50 GHS per verified ticket
        return obj.tickets.filter(verified=True).count() * 50

class EventAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        events = Event.objects.all().order_by('-date') # Or created_at if date is string
        serializer = EventAnalyticsSerializer(events, many=True)
        return Response(serializer.data)

class YearOverYearAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Aggregate data for charts
        events = Event.objects.all().order_by('date')
        labels = [e.name for e in events]
        revenue_data = [e.tickets.filter(verified=True).count() * 50 for e in events]
        sales_data = [e.tickets.count() for e in events]
        
        return Response({
            'labels': labels,
            'revenue': revenue_data,
            'sales': sales_data
        })
