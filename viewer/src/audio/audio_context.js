import reverbjs from './reverb';

let r
let ctx

export default new Promise((resolve, reject) => {
    r = resolve
})

/**
 * For IOS, audio context can only be created inside of a touch event.
 */
export const init = () => {
    if (ctx)
        return ctx

    ctx = new (window.AudioContext || window.webkitAudioContext)()
    reverbjs.extend(ctx)
    var oscillator = ctx.createOscillator()
    oscillator.frequency.value = 1
    oscillator.connect(ctx.destination)
    oscillator.start(0)
    oscillator.stop(0)
    r(ctx)
    return ctx
}

const onIos = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

// The audio context must be created inside of a touch event on IOS
if (onIos()) {
    document.body.addEventListener('touchstart', () => init(), false);
} else {
    init()
}