"""Serves the repo for export.html and saves what the page POSTs into scripts/night-desk/export/."""
import http.server, socketserver, os
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(HERE, 'export')
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=REPO, **k)
    def log_message(self, *a): pass
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()
    def guess_type(self, path):
        return 'application/javascript' if path.endswith(('.js', '.mjs')) else super().guess_type(path)
    def do_POST(self):
        os.makedirs(OUT, exist_ok=True)
        name = os.path.basename(self.path.split('?')[0])
        n = int(self.headers['Content-Length'])
        with open(os.path.join(OUT, name), 'wb') as f: f.write(self.rfile.read(n))
        self.send_response(200); self.end_headers(); self.wfile.write(b'ok')
socketserver.TCPServer.allow_reuse_address = True
print('open http://127.0.0.1:3016/scripts/night-desk/export.html')
with socketserver.ThreadingTCPServer(('127.0.0.1', 3016), H) as s: s.serve_forever()
