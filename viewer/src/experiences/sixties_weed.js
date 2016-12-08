import LutEffect from '../effects/lut'
import PulseBlurEffect from '../effects/pulse_blur'

/**
 * Sixties weed
 */
export default class SixtiesWeed {
    constructor() {
        this._pulse = new PulseBlurEffect()
        this._lut = new LutEffect('./resources/luts/lut_miss_etikate.png')

        this._effects = [
            this._lut,
            this._pulse
        ]
    }

    getPasses(composer) {
        return [].concat.apply([], [].concat.apply([], this._effects.map(x => x.getPasses())))
    }

    push(data) {
        // noop
    }

    update(time) {
        this._effects.forEach(p => p.update(time))
    }
}