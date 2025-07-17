import os
import cloudinary
import cloudinary.uploader

# Test Cloudinary configuration
def test_cloudinary():
    cloudinary.config(
        cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
        api_key=os.environ.get('CLOUDINARY_API_KEY'),
        api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
        secure=True
    )

    print(f"Cloud Name: {os.environ.get('CLOUDINARY_CLOUD_NAME')}")
    print(f"API Key: {os.environ.get('CLOUDINARY_API_KEY')}")
    print(f"API Secret: {'*' * len(os.environ.get('CLOUDINARY_API_SECRET', ''))}")

    try:
        # Test upload with a simple text file
        result = cloudinary.uploader.upload(
            "data:text/plain;base64,SGVsbG8gV29ybGQ=",  # "Hello World" in base64
            public_id="test_upload",
            resource_type="raw"
        )
        print("✅ Cloudinary connection successful!")
        print(f"Upload result: {result['secure_url']}")

        # Clean up test file
        cloudinary.uploader.destroy("test_upload", resource_type="raw")
        return True
    except Exception as e:
        print(f"❌ Cloudinary connection failed: {e}")
        return False

if __name__ == "__main__":
    test_cloudinary()
