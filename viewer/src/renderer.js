import THREE from 'three'
import Cmyk from './effects/cmyk'
import Rgb from './effects/rgb'

import CopyShader from 'imports?THREE=three!three/examples/js/shaders/CopyShader';
import EffectComposer from 'imports?THREE=three!three/examples/js/postprocessing/EffectComposer'

import RenderPass from 'imports?THREE=three!three/examples/js/postprocessing/RenderPass'
import ShaderPass from 'imports?THREE=three!three/examples/js/postprocessing/ShaderPass'


const canvas2d = document.getElementById('canvas2d')

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

        this._scene = new THREE.Scene()
        this._s2 = new Rgb();

        this._initRenderer(canvas)
        this._initCamera()
        this._initComposer()
        this._onResize()

        window.addEventListener('resize', () => this._onResize(), false)
    }

    pulse(data) {
        this._s2.push(data)
    }

    setImage(left, right) {
        this._streamLeft = left
        this._streamRight = right

        const [canvasLeft, ctxLeft] = this._createCanvas(left)
        this._canvasLeft = canvasLeft
        this._ctxLeft = ctxLeft

        if (right) {
            const [canvasRight, ctxRight] = this._createCanvas(right)
            this._canvasRight = canvasRight
            this._ctxRight = ctxRight
        }

        this._initMaterials()
        this._initGeometry()
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

    _initRenderer(canvas) {
        this._renderer = new THREE.WebGLRenderer({ canvas: canvas })
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
        this._composer.addPass(r1)

        this._composer.addPass(this._s2.pass)
        this._s2.pass.renderToScreen = true
    }

    _initMaterials() {
        this._mapLeft = new THREE.Texture(this._canvasLeft)
        this._materialLeft = new THREE.MeshBasicMaterial({ map: this._mapLeft })

        if (this._canvasRight) {
            this._mapRight = new THREE.Texture(this._canvasRight)
        } else {
            this._mapRight = this._mapLeft
        }
        this._materialRight = new THREE.MeshBasicMaterial({ map: this._mapRight })
    }

    _initGeometry() {
        // Poor mans webvr :)
        const geometry = new THREE.PlaneGeometry(1, 2);

        this._left = new THREE.Mesh(geometry, this._materialLeft)
        this._left.position.setX(-0.5)
        this._scene.add(this._left)

        this._right = new THREE.Mesh(geometry, this._materialRight)
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
        this._ctxLeft.drawImage(this._streamLeft, 0, 0, this._canvasLeft.width, this._canvasLeft.height)
        this._mapLeft.needsUpdate = true
        this._materialLeft.needsUpdate = true

        if (this._ctxRight) {
            this._ctxRight.drawImage(this._streamRight, 0, 0, this._canvasRight.width, this._canvasRight.height)
        }
        
        this._mapRight.needsUpdate = true
        this._materialRight.needsUpdate = true

        this._s2.update()
        this._render()
    }

    _render() {
        this._composer.render()
    }
}
