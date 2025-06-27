#!/usr/bin/env bash
# exit on error
set -o errexit

# This script is for Docker-based deployment on Render
echo "Starting Docker-based build process..."

# Install Python dependencies (if not using pure Docker)
if [ ! -f /.dockerenv ]; then
    echo "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
fi

# Navigate to Django project directory
cd BLOG

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --no-input

# Run migrations
echo "Running database migrations..."
python manage.py migrate

echo "Build completed successfully!"
