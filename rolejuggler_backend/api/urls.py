from django.urls import path
from . import views
from .views import ProfileView
urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('jobs/', views.JobListCreateView.as_view(), name='job-list'),
    path('jobs/<int:pk>/', views.JobDetailView.as_view(), name='job-detail'),
    path('tasks/', views.TaskListCreateView.as_view(), name='task-list'),
    path('tasks/<int:pk>/', views.TaskDetailView.as_view(), name='task-detail'),
    path('sticky-notes/', views.StickyNoteListCreateView.as_view(), name='sticky-note-list'),
    path('sticky-notes/<int:pk>/', views.StickyNoteDetailView.as_view(), name='sticky-note-detail'),
    path("profile/", views.ProfileView.as_view(), name="profile"),
    
    path("emails/fetch-today/", views.fetch_today_emails, name="fetch-today-emails"),
    path('meetings/', views.MeetingListCreateView.as_view(), name='meeting-list'),
    path('meetings/<int:pk>/', views.MeetingDetailView.as_view(), name='meeting-detail'),
    
    # path('updates/', views.UpdateListView.as_view(), name='update-list'),
]