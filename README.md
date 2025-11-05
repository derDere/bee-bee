# bee-bee

![Screenshot](screenshot.png)

Realtime multiplayer "bee" demo using Python `websockets` and a lightweight browser client.

Yes I know thir repository is a total mess! Pay me and I'll clean it up!!!

## Links

- Demo: [derdere.github.io/bee-bee](https://derdere.github.io/bee-bee/)
- Version 1.0: [derdere.de:8080](https://derdere.de:8080/)

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

## Docker & Docker Compose

You can run everything (static HTTP + WebSocket server) in one container.

### Quick Start
```powershell
git clone https://github.com/derDere/bee-bee.git
cd bee-bee
# (Optional) create certs for WSS
mkdir certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout certs/key.pem -out certs/cert.pem -subj "/CN=localhost"
# Launch
docker compose up -d
```

Then open: `http://localhost:8080` (the `index.html` page). WebSocket server runs on port `8765`.

If you provided `certs/cert.pem` and `certs/key.pem` they will be mounted and the WebSocket server will attempt to start in TLS (wss). The page itself is still served over plain HTTP (so no mixed‑content issue). If you want full HTTPS for the page, add a reverse proxy (see below).

### Files Added for Containerization
- `serve.py` – Combined launcher: starts static file HTTP server (thread) + websocket server (asyncio).
- `Dockerfile` – Builds a slim Python image, installs deps, exposes ports 8080 & 8765.
- `docker-compose.yml` – Single service `bee` mapping host ports and mounting optional certs.
- `.dockerignore` – Reduces build context.

### Environment Variables (compose sets defaults)
| Variable | Purpose | Default |
|----------|---------|---------|
| `HTTP_PORT` | Port for static HTTP | 8080 |
| `WS_PORT` | Port for WS/WSS | 8765 |
| `WS_HOST` | Bind host for WS | 0.0.0.0 |
| `WS_CERT` | Path to cert (PEM) | /certs/cert.pem (if volume mounted) |
| `WS_KEY` | Path to key (PEM) | /certs/key.pem (if volume mounted) |
| `STATIC_DIR` | Directory served | /app |

### Rebuilding
```powershell
docker compose build --no-cache
docker compose up -d
```

### Logs
```powershell
docker compose logs -f bee
```

### Stopping & Removing
```powershell
docker compose down
```

### Development Shell
```powershell
docker compose exec bee bash
```

### Production HTTPS Option
For a proper HTTPS site + WSS:
1. Run the container with plain WS + HTTP inside (as is).
2. Put an Nginx / Caddy / Traefik reverse proxy in front that terminates TLS.
3. Proxy both the static site and websocket upgrade on the same domain (443). Client code will auto-select `wss` when the page is https.

Example `docker-compose.yml` addition (Nginx skeleton):
```yaml
  proxy:
    image: nginx:1.27-alpine
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./letsencrypt:/etc/letsencrypt:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - bee
```

And an Nginx snippet for websocket pass-through:
```nginx
location /ws/ {
  proxy_pass http://bee:8765/;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "Upgrade";
  proxy_set_header Host $host;
}
location / {
  proxy_pass http://bee:8080/;
}
```
Change the client URL to use path `/ws/` if you proxy that way.

### Self-Signed Cert in Container (Optional)
If you prefer generating certs inside the container (dev only), you can extend the Dockerfile or run:
```powershell
docker compose exec bee openssl req -x509 -nodes -days 30 -newkey rsa:2048 -keyout /certs/key.pem -out /certs/cert.pem -subj "/CN=localhost"
```
Then restart the container.

### Notes
- Serving both HTTP + WS in one process avoids a second container for simple demos.
- For scalability / observability consider separating concerns or using a framework.
- No private keys are committed; mount them at runtime.

Happy containerized buzzing! 🐝
