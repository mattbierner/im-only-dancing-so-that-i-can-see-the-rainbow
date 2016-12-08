import BlurEffect from '../effects/blur'
import LutEffect from '../effects/lut'
import RgbShiftEffect from '../effects/rgb_shift'
import TvEffect from '../effects/tv'
import hdr from '../effects/hdr'

/**
 * 80s workout video
 */
export default class Neon {
    constructor() {
        this._lut = new LutEffect('./resources/luts/lut_neon.png')
        this._blur = new BlurEffect()
        this._tv = new TvEffect()
        this._rgbShift = new RgbShiftEffect()

        this._effects = [
            this._lut,
    //        new hdr(),
            this._rgbShift,
         //   this._tv,
            this._blur,
        ]

    }

    getPasses(composer) {
        return [].concat.apply([], [].concat.apply([], this._effects.map(x => x.getPasses())))
    }

    push(data) {
        this._sound.pulse(data)
    }

    update(time) {
        this._effects.forEach(p => p.update(time))
    }
}