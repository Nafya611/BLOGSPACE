import cloudinary
import cloudinary.uploader
from django.core.files.storage import Storage
from django.core.files.base import ContentFile
from django.conf import settings
import os


class CloudinaryStorage(Storage):
    """
    Custom storage backend for Cloudinary
    """

    def __init__(self):
        # Configure cloudinary
        cloudinary.config(
            cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
            api_key=os.environ.get('CLOUDINARY_API_KEY'),
            api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
            secure=True
        )

    def _save(self, name, content):
        """
        Save file to Cloudinary
        """
        try:
            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                content,
                public_id=f"blog_images/{name}",
                resource_type="auto"
            )
            # Return the public_id which will be used as the file name
            return result['public_id']
        except Exception as e:
            print(f"Cloudinary upload error: {e}")
            # Fallback to original name if upload fails
            return name

    def _open(self, name, mode='rb'):
        """
        Open file from Cloudinary
        """
        # For Cloudinary, we don't typically open files
        # We just return the URL when needed
        return ContentFile(b'')

    def delete(self, name):
        """
        Delete file from Cloudinary
        """
        try:
            cloudinary.uploader.destroy(name)
        except Exception as e:
            print(f"Cloudinary delete error: {e}")

    def exists(self, name):
        """
        Check if file exists in Cloudinary
        """
        try:
            result = cloudinary.api.resource(name)
            return True
        except:
            return False

    def url(self, name):
        """
        Return URL for the file
        """
        if not name:
            return None

        # If it's already a full URL, return as is
        if name.startswith(('http://', 'https://')):
            return name

        # Generate Cloudinary URL
        try:
            return cloudinary.utils.cloudinary_url(name)[0]
        except:
            return f"https://res.cloudinary.com/{os.environ.get('CLOUDINARY_CLOUD_NAME')}/image/upload/{name}"

    def size(self, name):
        """
        Return file size
        """
        try:
            result = cloudinary.api.resource(name)
            return result.get('bytes', 0)
        except:
            return 0
