import BaseExperinace from './_base_experiance'
import LutEffect from '../effects/lut'
import PulseBlurEffect from '../effects/pulse_blur'

export default class SixtiesWeed extends BaseExperinace {
    constructor() {
        super()

        this._pulse = new PulseBlurEffect([
            { strength: 1.0, speed: 0.00, amplitude: 0.00, sample: 0.000, offset: 0 },
            { strength: 1.0, speed: 0.001, amplitude: 0.20, sample: 0.000, offset: 0 },
        ])

        this._lut = new LutEffect('./resources/luts/vintage1.png')

        this._effects = [
            this._lut,
            this._pulse
        ]
    }
}