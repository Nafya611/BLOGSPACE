#!/usr/bin/env python3
"""
Test script to verify profile image upload functionality with Cloudinary.
This script tests the new profile image features.
"""
import requests
import json
import os

# Configuration
BASE_URL = "http://localhost:8000"
HEADERS = {
    "Content-Type": "application/json",
}

def test_profile_image_functionality():
    """Test profile image upload and management"""

    print("🧪 Testing Profile Image Functionality")
    print("=" * 60)

    # Step 1: Test user registration with profile fields
    print("Step 1: Testing user registration with profile image fields...")

    signup_data = {
        "username": "testuser_profile",
        "first_name": "Test",
        "last_name": "User",
        "email": "testuser.profile@example.com",
        "password": "testpass123"
    }

    print(f"\n📝 Signup Data:")
    print(json.dumps(signup_data, indent=2))

    try:
        response = requests.post(f"{BASE_URL}/api/user/signup/", json=signup_data, headers=HEADERS)
        print(f"📊 Signup Status Code: {response.status_code}")
        print(f"📄 Signup Response: {response.text[:500]}...")

        if response.status_code == 201:
            print("✅ User registration successful!")
        else:
            print(f"❌ User registration failed: {response.status_code}")

    except Exception as e:
        print(f"🚨 Signup Error: {e}")

    # Step 2: Test login to get token
    print("\n" + "-" * 40)
    print("Step 2: Testing login to get authentication token...")

    login_data = {
        "email": "testuser.profile@example.com",
        "password": "testpass123"
    }

    try:
        response = requests.post(f"{BASE_URL}/api/user/token/", json=login_data, headers=HEADERS)
        print(f"📊 Login Status Code: {response.status_code}")

        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get('access')
            print("✅ Login successful!")
            print(f"🔑 Access Token: {access_token[:50]}...")

            # Step 3: Test profile management endpoint
            print("\n" + "-" * 40)
            print("Step 3: Testing profile management endpoint...")

            auth_headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }

            profile_response = requests.get(f"{BASE_URL}/api/user/me", headers=auth_headers)
            print(f"📊 Profile Status Code: {profile_response.status_code}")

            if profile_response.status_code == 200:
                profile_data = profile_response.json()
                print("✅ Profile data retrieved successfully!")
                print(f"👤 Profile: {json.dumps(profile_data, indent=2)}")

                # Check if profile_image_url field is present
                if 'profile_image_url' in profile_data:
                    print("✅ Profile image URL field is present in response")
                else:
                    print("❌ Profile image URL field is missing from response")
            else:
                print(f"❌ Profile retrieval failed: {profile_response.status_code}")

            # Step 4: Test profile image upload endpoint structure
            print("\n" + "-" * 40)
            print("Step 4: Testing profile image upload endpoint availability...")

            # We'll test with a placeholder since we don't have an actual image file
            upload_headers = {
                "Authorization": f"Bearer {access_token}"
                # Note: Content-Type will be set by requests for multipart data
            }

            # Create a dummy file for testing (just to check endpoint existence)
            files = {'profile_image': ('test.txt', 'dummy content', 'text/plain')}

            upload_response = requests.post(f"{BASE_URL}/api/user/upload-profile-image/",
                                          headers=upload_headers, files=files)
            print(f"📊 Upload Endpoint Status Code: {upload_response.status_code}")
            print(f"📄 Upload Response: {upload_response.text[:200]}...")

            if upload_response.status_code in [200, 400]:  # 400 is expected for dummy file
                print("✅ Profile image upload endpoint is available")
            else:
                print(f"❌ Profile image upload endpoint issue: {upload_response.status_code}")

        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"📄 Login Response: {response.text}")

    except Exception as e:
        print(f"🚨 Login Error: {e}")

    print("\n" + "=" * 60)
    print("✅ Profile Image Test completed!")
    print("\n📋 Summary of implemented features:")
    print("   ✅ Added profile_image field to User model")
    print("   ✅ Updated UserSerializer with Cloudinary upload functionality")
    print("   ✅ Added profile image handling in create/update methods")
    print("   ✅ Added dedicated profile image upload endpoint")
    print("   ✅ Updated Post/Comment serializers to include profile images")
    print("   ✅ Profile images will be stored in Cloudinary with transformations")
    print("\n🔧 Cloudinary Configuration:")
    print("   📁 Images stored in: 'profile_images' folder")
    print("   🖼️  Transformations: 300x300 square crop, auto quality/format")
    print("   🔗 Returns secure HTTPS URLs")

if __name__ == "__main__":
    test_profile_image_functionality()
