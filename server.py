import asyncio
from ws_base import BaseWebSocketServer, BaseClient

class Client(BaseClient):
    async def on_message(self, msg: str):
        if msg == "ping":
            self.send("pong")
        elif msg == "PING":
            others = await self.get_others()
            for c in others:
                c.send("PONG")
            self.send("PONG")

def main():
    server = BaseWebSocketServer('localhost', 8765, Client)
    try:
        asyncio.run(server.start())
    except KeyboardInterrupt:
        try:
            asyncio.run(server.shutdown())
        except Exception:
            pass

if __name__ == '__main__':
    main()
