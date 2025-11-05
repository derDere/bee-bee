import asyncio
import argparse
import os
import ssl
from ws_base import BaseWebSocketServer, BaseClient


class Client(BaseClient):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.x = 300
        self.y = 300
        self.laser_on = False
        self.laser_x = 0
        self.laser_y = 0
        self.first_message = True

    async def on_message(self, msg):
        if self.first_message:
            self.first_message = False
            print(f"Client {self.id} connected")
        #if isinstance(msg, str):
        #    if msg == "ping":
        #        self.send("pong")
        #    elif msg == "PING":
        #        others = await self.get_others()
        #        for c in others:
        #            c.send("PONG")
        #        self.send("PONG")
        #elif isinstance(msg, (dict, list)):
        #    self.send(msg)

        if msg == "who":
            self.send({"me": self.id, "x": self.x, "y": self.y})
            #print(f"Client {self.id} identified itself")

        if "x" in msg and "y" in msg and "laser_on" in msg and "laser_x" in msg and "laser_y" in msg:
            #print(f"Client {self.id} moved to ({msg['x']}, {msg['y']})")
            self.x = msg["x"]
            self.y = msg["y"]
            self.laser_on = msg["laser_on"]
            self.laser_x = msg["laser_x"]
            self.laser_y = msg["laser_y"]
            others = await self.get_others()
            update_msg = {"id": self.id, "x": self.x, "y": self.y, "laser_on": self.laser_on,
                          "laser_x": self.laser_x, "laser_y": self.laser_y}
            for c in others:
                c.send(update_msg)


def build_ssl_context(cert_file: str, key_file: str) -> ssl.SSLContext:
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.load_cert_chain(certfile=cert_file, keyfile=key_file)
    # Reasonable defaults / hardening tweaks
    ctx.options |= ssl.OP_NO_SSLv2 | ssl.OP_NO_SSLv3 | ssl.OP_NO_COMPRESSION
    ctx.set_ciphers("ECDHE+AESGCM:ECDHE+CHACHA20:@STRENGTH")
    return ctx


def main():
    parser = argparse.ArgumentParser(description="Run the Bee WebSocket server (ws or wss).")
    parser.add_argument('--host', default='0.0.0.0', help='Interface to bind (default: 0.0.0.0)')
    parser.add_argument('--port', type=int, default=8765, help='Port to listen on (default: 8765)')
    parser.add_argument('--cert', default=os.environ.get('WS_CERT'), help='Path to TLS certificate (PEM).')
    parser.add_argument('--key', default=os.environ.get('WS_KEY'), help='Path to TLS private key (PEM).')
    args = parser.parse_args()

    ssl_ctx = None
    if args.cert and args.key:
        if not (os.path.exists(args.cert) and os.path.exists(args.key)):
            print(f"[WARN] Cert/key not found at {args.cert} / {args.key}; starting without TLS.")
        else:
            try:
                ssl_ctx = build_ssl_context(args.cert, args.key)
                print("[INFO] TLS enabled (wss).")
            except Exception as exc:
                print(f"[WARN] Failed to load TLS context: {exc}; continuing without TLS.")

    scheme = 'wss' if ssl_ctx else 'ws'
    print(f"Starting server on {scheme}://{args.host}:{args.port} ...")
    server = BaseWebSocketServer(args.host, args.port, Client, ssl_context=ssl_ctx)
    try:
        asyncio.run(server.start())
    except KeyboardInterrupt:
        try:
            asyncio.run(server.shutdown())
        except Exception:
            pass


if __name__ == '__main__':
    main()
