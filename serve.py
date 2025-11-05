import os
import threading
import http.server
import socketserver
import asyncio
import ssl
import argparse

from server import Client  # reuse existing Client class
from ws_base import BaseWebSocketServer

# ---------------- HTTP SERVER (static files) -----------------

class PermissiveHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    # Serve from specified directory and add very permissive headers.
    def __init__(self, *args, directory: str = '.', **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def end_headers(self):
        # Add permissive CORS / cache disabling headers.
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

def start_http_server(port: int, directory: str):
    handler_cls = lambda *a, **kw: PermissiveHTTPRequestHandler(*a, directory=directory, **kw)
    httpd = socketserver.ThreadingTCPServer(("0.0.0.0", port), handler_cls)
    print(f"[HTTP] Serving static files (permissive) from {directory} on http://0.0.0.0:{port}")
    httpd.serve_forever()

# ---------------- TLS / WS helper -----------------

def build_ssl_context(cert_file: str, key_file: str) -> ssl.SSLContext:
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.load_cert_chain(certfile=cert_file, keyfile=key_file)
    ctx.options |= ssl.OP_NO_SSLv2 | ssl.OP_NO_SSLv3 | ssl.OP_NO_COMPRESSION
    ctx.set_ciphers("ECDHE+AESGCM:ECDHE+CHACHA20:@STRENGTH")
    return ctx

# ---------------- Main orchestration -----------------

def main():
    parser = argparse.ArgumentParser(description="Run combined HTTP + WebSocket server.")
    parser.add_argument('--http-port', type=int, default=int(os.environ.get('HTTP_PORT', 8080)))
    parser.add_argument('--ws-port', type=int, default=int(os.environ.get('WS_PORT', 8765)))
    parser.add_argument('--ws-host', default=os.environ.get('WS_HOST', '0.0.0.0'))
    parser.add_argument('--cert', default=os.environ.get('WS_CERT'))
    parser.add_argument('--key', default=os.environ.get('WS_KEY'))
    parser.add_argument('--static-dir', default=os.environ.get('STATIC_DIR', '.'))
    args = parser.parse_args()

    # Launch HTTP server in a background thread
    http_thread = threading.Thread(target=start_http_server, args=(args.http_port, args.static_dir), daemon=True)
    http_thread.start()

    # Setup optional TLS for websocket server
    ssl_ctx = None
    if args.cert and args.key:
        if os.path.exists(args.cert) and os.path.exists(args.key):
            try:
                ssl_ctx = build_ssl_context(args.cert, args.key)
                print("[WS] TLS enabled (wss).")
            except Exception as exc:
                print(f"[WS] WARN: Failed to initialize TLS ({exc}); continuing with ws.")
        else:
            print(f"[WS] WARN: Cert or key not found at {args.cert} / {args.key}; starting without TLS.")

    scheme = 'wss' if ssl_ctx else 'ws'
    print(f"[WS] Starting websocket server on {scheme}://{args.ws_host}:{args.ws_port}")

    server = BaseWebSocketServer(args.ws_host, args.ws_port, Client, ssl_context=ssl_ctx)

    try:
        asyncio.run(server.start())
    except KeyboardInterrupt:
        try:
            asyncio.run(server.shutdown())
        except Exception:
            pass


if __name__ == '__main__':
    main()
