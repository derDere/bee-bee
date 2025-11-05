# bee-bee

Realtime multiplayer "bee" demo using Python `websockets` and a lightweight browser client.

## Features
- JSON message broadcasting of player positions / laser state
- Auto-reconnecting JS WebSocket client (`wsclient.js`)
- Dynamic `ws://` / `wss://` URL selection based on page protocol
- Optional TLS (WSS) support via self-hosted certificate

## Running the Server (WS / WSS)
Install dependencies:

```powershell
pip install -r requirements.txt
```

### 1. Generate a Self-Signed Certificate (Development Only)
Quick OpenSSL one-liner (recommended if you have OpenSSL installed):
```powershell
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem -subj "/CN=localhost"
```
This produces:
- `cert.pem` (public certificate)
- `key.pem` (private key)

Place them in the project root (or another directory; just adjust the paths when launching the server).

> If you don't have OpenSSL on Windows, install it (e.g. via Git for Windows, Chocolatey, or WinGet) or terminate TLS at a reverse proxy like Nginx / Caddy instead.

### 2. Start the Secure WebSocket Server
```powershell
python server.py --cert cert.pem --key key.pem --port 8765
```
Output will indicate: `Starting server on wss://0.0.0.0:8765 ...` and `[INFO] TLS enabled (wss).`

### 3. Start Without TLS (Plain WS)
```powershell
python server.py --port 8765
```
Useful when terminating TLS at a proxy:
```
[Browser] --(HTTPS/WSS)--> [Reverse Proxy] --(WS)--> python server.py
```

### 4. Using Environment Variables Instead of Flags
```powershell
$env:WS_CERT = "cert.pem"
$env:WS_KEY  = "key.pem"
python server.py
```

## Client Connection Logic
`script.js` now builds the WebSocket URL dynamically:
```javascript
const proto = (location.protocol === 'https:' ? 'wss' : 'ws');
const port = 8765;
const host = location.hostname || 'localhost';
const client = new WSClient(`${proto}://${host}:${port}`);
```
If you deploy behind a proxy on a different port or path, adjust this snippet accordingly (or derive port from `location.port`).

## Reverse Proxy Example (Nginx)
```nginx
server {
  listen 443 ssl;
  server_name example.com;

  ssl_certificate     /etc/ssl/example.crt;
  ssl_certificate_key /etc/ssl/example.key;

  location / {
    root /var/www/bee;  # serve index.html / assets
    try_files $uri /index.html;
  }

  location /ws/ { # optional path if you rewrite client URL to wss://example.com/ws/
    proxy_pass http://127.0.0.1:8765/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
  }
}
```
If you use this path-based approach, change the client constructor to:
```javascript
const client = new WSClient(`${proto}://${host}/ws/`);
```
And update the Python server to listen without TLS (plain ws) on localhost.

## Security Notes
- The bundled self-signed cert method is for development only; browsers will show a warning unless you trust the cert.
- For production, obtain a real certificate (Let’s Encrypt, etc.).
- Never commit private keys.
- You may further harden ciphers / protocols in `build_ssl_context` inside `server.py`.

## Code Structure
- `server.py` – launches WebSocket server (ws or wss)
- `ws_base.py` – base server & client abstractions
- `wsclient.js` – reconnecting lightweight client wrapper
- `script.js` – game / bee logic + WebSocket integration

## Troubleshooting
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Browser can't connect using wss | Invalid / untrusted cert | Use plain ws for dev or trust cert |
| Mixed content error | Serving page over https but using ws:// | Always use wss when page is https |
| ECONNREFUSED | Port blocked / server not running | Verify server log & firewall rules |
| Random disconnects | Proxy timeout / idle close | Add ping/pong (future enhancement) |

## Next Ideas
- Heartbeat / ping-pong for connection liveness
- Auth / session token per client
- Rate limiting for updates
- Compression (permessage-deflate) if payload grows

Enjoy the bees! 🐝
