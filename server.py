"""
CloudAgri Studio - Local Web Server
Autonomous Precision Agriculture & Farm Twin Simulator
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

def main():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), QuietHandler) as httpd:
        url = f"http://localhost:{PORT}"
        print("=" * 65)
        print("   CLOUDAGRI STUDIO - PRECISION AGRICULTURE & FARM TWIN")
        print("=" * 65)
        print(f"[*] Server active at: {url}")
        print(f"[*] Serving files from: {DIRECTORY}")
        print("[*] Press Ctrl+C in this terminal to stop.")
        print("=" * 65)
        
        webbrowser.open(url)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[!] Stopping server. Goodbye!")
            sys.exit(0)

if __name__ == "__main__":
    main()
