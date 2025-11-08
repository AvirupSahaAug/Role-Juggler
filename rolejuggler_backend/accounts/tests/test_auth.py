from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework import status

class TestRegistrationAPI(APITestCase):   # ✅ must start with “Test”
    def test_register_user_success(self):  # ✅ must start with “test_”
        url = reverse('register')          # adjust if your route name differs
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'StrongPass123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
