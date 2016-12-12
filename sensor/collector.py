#!/usr/bin/env python
# Simple websocket server that collects data from four accelerometers
import sys
import asyncio
import json
import websockets
import netifaces
from collections import OrderedDict
from datetime import datetime
import Adafruit_GPIO.SPI as SPI
import Adafruit_MCP3008

EPOCH = datetime.utcfromtimestamp(0)

SAMPLE_INTERVAL = 1 / 60 # sec

WEBSOCKET_PORT = 5678

# GPIO config
mcp0 = Adafruit_MCP3008.MCP3008(spi=SPI.SpiDev(0, 0))
mcp1 = Adafruit_MCP3008.MCP3008(spi=SPI.SpiDev(0, 1))

# Conf
LEFT_HAND = {
    'channel': 1,
    'x_pin': 0,
    'y_pin': 1,
    'z_pin': 2 
}

RIGHT_HAND = {
    'channel': 1,
    'x_pin': 5,
    'y_pin': 6,
    'z_pin': 7 
}

LEFT_LEG = {
    'channel': 0,
    'x_pin': 0,
    'y_pin': 1,
    'z_pin': 2 
}

RIGHT_LEG = {
    'channel': 0,
    'x_pin': 5,
    'y_pin': 6,
    'z_pin': 7 
}


def readadc(pin):
    return mcp.read_adc(pin)

class Collector():
    def __init__(self):
        pass

    def sample(self):
        return OrderedDict([
            ('left_hand', self._sampleUnit(LEFT_HAND)),
            ('right_hand', self._sampleUnit(RIGHT_HAND)),
            ('left_leg', self._sampleUnit(LEFT_LEG)),
            ('right_leg', self._sampleUnit(RIGHT_LEG)),
        ])

    def _sampleUnit(self, unit):
        mcp = mcp1 if unit['channel'] is 1 else mcp0
        return OrderedDict([
            ('x', mcp.read_adc(unit['x_pin'])),
            ('y', mcp.read_adc(unit['y_pin'])),
            ('z', mcp.read_adc(unit['z_pin']))
        ])


async def handler(websocket, path):
    """Websocket handler"""
    collector = Collector()
    try:
        while True:
            start = datetime.now()
            result = collector.sample()
            if result:
                data = json.dumps(result)
                print(data)
                await websocket.send(data)
            elapsed = datetime.now() - start
            await asyncio.sleep(max(0, elapsed.total_seconds() - SAMPLE_INTERVAL))
    finally:
        await websocket.close()


if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    for interface in sys.argv[1:]:
        ip = netifaces.ifaddresses(interface)[2][0]['addr']
        start_server = websockets.serve(handler, ip, WEBSOCKET_PORT)
        loop.run_until_complete(start_server)

    loop.run_forever()
