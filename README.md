This repo contains the source code used in [my project using a dancing to modify my vision][post]. Check out the post more details on the experiment

## Sensor
This Python script collects heartbeat data from 4 [Lilypad analog accelerometers][lilypad], sending events over a websocket to the VR headset. It targets a Raspberry Pi that is using a MCP3008 analog to digital converter for the Pulse Sensor.

The code requires Python 3.5+, and the [RPi.GPIO](https://github.com/adafruit/Adafruit_Python_GPIO), [MCP3008](https://github.com/adafruit/Adafruit_Python_MCP3008), and [webksockets](https://pypi.python.org/pypi/websockets) libraries.

To start it, simply run:

```bash
$ python3 sensor/collector.py eth0
```

The script arguments specify which network devices to serve the websocket on.


## Site
The website is designed to be run on an iPhone used with Google Cardboard. It takes the mjpeg stream from the camera and the heartbeat events, and uses WebGL to modify your vision in realtime.

The site uses webpack. To run it:

```bash
$ cd viewer
$ npm install

# Edit `src/config.js` to provide the expected ip address of the Raspberry pi
# and rebuild
$ webpack

# server up index.html somehow
$ http-server index.html
```


> **Note:** You have to provide your own mp3 music files for some of these.


## Credits

* [adafruit mcp3008 Python code](http://threejs.org/docs/index.html#Manual/Introduction/Creating_a_scene)
* [Pulse sensor Arduino sample code](https://github.com/WorldFamousElectronics/PulseSensor_Amped_Arduino) 
* [Three.js](http://threejs.org)
* [Basic bad TV shader effect from Felix Turner](https://www.airtightinteractive.com/demos/js/badtvshader/)
* [Reference for some of the shader effects](//https://github.com/jjhesk/unity-interview/blob/master/Assets/Resources/Aubergine/Shaders/ImageEffects)
* [Color lookup table shader](https://github.com/mattdesl/glsl-lut)



[post]: http://blog.mattbierner.com/dance-rainbow
[lilypad]: https://www.sparkfun.com/products/9267
