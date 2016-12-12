import Renderer from './renderer'
import { createPulseClient } from './pulse_client'
import * as config from './config'
import loadImage from './util/load_image'

const renderer = new Renderer(
    document.getElementById('canvas3d'),
    document.getElementById('main'))

createPulseClient((data) => {
    renderer.pulse(data)
})

const loadStream = (number) =>
    loadImage(`${config.viewerUrl}?action=stream_${number}`)

loadStream(0)
    .then(img1 => {
        let img2 = config.stereo ? loadStream(1) : Promise.resolve(undefined)
        return img2.then(img2 => {
            renderer.setImage(img1, img2)
            renderer.animate()
        })
    }).catch(x => {
        console.error(x)
    })
