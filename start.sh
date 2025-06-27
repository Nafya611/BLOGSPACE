#!/bin/sh

# Exit on any error
set -e

echo "Starting Django application..."

# Navigate to Django project directory
cd BLOG

# Wait for database to be ready (if using PostgreSQL)
if [ "$DATABASE_URL" ]; then
    echo "Waiting for database..."
    python -c "
import os
import sys
import time
import psycopg2
from urllib.parse import urlparse

max_attempts = 30
attempt = 0

if os.environ.get('DATABASE_URL'):
    url = urlparse(os.environ.get('DATABASE_URL'))
    while attempt < max_attempts:
        try:
            conn = psycopg2.connect(
                host=url.hostname,
                port=url.port,
                user=url.username,
                password=url.password,
                database=url.path[1:]
            )
            conn.close()
            print('Database is ready!')
            break
        except psycopg2.OperationalError:
            attempt += 1
            print(f'Database not ready, attempt {attempt}/{max_attempts}')
            time.sleep(2)
    else:
        print('Could not connect to database')
        sys.exit(1)
"
fi

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start the server
echo "Starting server..."
python manage.py runserver 0.0.0.0:8000
