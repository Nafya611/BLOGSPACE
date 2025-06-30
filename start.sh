#!/bin/sh

# Exit on any error
set -e

echo "Starting Django application..."

# Navigate to Django project directory
cd BLOG

# Simple database check - just try to connect without complex logic
if [ "$DATABASE_URL" ]; then
    echo "Database URL detected, running migrations..."
    echo "DATABASE_URL length: ${#DATABASE_URL}"
    # Don't print the full URL for security, just show if it's set
    echo "DATABASE_URL starts with: $(echo $DATABASE_URL | cut -c1-10)..."
else
    echo "No DATABASE_URL found, using SQLite..."
fi

# Run migrations
echo "Running migrations..."
# Test Django settings first
python -c "
import os
import django
# Use production settings on Render, simple settings as fallback
if os.environ.get('RENDER'):
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'BLOG.settings_production')
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'BLOG.settings')
try:
    django.setup()
    from django.conf import settings
    print('✅ Django settings loaded successfully')
    print(f'Database engine: {settings.DATABASES[\"default\"][\"ENGINE\"]}')
    if 'postgresql' in settings.DATABASES['default']['ENGINE']:
        print(f'Database name: {settings.DATABASES[\"default\"][\"NAME\"]}')
        print(f'Database host: {settings.DATABASES[\"default\"][\"HOST\"]}')
        print(f'Database port: {settings.DATABASES[\"default\"][\"PORT\"]} (type: {type(settings.DATABASES[\"default\"][\"PORT\"])})')
except Exception as e:
    print(f'❌ Django settings error: {e}')
    print('Trying fallback to simple settings...')
    try:
        os.environ['DJANGO_SETTINGS_MODULE'] = 'BLOG.settings_simple'
        django.setup()
        print('✅ Fallback settings loaded successfully')
    except Exception as fallback_error:
        print(f'❌ Fallback settings also failed: {fallback_error}')
        exit(1)
"

python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if it doesn't exist (optional)
echo "Checking for superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    print('No superuser found. You can create one later.')
else:
    print('Superuser already exists.')
" || echo "Could not check superuser status"

# Start the server
echo "Starting Django development server..."
python manage.py runserver 0.0.0.0:8000
