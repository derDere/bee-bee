import asyncio
import uuid
import json
from typing import List, Type, Dict, Optional, Any
import websockets
import ssl

class BaseClient:
    def __init__(self, server: 'BaseWebSocketServer', websocket: websockets.WebSocketServerProtocol):
        self.server = server
        self.websocket = websocket
        self.id = str(uuid.uuid4())
        self._outbound_queue: asyncio.Queue[str] = asyncio.Queue()
        self._writer_task: Optional[asyncio.Task] = asyncio.create_task(self._writer())
        self._closed = False

    def send(self, msg: Any):
        if self._closed:
            return
        try:
            payload = json.dumps(msg, separators=(",", ":"))
        except Exception:
            # fallback: stringify then JSON encode again if needed
            try:
                payload = json.dumps(str(msg))
            except Exception:
                return
        self._outbound_queue.put_nowait(payload)

    async def on_message(self, msg: str):
        pass

    async def get_others(self) -> List['BaseClient']:
        clients = await self.server.get_clients()
        return [c for c in clients if c is not self]

    async def _writer(self):
        try:
            while True:
                msg = await self._outbound_queue.get()
                if msg is None:
                    break
                try:
                    await self.websocket.send(msg)
                except Exception:
                    break
        finally:
            self._closed = True

    async def close(self):
        if not self._closed:
            self._outbound_queue.put_nowait(None)
            if self._writer_task:
                try:
                    await self._writer_task
                except Exception:
                    pass
            try:
                await self.websocket.close()
            except Exception:
                pass

class BaseWebSocketServer:
    def __init__(self, host: str, port: int, client_class: Type[BaseClient], ssl_context: Optional[ssl.SSLContext] = None):
        """Basic WebSocket server.

        Parameters:
            host: Interface/IP to bind.
            port: TCP port.
            client_class: Subclass of BaseClient to instantiate per connection.
            ssl_context: Optional SSL context. If provided, server speaks WSS.
        """
        self.host = host
        self.port = port
        self.client_class = client_class
        self.ssl_context = ssl_context
        self._clients: Dict[str, BaseClient] = {}
        self._lock = asyncio.Lock()
        self._server = None
        self._stop_event = asyncio.Event()

    async def start(self):
        # If ssl_context is provided we start a secure websocket server (wss)
        self._server = await websockets.serve(self._handler, self.host, self.port, ssl=self.ssl_context)
        await self._stop_event.wait()
        await self._shutdown_impl()

    async def shutdown(self):
        self._stop_event.set()
        if self._server is not None:
            await self._shutdown_impl()

    async def _shutdown_impl(self):
        async with self._lock:
            clients = list(self._clients.values())
        for client in clients:
            try:
                await client.close()
            except Exception:
                pass
        if self._server is not None:
            self._server.close()
            await self._server.wait_closed()

    async def _handler(self, websocket: websockets.WebSocketServerProtocol):
        client = self.client_class(self, websocket)
        async with self._lock:
            self._clients[client.id] = client
        try:
            async for message in websocket:
                if isinstance(message, bytes):
                    try:
                        message = message.decode('utf-8')
                    except Exception:
                        continue
                parsed = self._parse_incoming(message)
                if parsed is None:
                    continue
                await client.on_message(parsed)
        finally:
            async with self._lock:
                self._clients.pop(client.id, None)
            try:
                await client.close()
            except Exception:
                pass

    def _parse_incoming(self, message: str) -> Any:
        try:
            return json.loads(message)
        except Exception:
            return None

    async def get_clients(self) -> List[BaseClient]:
        async with self._lock:
            return list(self._clients.values())

