import THREE from 'three'

const sampleMax = 1023


const SIZE = 4

const MAX_GAIN = 255
const GAIN_SCALE = 0.2


class SamplableValue {
    constructor() {
        this._size = SIZE
        this._i = 0
        this._samples = []
        for (let i = 0; i < this._size; ++i)
            this._samples[i] = 0;
    }

    push(value) {
        this._samples[this._i] = value
        this._i = (this._i + 1) % this._size
    }

    sample() {
        let sum = 0
        for (let i = 0; i < this._size; ++i) {
            sum += this._samples[i]
        }
        return sum / this._size
    }
}

class Sensor {
    constructor(decay) {
        this.decay = decay;
        this.avg = { x: new SamplableValue(), y: new SamplableValue(), z: new SamplableValue() };
        this.d = 0
        this.delta = new THREE.Vector3(0, 0, 0)
        this.change = new THREE.Vector3(0, 0, 0)
    }

    push(x, y, z) {
        const ax = this.avg.x.sample()
        const ay = this.avg.y.sample()
        const az = this.avg.z.sample()

        this.avg.x.push(x)
        this.avg.y.push(y)
        this.avg.z.push(z)
        this.delta = new THREE.Vector3(ax - x, ay - y, az - z)

        this.change.x += Math.abs(this.delta.x) * GAIN_SCALE
        this.change.y += Math.abs(this.delta.y) * GAIN_SCALE
        this.change.z += Math.abs(this.delta.z) * GAIN_SCALE
        this.change.multiplyScalar(this.decay)

        this.d = this.change.length()
    }
}

export default class Collector {
    constructor(decay) {
        this.decay = decay
        this.left_leg = new Sensor(decay)
        this.right_leg = new Sensor(decay)
        this.left_hand = new Sensor(decay)
        this.right_hand = new Sensor(decay)
    }

    push(data) {
        for (const channel of ['left_leg', 'right_leg', 'left_hand', 'right_hand']) {
            const current = new THREE.Vector3(data[channel].x, data[channel].y, data[channel].z).divideScalar(sampleMax)
            this[channel].push(current.x, current.y, current.z)
        }
    }
}