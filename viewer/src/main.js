import Renderer from './renderer'
import { createPulseClient } from './pulse_client'
import { viewerIp } from './config'
import PulseSound from './audio/mp3'

const renderer = new Renderer(
    document.getElementById('canvas3d'),
    document.getElementById('main'))

const sound = new PulseSound()


createPulseClient((data) => {
    renderer.pulse(data)
    sound.pulse(data)
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
        renderer.setImage(img1)
        renderer.animate()
    })).catch(x => console.error(x))
