import asyncio
from ws_base import BaseWebSocketServer, BaseClient


class Client(BaseClient):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.x = 300
        self.y = 300
        self.laser_on = False
        self.laser_x = 0
        self.laser_y = 0

    async def on_message(self, msg):
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


def main():
    server = BaseWebSocketServer('0.0.0.0', 8765, Client)
    try:
        asyncio.run(server.start())
    except KeyboardInterrupt:
        try:
            asyncio.run(server.shutdown())
        except Exception:
            pass


if __name__ == '__main__':
    main()
