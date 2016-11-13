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
import RPi.GPIO as GPIO
from datetime import datetime

EPOCH = datetime.utcfromtimestamp(0)

SAMPLE_INTERVAL = 0.002 # sec

WEBSOCKET_PORT = 5678 

# GPIO config
pulse_adc = 0
SPICLK = 18
SPIMISO = 23
SPIMOSI = 24
SPICS = 25


def readadc(adcnum, clockpin, mosipin, misopin, cspin):
    """Read SPI data from MCP3008 chip, 8 possible adc's (0 thru 7)"""
    if ((adcnum > 7) or (adcnum < 0)):
        return -1
    GPIO.output(cspin, True)

    GPIO.output(clockpin, False)  # start clock low
    GPIO.output(cspin, False)     # bring CS low

    commandout = adcnum
    commandout |= 0x18  # start bit + single-ended bit
    commandout <<= 3    # we only need to send 5 bits here
    for i in range(5):
        if (commandout & 0x80):
            GPIO.output(mosipin, True)
        else:
            GPIO.output(mosipin, False)
        commandout <<= 1
        GPIO.output(clockpin, True)
        GPIO.output(clockpin, False)

    adcout = 0
    # read in one empty bit, one null bit and 10 ADC bits
    for i in range(12):
        GPIO.output(clockpin, True)
        GPIO.output(clockpin, False)
        adcout <<= 1
        if (GPIO.input(misopin)):
            adcout |= 0x1

    GPIO.output(cspin, True)

    adcout >>= 1       # first bit is 'null' so drop it
    return adcout

class IfIOnly():
    """Samples heartbeat sensor and tracks state of heartbeat sampling"""
    def __init__(self):
        self.pulse = False
        self.rate = [0] * 10
        self.lastBeatTime = datetime.now()  # used to find IBI
        self.P = 512  # used to find peak in pulse wave, seeded
        self.T = 512  # used to find trough in pulse wave, seeded
        self.thresh = 525  # used to find instant moment of heart beat, seeded
        self.amp = 100  # used to hold amplitude of pulse waveform, seeded
        self.firstBeat = True  # used to seed rate array so we startup with reasonable BPM
        self.secondBeat = False  # used to seed rate array so we startup with reasonable BPM
        self.IBI = 600
        self.BPM = 0

    def _sample(self):
        return readadc(pulse_adc, SPICLK, SPIMOSI, SPIMISO, SPICS)

    def beat(self):
        """Sample from sensor and update internal state"""
        should_return = False
        signal = self._sample()
        print(signal)

async def life(websocket, path):
    """Websocket handler"""
    heart = IfIOnly()
    try:
        while True:
            result = heart.beat()
            if result:
                print("Beat {0}".format(result['bpm']))
                await websocket.send(json.dumps(result))
            await asyncio.sleep(SAMPLE_INTERVAL)
    finally:
        await websocket.close()


if __name__ == '__main__':
    # Config GPIO
    GPIO.setmode(GPIO.BCM)
    GPIO.setwarnings(False)
    GPIO.setup(SPIMOSI, GPIO.OUT)
    GPIO.setup(SPIMISO, GPIO.IN)
    GPIO.setup(SPICLK, GPIO.OUT)
    GPIO.setup(SPICS, GPIO.OUT)

    loop = asyncio.get_event_loop()
    for interface in sys.argv[1:]:
        ip = netifaces.ifaddresses(interface)[2][0]['addr']
        start_server = websockets.serve(life, ip, WEBSOCKET_PORT)
        loop.run_until_complete(start_server)

    loop.run_forever()

