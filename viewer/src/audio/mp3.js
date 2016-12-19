import audio_context from './audio_context'

/**
 */
export default class Mp3Sound {
    constructor(audioFile) {
        this._playing = false
        this._playbackRate = 1

        const req = new XMLHttpRequest()
        req.open('GET', audioFile, true)
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
        this._source.playbackRate.value = this._playbackRate
        this._source.buffer = sound
        this._source.connect(this._gain)

        if (this._playing)
            this._source.start(0)
    }


    setPlaybackRate(rate) {
        this._playbackRate = rate
        if (!this._source)
            return
        this._source.playbackRate.value = rate
    }

    play() {
        if (this._playing)
            return

        this._playing = true
        if (!this._ctx || !this._source)
            return
        
        this._source.start(0)
    }
}