import THREE from 'three'
import Cmyk from './effects/cmyk'
import Rgb from './experiences/sixties_weed'

import CopyShader from 'imports?THREE=three!three/examples/js/shaders/CopyShader';
import EffectComposer from 'imports?THREE=three!three/examples/js/postprocessing/EffectComposer'

import TexturePass from 'imports?THREE=three!three/examples/js/postprocessing/TexturePass'
import RenderPass from 'imports?THREE=three!three/examples/js/postprocessing/RenderPass'
import ShaderPass from 'imports?THREE=three!three/examples/js/postprocessing/ShaderPass'

const canvas2d = document.getElementById('canvas2d')

const nearestPowerOfTwo = dim => {
    let power = 2
    while (dim >>= 1)
        power <<= 1
    return power
}

export class Eye {
    constructor(stream, renderer, effect) {
        this.stream = stream;

        const [canvas, ctx] = this._createCanvas(stream)
        this._canvas = canvas
        this._ctx = ctx

        this.map = new THREE.Texture(this._canvas)
        this._effect = effect.forComposer(renderer, this.map)
    }

    getTexture() {
        return this._effect.getOutput()
    }

    update(time, delta) {
        this._ctx.drawImage(this.stream, 0, 0, this._canvas.width, this._canvas.height)
        this.map.needsUpdate = true
        this._effect.render(time, delta)
    }

    _createCanvas(img) {
        const canvas = document.createElement('canvas')
        canvas.width = nearestPowerOfTwo(img.width)
        canvas.height = nearestPowerOfTwo(img.height)

        const ctx = canvas.getContext('2d')
        ctx.translate(canvas.width, canvas.height)
        ctx.scale(-1, -1)
        return [canvas, ctx]
    }
}

export default class Renderer {
    constructor(canvas, container) {
        this._container = container
        this._clock = new THREE.Clock()
        this._lastMs = 0

        this._scene = new THREE.Scene()
        this._effect = new Rgb();

        this._initRenderer(canvas)
        this._initCamera()
        this._initComposer()
        this._onResize()

        window.addEventListener('resize', () => this._onResize(), false)
    }

    pulse(data) {
        this._effect.push(data)
    }

    setImage(left, right) {
        this.leftEye = new Eye(left, this._renderer, this._effect)
        this.rightEye = right ? new Eye(right, this._renderer, this._effect) : this.leftEye
        this._initGeometry()
    }

    _initRenderer(canvas) {
        this._renderer = new THREE.WebGLRenderer({ canvas: canvas, preserveDrawingBuffer: true, depthBuffer: false, })
        this._renderer.setClearColor(0x000000)
    }

    _initCamera() {
        this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000)
        this._camera.position.set(0, 0, 5)
        this._scene.add(this._camera)
    }

    /**
     * Setup the composer.
     */
    _initComposer() {
        this._composer = new THREE.EffectComposer(this._renderer);
        const r1 = new THREE.RenderPass(this._scene, this._camera)
        r1.renderToScreen = true;
        this._composer.addPass(r1)

    }

    _initGeometry() {
        // Poor mans webvr :)
        const geometry = new THREE.PlaneGeometry(1, 2);

        this._leftMaterial = new THREE.MeshBasicMaterial({ map: this.leftEye.getTexture() })
        this._left = new THREE.Mesh(geometry, this._leftMaterial)
        this._left.position.setX(-0.5)
        this._scene.add(this._left)

        this._rightMaterial = new THREE.MeshBasicMaterial({ map: this.rightEye.getTexture() })
        this._right = new THREE.Mesh(geometry, this._rightMaterial)
        this._right.position.setX(0.5)
        this._scene.add(this._right)
    }

    _getViewportSize() {
        return [this._container.clientWidth, this._container.clientHeight]
    }

    _onResize() {
        const width = this._container.clientWidth
        const height = this._container.clientHeight
        const scaling = window.devicePixelRatio ? window.devicePixelRatio : 1;

        this._renderer.setPixelRatio(scaling);
        this._renderer.setSize(width, height);

        const bufferWidth = width * scaling;
        const bufferHeight = height * scaling;
        this._composer.setSize(bufferWidth, bufferHeight);
    }

    animate() {
        const startMs = this._clock.getElapsedTime() * 1000
        const deltaMs = this._clock.getDelta() * 1000

        requestAnimationFrame(() => this.animate())

        // Update image
        this._effect.update(startMs, deltaMs)

        this.leftEye.update(startMs, deltaMs)
        if (this.rightEye !== this.leftEye) {
            // this.rightEye.update(startMs)
        }

        this._leftMaterial.needsUpdate = true
        this._rightMaterial.needsUpdate = true


        this._render()
    }

    _render() {
        this._composer.render();
    }
}
