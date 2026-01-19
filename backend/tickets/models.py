from django.db import models
import uuid

class Ticket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    paystack_reference = models.CharField(max_length=100)
    verified = models.BooleanField(default=False)
    checked_in = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.id}"

class EventSettings(models.Model):
    name = models.CharField(max_length=255, default="Waakye Fest 2026")
    date = models.CharField(max_length=100, default="Dec 24, 2026")
    time = models.CharField(max_length=100, default="10:00 AM - 10:00 PM")
    location = models.CharField(max_length=255, default="Ho Jubilee Park, Ho")
    
    def save(self, *args, **kwargs):
        # Singleton pattern: ensure only one instance exists
        if not self.pk and EventSettings.objects.exists():
             return EventSettings.objects.first()
        return super(EventSettings, self).save(*args, **kwargs)

    def __str__(self):
        return self.name
