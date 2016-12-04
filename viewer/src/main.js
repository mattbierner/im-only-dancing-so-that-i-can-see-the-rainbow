import Renderer from './renderer'
import * as audio_context from './audio_context'
import { createPulseClient } from './pulse_client'
import { viewerIp } from './config'
import PulseSound from './pulse_sound'

const onIos = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

// The audio context must be created inside of a touch event on IOS
if (onIos()) {
    document.body.addEventListener('touchstart', () => audio_context.init(), false);
} else {
    audio_context.init()
}

const renderer = new Renderer(
    document.getElementById('canvas3d'),
    document.getElementById('main'))

//const sound = new PulseSound()

createPulseClient((data) => {
    //  console.log(data);
    renderer.pulse(data)
    //sound.play()
})

const loadStream = (number) => {
    let res;
    const p = new Promise((r) => { res = r; })

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
        res(img)
    }
    img.src = `http://${viewerIp}:1234/?action=stream_${number}`//"http://localhost:8000/image.jpg"
    return p;
}

loadStream(0).then(img1 =>
    loadStream(1).then(img2 => {
        renderer.setImage(img1, img2)
        renderer.animate()
    })).catch(x=> console.error(x))
