import THREE from 'three'

const sampleMax = 1023

const decay = 0.975
const SIZE = 6

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
    constructor() {
        this.avg = { x: new SamplableValue(), y: new SamplableValue(), z: new SamplableValue() };
        this.d = 0
    }

    push(x, y, z) {
        const ax = this.avg.x.sample()
        const ay = this.avg.y.sample()
        const az = this.avg.z.sample()

        this.avg.x.push(x)
        this.avg.y.push(y)
        this.avg.z.push(z)
        return new THREE.Vector3(ax - x, ay - y, az - z)
    }
}

export default class Collector {
    constructor() {
        this.left_leg = new Sensor()
        this.right_leg = new Sensor()
        this.left_hand = new Sensor()
        this.right_hand = new Sensor()
    }

    push(data) {
        for (const channel of ['left_leg', 'right_leg', 'left_hand', 'right_hand']) {
            const current = new THREE.Vector3(data[channel].x, data[channel].y, data[channel].z).divideScalar(sampleMax)
            let d = this[channel].push(current.x, current.y, current.z).length()
            this[channel].d += (d * GAIN_SCALE)
            this[channel].d *= decay
            this[channel].d = Math.max(0, Math.min(MAX_GAIN, this[channel].d))
        }
    }
}