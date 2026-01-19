from django.db import models
import uuid

class Event(models.Model):
    name = models.CharField(max_length=255, default="Waakye Fest 2026")
    date = models.CharField(max_length=100, default="Dec 24, 2026")
    time = models.CharField(max_length=100, default="10:00 AM - 10:00 PM")
    location = models.CharField(max_length=255, default="Ho Jubilee Park, Ho")
    is_active = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name

class Ticket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='tickets', null=True, blank=True)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    paystack_reference = models.CharField(max_length=100)
    verified = models.BooleanField(default=False)
    checked_in = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    short_code = models.CharField(max_length=8, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.short_code:
            import random
            import string
            while True:
                # Generate custom 8-char alphanumeric code (e.g. AB12CD34)
                code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
                if not Ticket.objects.filter(short_code=code).exists():
                    self.short_code = code
                    break
        super(Ticket, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.short_code}"
