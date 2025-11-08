from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, Job, Task, WorkSession, StickyNote,Update,Meeting

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Invalid credentials")

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

class TaskSerializer(serializers.ModelSerializer):
    job_name = serializers.CharField(source='job.name', read_only=True)
    job_company = serializers.CharField(source='job.company', read_only=True)
    job_color = serializers.CharField(source='job.color', read_only=True)
    
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

class WorkSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkSession
        fields = '__all__'

class StickyNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = StickyNote
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')


class ProfileSerializer(serializers.ModelSerializer):
    gmail_app_password = serializers.CharField(
        write_only=False, required=False, allow_blank=True, allow_null=True
    )
    first_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    last_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    gmail_address = serializers.EmailField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",            # ✅ added username
            "first_name",
            "last_name",
            "gmail_address",
            "gmail_app_password",
            "app_password",        # ✅ only if this is a field in your User model
        ]
        read_only_fields = ["email"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        # ✅ Don’t expose sensitive fields
        rep["gmail_app_password"] = ""   # hide gmail app password
        # rep["app_password"] = ""         # hide app password too
        return rep


class UpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Update
        fields = "__all__"
        read_only_fields = ("user", "created_at")



class MeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')