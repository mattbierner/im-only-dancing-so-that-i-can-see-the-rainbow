import THREE from 'three'
import Collector from '../collector'

const decay = 0.93

export default class BaseColorEffect {
    constructor(shader) {
        this._state = new Collector(decay)
        this.pass = new THREE.ShaderPass(shader, 'map')
    }

    push(data) {
        this._state.push(data)
    }

    update() {
        if (true) { // full body
            this.pass.uniforms.weights.value.x = this._state.right_hand.d * 2
            this.pass.uniforms.weights.value.y = this._state.left_hand.d * 2
            this.pass.uniforms.weights.value.z = (this._state.right_leg.d + this._state.left_leg.d) / 2 * 2
        } else { // one hand
            this.pass.uniforms.weights.value.x = this._state.right_hand.change.x * 10
            this.pass.uniforms.weights.value.y = this._state.right_hand.change.y  * 10
            this.pass.uniforms.weights.value.z = this._state.right_hand.change.z * 10
        }
        this.pass.uniforms.weights.needsUpdate = true
    }
}