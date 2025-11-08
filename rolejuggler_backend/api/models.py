from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

class User(AbstractUser):
    email = models.EmailField(_('email address'), unique=True)
    
    # Optional profile fields
    first_name = models.CharField(max_length=150, blank=True, null=True)
    last_name = models.CharField(max_length=150, blank=True, null=True)

    # Gmail integration fields
    gmail_address = models.EmailField(blank=True, null=True)
    gmail_app_password = models.CharField(max_length=255, blank=True, null=True)
    app_password = models.CharField(max_length=128, blank=True, null=True)

    def __str__(self):
        return self.email

class Job(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='jobs')
    name = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default='#3B82F6')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.company}"

class Task(models.Model):
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in-progress', 'In Progress'),
        ('done', 'Done'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    deadline = models.DateField(null=True, blank=True)
    total_time_spent = models.IntegerField(default=0)  # in milliseconds
    last_worked_on = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

class Meeting(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meetings')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='meetings', null=True, blank=True)
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255, blank=True, null=True)
    meeting_date = models.DateField()  # Date of the meeting
    meeting_time = models.TimeField()  # Time of the meeting
    duration = models.IntegerField(default=60)  # Duration in minutes
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['meeting_date', 'meeting_time']
    
    def __str__(self):
        return f"{self.title} - {self.meeting_date} {self.meeting_time}"

class WorkSession(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='work_sessions')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    duration = models.IntegerField(default=0)  # in milliseconds
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.task.title} - {self.start_time}"

class StickyNote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sticky_notes')
    content = models.TextField()
    color = models.CharField(max_length=7, default='#FEF3C7')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.content[:50] + "..." if len(self.content) > 50 else self.content

class Update(models.Model):
    TYPE_CHOICES = [
        ("task", "Task"),
        ("meeting", "Meeting"),
        ("email", "Email"),
        ("other", "Other"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="updates")
    title = models.CharField(max_length=255)
    message = models.TextField(blank=True, null=True)
    source = models.CharField(max_length=100, default="email")
    sender = models.CharField(max_length=255, blank=True, null=True)
    received_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="email")
    linked_task = models.BooleanField(default=False)

    # ✅ new fields
    deadline = models.DateTimeField(blank=True, null=True)
    company = models.CharField(max_length=255, blank=True, null=True)
    
    # Meeting specific fields (for meetings extracted from emails)
    meeting_date = models.DateField(blank=True, null=True)
    meeting_time = models.TimeField(blank=True, null=True)

    class Meta:
        ordering = ["-received_at"]
        indexes = [
            models.Index(fields=["user", "received_at"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.user})"