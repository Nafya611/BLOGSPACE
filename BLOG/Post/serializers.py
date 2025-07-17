from rest_framework import serializers
from Core.models import Post,Tag,Category,Comment
from django.utils.text import slugify
import json
import os
import cloudinary
import cloudinary.uploader
from django.contrib.auth import get_user_model

User = get_user_model()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
    secure=True
)


class TagSerializer(serializers.ModelSerializer):
     class Meta:
          model=Tag
          fields=['id','name','slug']
          read_only_fields= ['id', 'slug']

     def create(self, validated_data):
          # Auto-generate slug from name
          validated_data['slug'] = slugify(validated_data['name'])
          return super().create(validated_data)


class CategorySerializer(serializers.ModelSerializer):
     class Meta:
          model=Category
          fields=['id','name','slug']
          read_only_fields=['id', 'slug']

     def create(self, validated_data):
          # Auto-generate slug from name
          validated_data['slug'] = slugify(validated_data['name'])
          return super().create(validated_data)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    class Meta:
        model=Comment
        fields=['id','content','created_at','is_approved','author']
        read_only_fields = ['id','created_at','is_approved','author']

class PostSerializer(serializers.ModelSerializer):
    tag = TagSerializer(many=True, required=False)
    category = CategorySerializer(required=False)
    author = UserSerializer(read_only=True)
    image = serializers.ImageField(write_only=True, required=False)  # For uploads
    image_url = serializers.URLField(source='image', read_only=True)  # For display

    class Meta:
        model = Post
        fields = [ 'title', 'slug', 'content', 'image', 'image_url', 'tag', 'category', 'author','created_at', 'updated_at','is_published', 'is_draft']
        read_only_fields = [ 'author','slug', 'created_at', 'updated_at', 'image_url']

    def to_representation(self, instance):
        """Convert model instance to representation, handling Cloudinary image URLs"""
        data = super().to_representation(instance)

        # Remove the write-only image field from the response
        data.pop('image', None)

        # The image_url field will be automatically populated from the URLField
        return data

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.partial:
            for field in self.fields.values():
                field.required = False

    def to_internal_value(self, data):
        """Convert incoming data, handling JSON strings from FormData"""
        # Make a mutable copy of the data
        if hasattr(data, '_mutable'):
            data._mutable = True

        # Handle JSON strings for category and tag when sent via FormData
        if 'category' in data and isinstance(data['category'], str):
            try:
                data['category'] = json.loads(data['category'])
            except (json.JSONDecodeError, TypeError):
                pass  # Keep as string if not valid JSON

        if 'tag' in data and isinstance(data['tag'], str):
            try:
                data['tag'] = json.loads(data['tag'])
            except (json.JSONDecodeError, TypeError):
                pass  # Keep as string if not valid JSON

        return super().to_internal_value(data)

    def _upload_to_cloudinary(self, image_file):
        """Upload image to Cloudinary and return the URL"""
        try:
            if image_file:
                # Get the file content and name
                file_content = image_file.read()
                file_name = getattr(image_file, 'name', 'upload')

                result = cloudinary.uploader.upload(
                    file_content,
                    folder="blog_images",
                    public_id=f"post_{file_name}_{hash(file_content)}",
                    resource_type="auto"
                )
                print(f"Cloudinary upload successful: {result['secure_url']}")
                return result['secure_url']
        except Exception as e:
            print(f"Cloudinary upload error: {e}")
            import traceback
            traceback.print_exc()
        return None

    def _get_or_create_tags(self, tags, post):
        """Handle getting or creating tags"""
        auth_user = self.context['request'].user
        if not tags:
            return
        for tag in tags:
            tag_obj, _ = Tag.objects.get_or_create(user=auth_user, **tag)
            post.tag.add(tag_obj)  # use `post.tag` (not post.tags)


    def create(self, validated_data):
        user = self.context['request'].user
        title = validated_data.get('title')
        slug = slugify(title)

        # Handle image upload to Cloudinary
        image_file = validated_data.pop('image', None)
        cloudinary_url = None
        if image_file:
            cloudinary_url = self._upload_to_cloudinary(image_file)

        # Handle JSON strings from FormData
        tags = validated_data.pop('tag', [])
        if isinstance(tags, str):
            try:
                tags = json.loads(tags)
            except json.JSONDecodeError:
                tags = []

        categories = validated_data.pop('category', None)
        if isinstance(categories, str):
            try:
                categories = json.loads(categories)
            except json.JSONDecodeError:
                categories = None

        # Ensure uniqueness of slug
        original_slug = slug
        counter = 1
        while Post.objects.filter(slug=slug).exists():
            slug = f"{original_slug}-{counter}"
            counter += 1

        # Create post
        post = Post.objects.create(
            author=user,
            slug=slug,
            **validated_data
        )

        # Set Cloudinary URL if upload was successful
        if cloudinary_url:
            post.image = cloudinary_url
            post.save()

        # Handle category (single ForeignKey)
        if categories:
            category_obj, _ = Category.objects.get_or_create(user=user, **categories)
            post.category = category_obj
            post.save()

        # handle tags
        self._get_or_create_tags(tags, post)

        return post

    def update(self, instance, validated_data):
        """Update post instance with validated data"""
        user = self.context['request'].user

        # Handle image upload to Cloudinary
        image_file = validated_data.pop('image', None)
        if image_file:
            cloudinary_url = self._upload_to_cloudinary(image_file)
            if cloudinary_url:
                instance.image = cloudinary_url

        # Handle JSON strings from FormData
        tags = validated_data.pop('tag', None)
        if isinstance(tags, str):
            try:
                tags = json.loads(tags)
            except json.JSONDecodeError:
                tags = None

        categories = validated_data.pop('category', None)
        if isinstance(categories, str):
            try:
                categories = json.loads(categories)
            except json.JSONDecodeError:
                categories = None

        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Handle category update (single ForeignKey)
        if categories is not None:
            if categories:
                category_obj, _ = Category.objects.get_or_create(user=user, **categories)
                instance.category = category_obj
            else:
                instance.category = None

        # Handle tags update
        if tags is not None:
            instance.tag.clear()  # Clear existing tags
            if tags:
                self._get_or_create_tags(tags, instance)

        instance.save()
        return instance