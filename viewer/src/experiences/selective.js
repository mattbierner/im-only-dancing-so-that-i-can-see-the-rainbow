import THREE from 'three'
import SelectiveColor from '../effects/selective_color'
import Lut from '../effects/lut'

/**
 * Rainbow immersion
 */
export default class Rainbow {
    constructor() {
        this._selective = new SelectiveColor([
            [0.25, new THREE.Vector3(.8, 0.2, 0.2), new THREE.Vector3(1, 0, 0)],
            [0.15, new THREE.Vector3(.9, 0.5, 0.5), new THREE.Vector3(1, 0, 0)],
        ])
        this._selective.setStrength(0.7)

        this._effects = [
            this._selective,
        ]
    }

    getPasses(composer) {
        return [].concat.apply([], [].concat.apply([], this._effects.map(x => x.getPasses())))

    }

    push(data) {
        //noop
    }

    update(time) {
        this._effects.forEach(p => p.update(time))
    }
}