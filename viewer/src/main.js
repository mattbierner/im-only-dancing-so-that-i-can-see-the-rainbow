import Renderer from './renderer'
import * as audio_context from './audio_context'
import {createPulseClient} from './pulse_client'
import {viewerIp} from './config'
import PulseSound from './pulse_sound'

const onIos = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

// The audio context must be created inside of a touch event on IOS
/*if (onIos()) {
    document.body.addEventListener('touchstart', () => audio_context.init(), false);
} else {
    audio_context.init()
}*/

const renderer = new Renderer(
    document.getElementById('canvas3d'),
    document.getElementById('main'))

//const sound = new PulseSound()

createPulseClient((data) => {
  //  console.log(data);
    renderer.pulse(data)
    //sound.play()
})

const img = new Image()
img.crossOrigin = 'anonymous'
img.onload = () => {
    renderer.setImage(img)
    renderer.animate()
}
img.src = `http://${viewerIp}:1234/?action=stream_0`//"http://localhost:8000/image.jpg"
