#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the path
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'BLOG.settings')

django.setup()

from Core.models import Post, Category, Tag

def check_database_status():
    print(f"Posts without category: {Post.objects.filter(category__isnull=True).count()}")
    print(f"Posts without tags: {Post.objects.filter(tag__isnull=True).count()}")
    print(f"Total posts: {Post.objects.count()}")
    print(f"Total categories: {Category.objects.count()}")
    print(f"Total tags: {Tag.objects.count()}")

if __name__ == "__main__":
    check_database_status()
