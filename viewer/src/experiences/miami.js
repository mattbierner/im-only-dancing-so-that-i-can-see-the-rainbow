import THREE from 'three'
import Accumulator from './_accumulator'
import BlurEffect from '../effects/pulse_blur'
import LutEffect from '../effects/lut'
import BloomEffect from '../effects/bloom'
import VingetteEffect from '../effects/vignette'
import Mp3Player from '../audio/mp3'
import Collector from '../collector'

/**
 * 
 */
export default class Miami {
    constructor() {
        this._collector = new Collector(0.999)
        this._rate = 0

        this._lut = new LutEffect('./resources/luts/neon.png')

        this._jitter = new BlurEffect([
            { strength: 1.0, speed: 0.00, amplitude: 0.00, sample: 0.000, offset: 0 },
            { strength: 1.0, speed: 0.01, amplitude: 0.025, sample: 0.002, offset: 0 },
            { strength: 1.0, speed: 0.05, amplitude: 0.025, sample: 0.002, offset: 1021 },
            { strength: 1.0, speed: 0.05, amplitude: 0.025, sample: 0.002, offset: 1709 },
            { strength: 1.0, speed: 0.1, amplitude: 0.025, sample: 0.005, offset: 709 },
            { strength: 1.0, speed: 0.1, amplitude: 0.025, sample: 0.005, offset: 2137 }
        ])

        this._woozy = new BlurEffect([
            { strength: 1.0, speed: 0.00, amplitude: 0.00, sample: 0.000, offset: 0 },
            { strength: 1.0, speed: 0.005, amplitude: 0.15, sample: 0.005, offset: 0 },
            { strength: 1.0, speed: 0.005, amplitude: 0.15, sample: 0.005, offset: 773 },
            { strength: 1.0, speed: 0.005, amplitude: 0.15, sample: 0.005, offset: 1709 },
        ])

        this._bloom = new BloomEffect(0.2)

        this._vingette = new VingetteEffect([
            { color: new THREE.Vector4(1, 1, 1, 0.2), radius: 0.8, softness: 0.5, waves: 8, magnitude: 0.02, speed: 0.2, offset: 0 },
            { color: new THREE.Vector4(1, 1, 1, 0.2), radius: 0.8, softness: 0.5, waves: 8, magnitude: 0.02, speed: 0.5, offset: 1000 },
            { color: new THREE.Vector4(1, 1, 1, 0.1), radius: 0.9, softness: 0.6, waves: 13, magnitude: 0.05, speed: 0.1, offset: 0 },
            { color: new THREE.Vector4(1, 1, 1, 0.1), radius: 0.9, softness: 0.6, waves: 13, magnitude: 0.02, speed: -0.7, offset: 500 }
        ])

        this._effects = [
            this._lut,
            this._bloom,
            this._woozy,
            this._jitter,
            this._vingette
        ]

        this._sound = new Mp3Player('./resources/rush_rush.mp3')
        this._sound.play()
    }

    getPasses(composer) {
        return [].concat.apply([], this._effects.map(x => x.getPass()))
    }

    forComposer(renderer, map) {
        return new Accumulator(this, renderer, map)
    }

    push(data) {
        this._collector.push(data)
    }

    update(time, delta) {
        const d = this.getGrowthRate(delta)
        console.log(this._rate, this._rate + d, d)
        this._rate += d
        this._rate = Math.min(1.0, Math.max(0.0, this._rate));
        this._bloom.setStrength(0.3 + (Math.sin(time / 1000 * 5) / 2 + Math.sin((time + 709) / 1000 * 5) / 2) * 0.15)
        this._lut.setStrength(this._rate)

        this._effects.forEach(p => p.update && p.update(time))
    }

    getGrowthRate(delta) {
        let gravity = 0
        let growthMax = 0
        if (this._rate > 0.8) {
            gravity = 0.19
            growthMax = 0.20
        } else if (this._rate > 0.5) {
            gravity = 0.1
            growthMax = 0.20
        } else {
            gravity = 0.05
            growthMax = 0.20
        }
        gravity *= delta
        growthMax *= delta

        const handsPercent = 0.75
        const feetPercent = 0.25
        const SCALE = 15

        let d = Math.min(this._collector.right_hand.delta.length() * SCALE, 1) * handsPercent / 2
            + Math.min(this._collector.left_hand.delta.length() * SCALE, 1) * handsPercent / 2
            + Math.min((this._collector.left_leg.delta.length() / 2 + this._collector.right_leg.delta.length() / 2) * SCALE, 1) * feetPercent;

        d *= growthMax
        d -= gravity

        return d;
    }
}