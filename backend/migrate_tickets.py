from tickets.models import Event, Ticket

# Create or get the default event
event, created = Event.objects.get_or_create(
    name="Waakye Fest 2026",
    defaults={
        'date': "Dec 24, 2026",
        'time': "10:00 AM - 10:00 PM",
        'location': "Ho Jubilee Park, Ho",
        'is_active': True
    }
)
if created:
    print(f"Created default event: {event.name}")
else:
    print(f"Using existing event: {event.name}")
    if not event.is_active:
        event.is_active = True
        event.save()
        print("Marked event as active.")

# Link orphaned tickets
orphaned = Ticket.objects.filter(event__isnull=True)
count = orphaned.count()
if count > 0:
    orphaned.update(event=event)
    print(f"Linked {count} tickets to {event.name}")
else:
    print("No orphaned tickets found.")
