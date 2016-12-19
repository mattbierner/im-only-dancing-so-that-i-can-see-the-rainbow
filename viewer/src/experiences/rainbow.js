import THREE from 'three'
import BaseExperinace from './_base_experiance'
import RgbEffect from '../effects/rgb'
import Collector from '../collector'

const decay = 0.975

/**
 * RGB movement.
 * 
 * World starts in grayscale with movement controlling individual rgb color channels
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
        const mul = 4;
        const x = this._state.right_hand.d * mul
        const y = this._state.left_hand.d * mul
        const z = (this._state.right_leg.d + this._state.left_leg.d) / 2 * mul * 2
        
        this._rgb.setWeights(new THREE.Vector3(x, y, z))
    }
}