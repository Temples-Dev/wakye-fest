from django.urls import path
from .views import VerifyPaymentView, TicketDetailView, DashboardStatsView, TransactionListView, InitiatePaymentView, EventSettingsView, CheckInView
from .analytics_views import EventAnalyticsView, YearOverYearAnalyticsView
from .user_views import OrganizerListView, OrganizerCreateView, OrganizerDeleteView, CurrentUserView

urlpatterns = [
    path('initiate-payment/', InitiatePaymentView.as_view(), name='initiate-payment'),
    path('verify-payment/', VerifyPaymentView.as_view(), name='verify-payment'),
    path('ticket/<uuid:id>/', TicketDetailView.as_view(), name='ticket-detail'),
    path('stats/', DashboardStatsView.as_view(), name='stats'),
    path('transactions/', TransactionListView.as_view(), name='transactions-list'),
    path('settings/', EventSettingsView.as_view(), name='event-settings'),
    path('check-in/', CheckInView.as_view(), name='check-in'),
    path('analytics/events/', EventAnalyticsView.as_view(), name='analytics-events'),
    path('analytics/yoy/', YearOverYearAnalyticsView.as_view(), name='analytics-yoy'),
    path('organizers/', OrganizerListView.as_view(), name='organizer-list'),
    path('organizers/create/', OrganizerCreateView.as_view(), name='organizer-create'),
    path('organizers/<int:id>/', OrganizerDeleteView.as_view(), name='organizer-delete'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
]
