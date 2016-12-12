import THREE from 'three'
import BlurEffect from '../effects/pulse_blur'
import LutEffect from '../effects/lut'
import BloomEffect from '../effects/bloom'
import VingetteEffect from '../effects/vignette'

/**
 * 
 */
export default class Miami {
    constructor() {
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
        ]);

        this._effects = [
            this._lut,
            this._bloom,
            this._woozy,
            this._jitter,
            this._vingette
        ]
    }

    getPasses(composer) {
        return [].concat.apply([], this._effects.map(x => x.getPass()))
    }

    push(data) {
        this._sound.pulse(data)
    }

    update(time) {
        this._effects.forEach(p => p.update(time))

        this._bloom.setStrength(0.3 + (Math.sin(time / 1000 * 5) / 2 + Math.sin((time + 709) / 1000 * 5) / 2) * 0.15)
    }
}