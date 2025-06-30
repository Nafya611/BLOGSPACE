#!/usr/bin/env python3
"""
Debug script to test DATABASE_URL parsing with various formats
"""
import urllib.parse as urlparse

def debug_database_url(db_url):
    print(f"\n=== Testing URL: {db_url} ===")

    try:
        url = urlparse.urlparse(db_url)
        print(f"Raw parsed components:")
        print(f"  scheme: {url.scheme}")
        print(f"  netloc: {url.netloc}")
        print(f"  hostname: {url.hostname}")
        print(f"  path: {url.path}")
        print(f"  username: {url.username}")
        print(f"  password: {'***' if url.password else None}")

        # Try to access port (this might fail)
        try:
            port = url.port
            print(f"  port (direct): {port} (type: {type(port)})")
        except ValueError as e:
            print(f"  port (direct): ERROR - {e}")

            # Manual extraction
            if ':' in url.netloc:
                netloc_parts = url.netloc.split(':')
                print(f"  netloc_parts: {netloc_parts}")
                if len(netloc_parts) >= 2:
                    port_str = netloc_parts[-1]
                    print(f"  port_str (raw): '{port_str}'")
                    # Clean port string
                    port_clean = ''.join(filter(str.isdigit, port_str))
                    print(f"  port_clean: '{port_clean}'")
                    if port_clean:
                        port = int(port_clean)
                        print(f"  port (manual): {port}")
                    else:
                        port = 5432
                        print(f"  port (default): {port}")
                else:
                    port = 5432
                    print(f"  port (default): {port}")
            else:
                port = 5432
                print(f"  port (default): {port}")

        # Final database config
        db_config = {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': url.path[1:] if url.path else '',
            'USER': url.username or '',
            'PASSWORD': url.password or '',
            'HOST': url.hostname or 'localhost',
            'PORT': port,
        }
        print(f"\nFinal config: {db_config}")
        print(f"Port type: {type(db_config['PORT'])}")

    except Exception as e:
        print(f"ERROR: {e}")

# Test various URL formats that might be causing issues
test_urls = [
    "postgresql://user:pass@localhost:5432/mydb",
    "postgres://user:pass@hostname:5432/database_name",
    "postgresql://username:password@hostname.com:port/db_name",  # This might be the problematic one
    "postgres://user:pass@host:port/db",  # Another potential issue
    "postgresql://user:pass@hostname/database",  # No port specified
]

if __name__ == "__main__":
    for test_url in test_urls:
        debug_database_url(test_url)
