import Lut from '../effects/Lut'

/**
 * Rainbow immersion
 */
export default class Rainbow {
    constructor() {
        this._lut = new Lut('./resources/luts/rainbow.png')
    }

    getPasses(composer) {
        return [].concat(
            this._lut.getPasses()
        )
    }

    push(data) {
    }

    update(time) {
        this._lut.update(time)
    }
}