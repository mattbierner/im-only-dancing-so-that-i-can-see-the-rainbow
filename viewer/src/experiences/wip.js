import BaseExperinace from './_base_experiance'
import swirl from '../effects/swirl'
import PulseBlurEffect from '../effects/swirl'

export default class extends BaseExperinace {
    constructor() {
        super();


        this._lut = new swirl()

        this._effects = [
            this._lut
        ]
    }
}