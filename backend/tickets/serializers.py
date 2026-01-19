from rest_framework import serializers
from .models import Ticket

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['id', 'name', 'email', 'phone_number', 'paystack_reference', 'verified', 'checked_in', 'created_at', 'short_code']
        read_only_fields = ['id', 'verified', 'checked_in', 'created_at', 'short_code']

from .models import EventSettings

class EventSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventSettings
        fields = '__all__'
