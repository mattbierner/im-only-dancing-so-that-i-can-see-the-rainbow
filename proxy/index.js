var MjpegProxy = require('mjpeg-proxy').MjpegProxy;
var express = require('express');
var app = express();
 
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.get('/image.jpg', new MjpegProxy('http://webcam.st-malo.com/axis-cgi/mjpg/video.cgi?resolution=352x288').proxyRequest);
app.listen(8000);