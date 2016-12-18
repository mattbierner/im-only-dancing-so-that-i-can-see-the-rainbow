import THREE from 'three'
import BaseExperinace from './_base_experiance'
import RgbEffect from '../effects/rgb'
import Collector from '../collector'

const decay = 0.99

/**
 * RGB movement.
 * 
 * World starts in grayscale and then fadse
 */
export default class Rainbow extends BaseExperinace {
    constructor() {
        super()

        this._state = new Collector(decay)

        this._rgb = new RgbEffect(new THREE.Vector3())
        this._effects = [
            this._rgb
        ]
    }

    push(data) {
        this._state.push(data)
    }

    update(time) {
        const x = this._state.right_hand.d * 2
        const y = this._state.left_hand.d * 2
        const z = (this._state.right_leg.d + this._state.left_leg.d) / 2 * 2
        
        this._rgb.setWeights(new THREE.Vector3(x, y, z))
    }
}