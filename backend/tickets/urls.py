from django.urls import path
from .views import VerifyPaymentView, TicketDetailView, DashboardStatsView, TransactionListView, InitiatePaymentView, EventSettingsView, CheckInView

urlpatterns = [
    path('initiate-payment/', InitiatePaymentView.as_view(), name='initiate-payment'),
    path('verify-payment/', VerifyPaymentView.as_view(), name='verify-payment'),
    path('ticket/<uuid:id>/', TicketDetailView.as_view(), name='ticket-detail'),
    path('stats/', DashboardStatsView.as_view(), name='stats'),
    path('transactions/', TransactionListView.as_view(), name='transactions-list'),
    path('settings/', EventSettingsView.as_view(), name='event-settings'),
    path('check-in/', CheckInView.as_view(), name='check-in'),
]
