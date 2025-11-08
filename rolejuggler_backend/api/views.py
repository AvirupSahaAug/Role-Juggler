from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from django.db import IntegrityError
from .models import User, Job, Task, WorkSession, StickyNote,Meeting
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer, 
    JobSerializer, TaskSerializer, WorkSessionSerializer, StickyNoteSerializer
)



# views.py
# from rest_framework import generics, permissions
from .serializers import ProfileSerializer
from .models import User

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Always return the logged-in user
        return self.request.user
    
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response
# from rest_framework import status
# from .serializers import ProfileSerializer

# @api_view(['GET', 'PATCH'])
# @permission_classes([IsAuthenticated])
# def profile_view(request):
#     user = request.user
#     if request.method == 'GET':
#         serializer = ProfileSerializer(user)
#         return Response(serializer.data)
#     elif request.method == 'PATCH':
#         serializer = ProfileSerializer(user, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)







@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key
            }, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response(
                {'error': 'Username or email already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout_view(request):
    request.auth.delete()
    return Response(status=status.HTTP_200_OK)

class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Job.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Job.objects.filter(user=self.request.user)

class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

class StickyNoteListCreateView(generics.ListCreateAPIView):
    serializer_class = StickyNoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return StickyNote.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class StickyNoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StickyNoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return StickyNote.objects.filter(user=self.request.user)
    




# views.py (append)import imaplibfrom rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from django.db import IntegrityError
from .models import User, Job, Task, WorkSession, StickyNote, Update, Meeting
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer, 
    JobSerializer, TaskSerializer, WorkSessionSerializer, 
    StickyNoteSerializer, UpdateSerializer, MeetingSerializer
)
import imaplib
import email
from email.header import decode_header
import datetime
import json
import google.generativeai as genai
from django.utils import timezone
from django.db import transaction
import re

# Configure Gemini API
GEMINI_API_KEY = 
genai.configure(api_key=GEMINI_API_KEY)

def extract_meeting_datetime(subject):
    """Extract meeting date and time from subject using regex"""
    try:
        # Common date patterns
        date_patterns = [
            r'(\d{1,2}/\d{1,2}/\d{4})',  # MM/DD/YYYY
            r'(\d{1,2}-\d{1,2}-\d{4})',  # MM-DD-YYYY
            r'(\d{1,2} \w+ \d{4})',      # DD Month YYYY
        ]
        
        # Time patterns
        time_patterns = [
            r'(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))',
            r'(\d{1,2}\s*(?:AM|PM|am|pm))',
        ]
        
        meeting_date = None
        meeting_time = None
        
        # Try to extract date
        for pattern in date_patterns:
            match = re.search(pattern, subject)
            if match:
                date_str = match.group(1)
                try:
                    # Try different date formats
                    for fmt in ['%m/%d/%Y', '%m-%d-%Y', '%d %B %Y', '%d %b %Y']:
                        try:
                            meeting_date = datetime.datetime.strptime(date_str, fmt).date()
                            break
                        except ValueError:
                            continue
                except:
                    pass
        
        # Try to extract time
        for pattern in time_patterns:
            match = re.search(pattern, subject)
            if match:
                time_str = match.group(1)
                try:
                    meeting_time = datetime.datetime.strptime(time_str.upper(), '%I:%M %p').time()
                except ValueError:
                    try:
                        meeting_time = datetime.datetime.strptime(time_str.upper(), '%I %p').time()
                    except ValueError:
                        pass
        
        return meeting_date, meeting_time
    except Exception as e:
        print(f"Error extracting meeting datetime: {e}")
        return None, None

def parse_email_with_gemini(subject, from_header):
    """Parse email content with Gemini API"""
    try:
        prompt = f"""
        Based ONLY on the email subject and sender, extract this information as JSON:
        - detailed_task_title: Create a meaningful title from the subject (max 8 words)
        - company_name: Extract company name from sender email domain
        - type: Classify as "email", "meeting", or "task" based on subject keywords
        - deadline: For tasks, use 3 days from today. For meetings, try to extract date from subject.

        Subject: {subject}
        Sender: {from_header}

        Return ONLY JSON with keys: detailed_task_title, company_name, type, deadline
        """
        
        model = genai.GenerativeModel('models/gemini-2.0-flash-lite')
        response = model.generate_content(prompt)
        
        response_text = response.text.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        parsed_data = json.loads(response_text)
        
        # Validate and set defaults
        if not parsed_data.get('detailed_task_title'):
            parsed_data['detailed_task_title'] = subject[:255] if subject else "Untitled"
        
        if not parsed_data.get('company_name'):
            if '@' in from_header:
                domain = from_header.split('@')[1]
                company = domain.split('.')[0].title()
                parsed_data['company_name'] = company
            else:
                parsed_data['company_name'] = "Unknown"
        
        # Type validation
        valid_types = ['email', 'meeting', 'task']
        if parsed_data.get('type') not in valid_types:
            lower_subj = subject.lower() if subject else ""
            if any(word in lower_subj for word in ['meeting', 'call', 'zoom', 'schedule', 'calendar']):
                parsed_data['type'] = 'meeting'
            elif any(word in lower_subj for word in ['task', 'action', 'todo', 'follow up']):
                parsed_data['type'] = 'task'
            else:
                parsed_data['type'] = 'email'
        
        # Deadline handling
        if parsed_data['type'] == 'meeting':
            # For meetings, try to extract date from subject
            meeting_date, meeting_time = extract_meeting_datetime(subject)
            if meeting_date:
                # Set deadline to meeting date at 5 PM
                parsed_data['deadline'] = timezone.make_aware(
                    datetime.datetime.combine(meeting_date, meeting_time or datetime.time(17, 0))
                )
            else:
                # Default to 3 days from now for meetings without clear date
                parsed_data['deadline'] = timezone.now() + datetime.timedelta(days=3)
        else:
            # For tasks/emails, always 3 days from now
            parsed_data['deadline'] = timezone.now() + datetime.timedelta(days=3)
        
        parsed_data['deadline'] = parsed_data['deadline'].replace(hour=17, minute=0, second=0, microsecond=0)
        
        return parsed_data
        
    except Exception as e:
        print(f"Gemini parsing failed: {e}")
        return {
            'detailed_task_title': subject[:255] if subject else "Untitled",
            'company_name': from_header.split('@')[1].split('.')[0].title() if '@' in from_header else "Unknown",
            'type': 'email',
            'deadline': timezone.now() + datetime.timedelta(days=3)
        }

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def fetch_today_emails(request):
    user = request.user
    gmail_addr = getattr(user, "email", None)
    gmail_app_pwd = getattr(user, "app_password", None)

    if not gmail_addr or not gmail_app_pwd:
        return Response({"detail": "Gmail credentials not configured."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        imap = imaplib.IMAP4_SSL("imap.gmail.com", 993)
        imap.login(gmail_addr, gmail_app_pwd)
    except Exception as e:
        return Response({"detail": "IMAP login failed."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        imap.select("INBOX")
        today = datetime.date.today()
        date_str = today.strftime("%d-%b-%Y")
        status_code, data = imap.search(None, '(SINCE "{}")'.format(date_str))

        update_results = []  # This will store Update objects
        meeting_results = []  # This will store Meeting objects (for internal use)
        
        if status_code != "OK":
            imap.logout()
            return Response({"detail": "IMAP search failed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        mail_ids = data[0].split()
        for mid in reversed(mail_ids):
            status_code, msg_data = imap.fetch(mid, "(RFC822.HEADER)")
            if status_code != "OK":
                continue
            
            raw_email = msg_data[0][1]
            msg = email.message_from_bytes(raw_email)

            # Decode subject
            subj, encoding = decode_header(msg.get("Subject") or "")[0]
            if isinstance(subj, bytes):
                subject = subj.decode(encoding or "utf-8", errors="ignore")
            else:
                subject = subj or ""

            from_header = msg.get("From") or ""
            date_header = msg.get("Date")
            
            # Parse date
            try:
                parsed_date = email.utils.parsedate_to_datetime(date_header) if date_header else timezone.now()
                if parsed_date.tzinfo is None:
                    parsed_date = timezone.make_aware(parsed_date)
            except Exception:
                parsed_date = timezone.now()

            # Basic relevance check
            lower_subj = subject.lower() if subject else ""
            keywords = ["project", "meeting", "call", "proposal", "agenda", "update", "task", "action", "todo"]
            relevant = any(k in lower_subj for k in keywords)
            
            if not relevant:
                continue

            # Parse with Gemini
            parsed_data = parse_email_with_gemini(subject, from_header)

            # Extract meeting date/time if it's a meeting
            meeting_date = None
            meeting_time = None
            if parsed_data['type'] == 'meeting':
                meeting_date, meeting_time = extract_meeting_datetime(subject)

            with transaction.atomic():
                # Create Update - THIS IS WHAT SHOULD BE RETURNED
                upd = Update.objects.create(
                    user=user,
                    title=parsed_data['detailed_task_title'][:255],
                    message=f"From: {from_header}",
                    source="email",
                    sender=from_header,
                    received_at=parsed_date,
                    type=parsed_data['type'],
                    linked_task=False,
                    deadline=parsed_data['deadline'],
                    company=parsed_data['company_name'][:255],
                    meeting_date=meeting_date,
                    meeting_time=meeting_time
                )
                
                # Add the update to results
                update_results.append(upd)
                
                # If it's a meeting, also create a Meeting entry
                if parsed_data['type'] == 'meeting':
                    # Use extracted date/time or default values
                    meeting_date_value = meeting_date or (timezone.now() + datetime.timedelta(days=1)).date()
                    meeting_time_value = meeting_time or datetime.time(10, 0)  # Default 10 AM
                    
                    # Check if meeting already exists (same title and similar date - within 7 days)
                    existing_meeting = Meeting.objects.filter(
                        user=user,
                        title=parsed_data['detailed_task_title'][:255],
                        meeting_date__gte=meeting_date_value - datetime.timedelta(days=7),
                        meeting_date__lte=meeting_date_value + datetime.timedelta(days=7)
                    ).first()
                    
                    if not existing_meeting:
                        # Find or create a job based on company
                        job = None
                        company_name = parsed_data['company_name']
                        if company_name != "Unknown":
                            job, created = Job.objects.get_or_create(
                                user=user,
                                company=company_name,
                                defaults={
                                    'name': f"{company_name} Work",
                                    'color': '#3B82F6'
                                }
                            )
                        
                        meeting_obj = Meeting.objects.create(
                            user=user,
                            job=job,
                            title=parsed_data['detailed_task_title'][:255],
                            company=company_name,
                            meeting_date=meeting_date_value,
                            meeting_time=meeting_time_value,
                            duration=60,  # Default 1 hour
                            description=f"Automatically created from email: {subject}"
                        )
                        meeting_results.append(meeting_obj)

        imap.logout()
        # Return Update objects, not Meeting objects
        serializer = UpdateSerializer(update_results, many=True)
        print(serializer.data)
        return Response(serializer.data)

    except Exception as e:
        try:
            imap.logout()
        except:
            pass
        print(f"Error fetching emails: {e}")
        return Response({"detail": "Error fetching emails."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# Meeting Views

class MeetingListCreateView(generics.ListCreateAPIView):
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Return ALL meetings from today onwards (not just today's)
        today = timezone.now().date()
        return Meeting.objects.filter(
            user=self.request.user, 
            meeting_date__gte=today
        ).order_by('meeting_date', 'meeting_time')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MeetingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Meeting.objects.filter(user=self.request.user)

# Existing views remain the same...
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

# @api_view(['POST'])
# @permission_classes([permissions.AllowAny])
# def register(request):
#     serializer = RegisterSerializer(data=request.data)
#     if serializer.is_valid():
#         try:
#             user = serializer.save()
#             token, created = Token.objects.get_or_create(user=user)
#             return Response({
#                 'user': UserSerializer(user).data,
#                 'token': token.key
#             }, status=status.HTTP_201_CREATED)
#         except IntegrityError:
#             return Response(
#                 {'error': 'Username or email already exists'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['POST'])
# @permission_classes([permissions.AllowAny])
# def login_view(request):
#     serializer = LoginSerializer(data=request.data)
#     if serializer.is_valid():
#         user = serializer.validated_data
#         token, created = Token.objects.get_or_create(user=user)
#         return Response({
#             'user': UserSerializer(user).data,
#             'token': token.key
#         })
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)