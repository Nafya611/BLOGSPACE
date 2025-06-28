#!/usr/bin/env python3
"""
Test script to verify DATABASE_URL parsing works correctly
"""
import os
import sys

def test_database_url_parsing():
    # Test cases
    test_urls = [
        "postgresql://user:pass@localhost:5432/mydb",
        "postgres://user:pass@hostname:5432/database_name",
        "postgresql://username:password@hostname.com:5432/db_name",
    ]

    for db_url in test_urls:
        print(f"\nTesting URL: {db_url}")

        # Set the environment variable
        os.environ['DATABASE_URL'] = db_url

        try:
            # Try to import dj_database_url (might not be installed)
            try:
                import dj_database_url
                parsed_dj = dj_database_url.parse(db_url)
                print(f"dj_database_url result: {parsed_dj}")
            except ImportError:
                print("dj_database_url not available")
            except Exception as e:
                print(f"dj_database_url error: {e}")

            # Manual parsing (our fallback)
            import urllib.parse as urlparse
            url = urlparse.urlparse(db_url)

            # Extract port with proper handling
            port = url.port
            if port is None:
                port = 5432
            elif isinstance(port, str):
                try:
                    port = int(port)
                except ValueError:
                    port = 5432

            manual_parsed = {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': url.path[1:] if url.path else '',
                'USER': url.username or '',
                'PASSWORD': url.password or '',
                'HOST': url.hostname or 'localhost',
                'PORT': port,
            }

            print(f"Manual parsing result: {manual_parsed}")
            print(f"Port type: {type(manual_parsed['PORT'])}, Port value: {manual_parsed['PORT']}")

        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_database_url_parsing()
