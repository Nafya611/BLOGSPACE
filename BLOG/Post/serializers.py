from rest_framework import serializers
from Core.models import Post
from django.utils.text import slugify

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            if self.partial:
                for field in self.fields.values():
                    field.required = False

    def create(self, validated_data):
        user = self.context['request'].user
        title = validated_data.get('title')
        slug = slugify(title)

        # Ensure uniqueness
        original_slug = slug
        counter = 1
        while Post.objects.filter(slug=slug).exists():
            slug = f"{original_slug}-{counter}"
            counter += 1

        return Post.objects.create(author=user, slug=slug, **validated_data)