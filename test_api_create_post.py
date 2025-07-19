#!/usr/bin/env python3
import requests
import json

# Test creating a new blog post via API
url = "http://localhost:8000/api/Post/post_blog/"
headers = {
    "Content-Type": "application/json",
}

# Test data for a new post
test_data = {
    "title": "Test Post with Categories and Tags",
    "content": "This is a test post to verify that categories and tags are properly assigned during creation.",
    "category": {
        "name": "Test Category",
    },
    "tag": [
        {"name": "test-tag-1"},
        {"name": "test-tag-2"}
    ],
    "is_published": True,
    "is_draft": False
}

print("Creating test post...")
print(f"Data: {json.dumps(test_data, indent=2)}")

try:
    response = requests.post(url, json=test_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")

    if response.status_code in [200, 201]:
        print("✅ Post created successfully!")

        # Check the created post
        post_data = response.json()
        print(f"Created post ID: {post_data.get('id', 'N/A')}")
        print(f"Category: {post_data.get('category', 'None')}")
        print(f"Tags: {post_data.get('tag', 'None')}")
    else:
        print("❌ Failed to create post")

except Exception as e:
    print(f"Error: {e}")
