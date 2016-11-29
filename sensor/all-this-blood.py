#!/usr/bin/env python
# Simple websocket server that emits 
#
# M3008 reading logic from Adafruit
# --------
# Written by Limor "Ladyada" Fried for Adafruit Industries, (c) 2015
# This code is released into the public domain
# --------
#
import sys
import time
import asyncio
import os
import json
import websockets
import netifaces
import Adafruit_GPIO.SPI as SPI
import Adafruit_MCP3008
from datetime import datetime

EPOCH = datetime.utcfromtimestamp(0)

SAMPLE_INTERVAL = 0.05 # sec

WEBSOCKET_PORT = 5678 

# GPIO config
pulse_adc = 0
CLK = 18
MISO = 23
MOSI = 24
CS = 25
mcp = Adafruit_MCP3008.MCP3008(clk=CLK, cs=CS, miso=MISO, mosi=MOSI)

# Conf
LEFT = {
    "channel": 0,
    "x": 0,
    "y": 1,
    "z": 2 
}


def readadc(pin):
    return mcp.read_adc(pin)

class Collector():
    def __init__(self):
        pass

    def _sample(self):
        return {
            "left": self._sampleUnit(LEFT)
        }

    def _sampleUnit(self, unit):
        return {
            "x": mcp.read_adc(unit["x"]),
            "y": mcp.read_adc(unit["z"]),
            "z": mcp.read_adc(unit["z"])
        }

    def beat(self):
        """Sample from sensor and update internal state"""
        return self._sample()

async def life(websocket, path):
    """Websocket handler"""
    heart = Collector()
    try:
        while True:
            result = heart.beat()
            if result:
                print(result)
                await websocket.send(json.dumps(result))
            await asyncio.sleep(SAMPLE_INTERVAL)
    finally:
        await websocket.close()


if __name__ == '__main__':
    heart = Collector()
    loop = asyncio.get_event_loop()
    for interface in sys.argv[1:]:
        ip = netifaces.ifaddresses(interface)[2][0]['addr']
        start_server = websockets.serve(life, ip, WEBSOCKET_PORT)
        loop.run_until_complete(start_server)

    loop.run_forever()

