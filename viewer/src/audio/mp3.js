import audio_context from './audio_context'
import Collector from '../collector'

/**
 */
export default class Mp3Sound {
    constructor() {
        this._state = new Collector(0.995)
        this._playing = false

        const req = new XMLHttpRequest()
        req.open('GET', './resources/maniac.mp3', true)
        req.responseType = 'arraybuffer'
        req.onload = () =>
            audio_context.then(ctx => {
                this._ctx = ctx
                this._ctx.decodeAudioData(req.response, buffer => {
                    this._init(ctx, buffer)
                }, console.error)
            })
        req.send()
    }

    _init(ctx, sound) {
        this._gain = ctx.createGain()
        this._gain.connect(ctx.destination)

        this._source = ctx.createBufferSource()
        this._source.buffer = sound
        this._source.connect(this._gain)
    }

    pulse(data) {
        if (!this._playing)
            this.play()

        this._state.push(data)
        if (!this._source)
            return

        const SCALE = 1 / 3

        const handsPercent = 0.7
        const feetPercent = 0.3;

        let rate = this._source.playbackRate.value
        rate = Math.min(this._state.right_hand.d * SCALE, 1) * handsPercent / 2
            + Math.min(this._state.left_hand.d * SCALE, 1) * handsPercent / 2
            + Math.min((this._state.left_leg.d / 2 + this._state.right_leg.d / 2) * SCALE, 1) * feetPercent;

        if (rate < 0.15)
            rate = 0
        
        if (rate > 1.5)
            rate = 1.5

        this._source.playbackRate.value = rate
    }

    play() {
        if (!this._ctx || !this._source || this._playing)
            return;
       
        this._source.start(0)
        this._playing = true
    }
}