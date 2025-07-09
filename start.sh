#!/bin/bash

# Exit on any error
set -e

echo "Starting Django Blog API..."

# Change to Django project directory
cd /app/BLOG

# Wait for database to be ready (for production)
echo "Waiting for database..."
python << END
import sys
import time
import os
import django

# Setup Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'BLOG.settings')
django.setup()

from django.db import connections
from django.db.utils import OperationalError

db_conn = connections['default']
tries = 0
while tries < 30:
    try:
        db_conn.ensure_connection()
        break
    except OperationalError:
        tries += 1
        print(f"Database unavailable, waiting... ({tries}/30)")
        time.sleep(1)
else:
    print("Database not available after 30 seconds!")
    sys.exit(1)

print("Database is ready!")
END

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if it doesn't exist (optional)
echo "Creating superuser if needed..."
python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin@example.com', 'admin123')
    print("Superuser created: admin@example.com / admin123")
else:
    print("Superuser already exists")
END

# Start gunicorn
echo "Starting gunicorn server..."
exec gunicorn BLOG.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
