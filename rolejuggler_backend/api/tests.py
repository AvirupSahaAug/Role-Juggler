from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
User = get_user_model()

class TestAuthAPI(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')  # path('register/', ...)
        self.login_url = reverse('login')        # path('login/', ...)
        self.user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPass123!",
            "password2": "TestPass123!"
        }

    # --------------------------
    # ✅ Registration Tests
    # --------------------------
    def test_register_user_success(self):
        """✅ Successful user registration"""
        response = self.client.post(self.register_url, self.user_data, format='json')
        print("Response Data:", response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], self.user_data['username'])
        self.assertIn('token', response.data)

    def test_register_user_password_mismatch(self):
        """❌ Password mismatch should fail"""
        data = self.user_data.copy()
        data["password2"] = "WrongPass123!"
        response = self.client.post(self.register_url, data, format='json')
        print("Response Data:", response.data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_user_missing_email(self):
        """❌ Missing email should fail"""
        data = self.user_data.copy()
        data.pop("email")
        response = self.client.post(self.register_url, data, format='json')
        print("Response Data:", response.data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_user_duplicate_username(self):
        """❌ Duplicate username should fail"""
        self.client.post(self.register_url, self.user_data, format='json')
        response = self.client.post(self.register_url, self.user_data, format='json')
        print("Response Data:", response.data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # --------------------------
    # ✅ Login Tests
    # --------------------------
    def test_login_user_success(self):
        """✅ Successful login"""
        # First register
        self.client.post(self.register_url, self.user_data, format='json')
        # Then login
        login_data = {
            "username": self.user_data["username"],
            "password": self.user_data["password"]
        }
        response = self.client.post(self.login_url, login_data, format='json')
        print("Response Data:", response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_login_user_wrong_password(self):
        """❌ Invalid password should fail"""
        self.client.post(self.register_url, self.user_data, format='json')
        login_data = {
            "username": self.user_data["username"],
            "password": "WrongPass!"
        }
        response = self.client.post(self.login_url, login_data, format='json')
        print("Response Data:", response.data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_user_not_registered(self):
        """❌ Login before registration should fail"""
        login_data = {
            "username": "unknown",
            "password": "TestPass123!"
        }
        response = self.client.post(self.login_url, login_data, format='json')
        print("Response Data:", response.data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # --------------------------
    # ✅ Token / Auth Edge Cases
    # --------------------------
    def test_login_requires_username_and_password(self):
        """❌ Missing fields on login"""
        response = self.client.post(self.login_url, {}, format='json')
        print("Response Data:", response.data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_case_insensitive_username(self):
        """✅ Login with uppercase username"""
        self.client.post(self.register_url, self.user_data, format='json')
        login_data = {
            "username": self.user_data["username"].upper(),
            "password": self.user_data["password"]
        }
        response = self.client.post(self.login_url, login_data, format='json')
        print("Response Data:", response.data)
        # Depending on your logic, this may pass or fail:
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])

    def test_registered_user_exists_in_db(self):
        """✅ Confirm user saved to database"""
        self.client.post(self.register_url, self.user_data, format='json')
        self.assertTrue(User.objects.filter(username=self.user_data["username"]).exists())
    def test_register_with_empty_fields(self):
        """❌ Registration with empty username, email, and password"""
        url = reverse("register")
        data = {"username": "", "email": "", "password": ""}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data)
        self.assertIn("email", response.data)
        self.assertIn("password", response.data)

    def test_login_case_sensitivity(self):
        """🔠 Login should be case-sensitive for username"""
        # Register user
        reg_url = reverse("register")
        self.client.post(reg_url, self.user_data, format="json")
        # Try logging in with uppercased username
        login_url = reverse("login")
        bad_creds = {"username": self.user_data["username"].upper(), "password": self.user_data["password"]}
        response = self.client.post(login_url, bad_creds, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid credentials", str(response.data))

    def test_register_with_long_username(self):
        """🚨 Registration should fail if username is too long"""
        url = reverse("register")
        data = {
            "username": "x" * 200,
            "email": "longuser@example.com",
            "password": "StrongPass123",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data)

    def test_login_after_user_deletion(self):
        """🧨 Login fails if user is deleted after registration"""
        reg_url = reverse("register")
        self.client.post(reg_url, self.user_data, format="json")
        User.objects.filter(username=self.user_data["username"]).delete()
        login_url = reverse("login")
        response = self.client.post(login_url, self.user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid credentials", str(response.data))

    def test_multiple_failed_logins_then_success(self):
        """⚠️ Multiple failed logins followed by success"""
        reg_url = reverse("register")
        self.client.post(reg_url, self.user_data, format="json")
        login_url = reverse("login")

        # 3 wrong attempts
        for _ in range(3):
            bad_data = {"username": self.user_data["username"], "password": "wrongpass"}
            r = self.client.post(login_url, bad_data, format="json")
            self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

        # Then correct login
        good_data = {"username": self.user_data["username"], "password": self.user_data["password"]}
        final_response = self.client.post(login_url, good_data, format="json")
        self.assertEqual(final_response.status_code, status.HTTP_200_OK)
        self.assertIn("token", final_response.data)
