import THREE from 'three'
import pulseShader from './shaders/vignette_red'//beat_show'

const sampleMax = 1024

const canvas2d = document.getElementById('canvas2d')
const decay = 0.9

const nearestPowerOfTwo = dim => {
    let power = 2
    while (dim >>= 1)
        power <<= 1
    return power
}

export default class Renderer {
    constructor(canvas, container) {
        this._container = container
        this._clock = new THREE.Clock()
        this._lastMs = 0

        this._state = {
            left: {
                last: new THREE.Vector3(0.5, 0.5, 0.5),
                d: 0
            }
        }

        this._scene = new THREE.Scene()

        this._initRenderer(canvas)
        this._initCamera()

        window.addEventListener('resize', () => this._onResize(), false)
    }

    pulse(data) {
        this._lastMs = this._clock.getElapsedTime() * 1000

        for (const channel of ['left']) {
            const current = new THREE.Vector3(data[channel].x, data[channel].y, data[channel].z).divideScalar(sampleMax)
            const d = new THREE.Vector3().subVectors(current, this._state[channel].last)

            this._state[channel].d += (d.length() || 0) * 2
            this._state[channel].d *= decay
            this._state[channel].d = Math.max(0, this._state[channel].d)

            this._state[channel].last = current
        }
    }

    setImage(img) {
        this._stream = img
        this._canvas2d = this._createCanvas(img)
        this._ctx = this._canvas2d.getContext('2d')
        this._ctx.translate(this._canvas2d.width, this._canvas2d.height);
        this._ctx.scale(-1, -1);

        this._initMaterials()
        this._initGeometry()
    }

    _createCanvas(img) {
        const canvas = document.createElement('canvas')
        canvas.width = nearestPowerOfTwo(img.width)
        canvas.height = nearestPowerOfTwo(img.height)
        return canvas
    }

    _initRenderer(canvas) {
        this._renderer = new THREE.WebGLRenderer({ canvas: canvas })
        this._renderer.setClearColor(0xff00ff)
        this._onResize()
    }

    _initCamera() {
        this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000)
        this._camera.position.set(0, 0, 5)
        this._scene.add(this._camera)
    }

    _initMaterials() {
        this._map = new THREE.Texture(this._canvas2d)

        this._material = new THREE.ShaderMaterial(pulseShader)
        this._material.uniforms.map.value = this._map
        this._material.uniforms.map.needsUpdate = true
    }

    _initGeometry() {
        // Poor mans webvr :)
        const geometry = new THREE.PlaneGeometry(1, 2);

        this._left = new THREE.Mesh(geometry, this._material)
        this._left.position.setX(-0.5)
        this._scene.add(this._left)

        this._right = new THREE.Mesh(geometry, this._material)
        this._right.position.setX(0.5)
        this._scene.add(this._right)
    }

    _onResize() {
        this._renderer.setSize(this._container.clientWidth, this._container.clientHeight);
    }

    animate() {
        const startMs = this._clock.getElapsedTime() * 1000
        const deltaMs = this._clock.getDelta() * 1000

        requestAnimationFrame(() => this.animate())

        // Update image
        this._ctx.drawImage(this._stream, 0, 0, this._canvas2d.width, this._canvas2d.height)
        this._map.needsUpdate = true
        this._material.needsUpdate = true

    

        this._material.uniforms.weights.value.z = this._state.left.d
        this._material.uniforms.weights.needsUpdate = true

        this._render()
    }

    _render() {
        this._renderer.render(this._scene, this._camera)
    }
}
