import audio_context from './audio_context'

import Collector from '../collector'

class Sensor {
    constructor(source, ctx, dest, type, frequencies) {
        this._source = source

        this._gainX = ctx.createGain()
        this._gainX.connect(dest)

        this._sourceX = ctx.createOscillator()
        this._sourceX.type = type
        this._sourceX.frequency.value = frequencies.x//600
        this._sourceX.connect(this._gainX)
        this._sourceX.start(0)


        this._gainY = ctx.createGain();
        this._gainY.connect(dest)

        this._sourceY = ctx.createOscillator()
        this._sourceY.type = type
        this._sourceY.frequency.value = frequencies.y//480
        this._sourceY.connect(this._gainY)
        this._sourceY.start(0)


        this._gainZ = ctx.createGain();
        this._gainZ.connect(dest)

        this._sourceZ = ctx.createOscillator()
        this._sourceZ.type = type
        this._sourceZ.frequency.value = frequencies.z//360
        this._sourceZ.connect(this._gainZ)
        this._sourceZ.start(0)
    }

    update(state) {
        const SCALE = 6
        const DEACY = 0.90
        const MIN = 0.1
        const sampler = state[this._source]
        
        this._gainX.gain.value *= DEACY
        this._gainX.gain.value += Math.abs(sampler.delta.x) * SCALE
        this._gainX.gain.value = Math.max(0, Math.min(1.5, this._gainX.gain.value));
        if (this._gainX.gain.value < MIN)
            this._gainX.gain.value = 0


        this._gainY.gain.value *= DEACY
        this._gainY.gain.value += Math.abs(sampler.delta.y) * SCALE
        this._gainY.gain.value = Math.max(0, Math.min(1.5, this._gainY.gain.value));
        if (this._gainY.gain.value < MIN)
            this._gainY.gain.value = 0

        this._gainZ.gain.value *= DEACY
        this._gainZ.gain.value += Math.abs(sampler.delta.z) * SCALE
        this._gainZ.gain.value = Math.max(0, Math.min(1.5, this._gainZ.gain.value));
        if (this._gainZ.gain.value < MIN)
            this._gainZ.gain.value = 0
    }
}

/**
 */
export default class OscilatorSound {
    constructor() {
        this._state = new Collector(0.96)
        audio_context.then(ctx => {
            const node = ctx.createReverbFromUrl("./resources/reverb/TerrysFactoryWarehouse.m4a", () => {
               // node.connect(ctx.destination);
                this._ctx = ctx;
                this._destination = ctx.destination;//node
            })
        });
        this._playing = false
    }

    pulse(data) {
        if (!this._playing)
            this.play()


        this._state.push(data)
        if (this._ctx && this._left) {
            this._left.update(this._state)
            this._right.update(this._state)

        }
    }

    play() {
        if (!this._ctx)
            return;

        this._left = new Sensor('left_hand', this._ctx, this._destination, 'square', { x: 360, y: 440, z: 520 });
        this._right = new Sensor('right_hand', this._ctx, this._destination, 'sine', { x: 360, y: 440, z: 520 });

        this._playing = true
    }
}