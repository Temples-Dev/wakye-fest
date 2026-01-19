from rest_framework import serializers
from .models import Ticket

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['id', 'event', 'name', 'email', 'phone_number', 'paystack_reference', 'verified', 'checked_in', 'created_at', 'short_code']
        read_only_fields = ['id', 'verified', 'checked_in', 'created_at', 'short_code']

from .models import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'
