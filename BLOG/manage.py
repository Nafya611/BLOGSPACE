#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    # Check if DJANGO_SETTINGS_MODULE is already set
    if not os.environ.get('DJANGO_SETTINGS_MODULE'):
        # Use production settings if RENDER environment variable is set
        if os.environ.get('RENDER'):
            # Try simple settings first, fallback to production settings
            os.environ['DJANGO_SETTINGS_MODULE'] = 'BLOG.settings_simple'
        else:
            os.environ['DJANGO_SETTINGS_MODULE'] = 'BLOG.settings'
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
