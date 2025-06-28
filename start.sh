#!/bin/sh

# Exit on any error
set -e

echo "Starting Django application..."

# Navigate to Django project directory
cd BLOG

# Simple database check - just try to connect without complex logic
if [ "$DATABASE_URL" ]; then
    echo "Database URL detected, running migrations..."
else
    echo "No DATABASE_URL found, using SQLite..."
fi

# Run migrations
echo "Running migrations..."
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
