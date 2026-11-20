#!/usr/bin/env python3
"""
RailPulse AI - Local Development Preview Server
Launches a local HTTP server with correct MIME types and auto-opens default browser.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and disable aggressive caching for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def main():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}"
        print("=" * 60)
        print("   🚆 RailPulse AI - Where Is My Train Reality Tracker")
        print("=" * 60)
        print(f"Server running at: {url}")
        print("Press Ctrl+C to terminate.")
        print("-" * 60)
        try:
            webbrowser.open(url)
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down RailPulse AI server.")
            sys.exit(0)

if __name__ == "__main__":
    main()
