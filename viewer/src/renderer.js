import THREE from 'three'
import pulseShader from './shaders/cmyk'

import EffectComposer from 'imports?THREE=three!three/examples/js/postprocessing/EffectComposer';
import CopyShader from 'imports?THREE=three!three/examples/js/shaders/CopyShader';
import ConvolutionShader from 'imports?THREE=three!three/examples/js/shaders/ConvolutionShader';

import BloomPass from 'imports?THREE=three!three/examples/js/postprocessing/BloomPass';
import RenderPass from 'imports?THREE=three!three/examples/js/postprocessing/RenderPass';
import ShaderPass from 'imports?THREE=three!three/examples/js/postprocessing/ShaderPass';
import MaskPass from 'imports?THREE=three!three/examples/js/postprocessing/MaskPass';
import HorizontalBlurShader from 'imports?THREE=three!three/examples/js/shaders/HorizontalBlurShader';
import VerticalBlurShader from 'imports?THREE=three!three/examples/js/shaders/VerticalBlurShader';

import additive_shader from './shaders/additive';
import gray_scale_shader from './shaders/grayscale';


const sampleMax = 1023

const canvas2d = document.getElementById('canvas2d')
const decay = 0.975
const SIZE = 6

const MAX_GAIN = 255
const GAIN_SCALE = 0.2

const nearestPowerOfTwo = dim => {
    let power = 2
    while (dim >>= 1)
        power <<= 1
    return power
}



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

export default class Renderer {
    constructor(canvas, container) {
        this._container = container
        this._clock = new THREE.Clock()
        this._lastMs = 0

        this._state = {
            left_leg: new Sensor(),
            right_leg: new Sensor(),
            left_hand: new Sensor(),
            right_hand: new Sensor()
        }

        this._scene = new THREE.Scene()

        this._initRenderer(canvas)
        this._initCamera()
        this.initComposer()
        this._onResize()

        window.addEventListener('resize', () => this._onResize(), false)
    }

    /**
     * Setup the composer.
     */
    initComposer() {
        this._composer = new THREE.EffectComposer(this._renderer);
        const r1 = new THREE.RenderPass(this._scene, this._camera)
        this._composer.addPass(r1);

        this._s2 = new THREE.ShaderPass(pulseShader, 'map');
        this._composer.addPass(this._s2);

        if (true) {
            this._effectHorizBlur = new THREE.ShaderPass(THREE.HorizontalBlurShader);
            this._effectVertiBlur = new THREE.ShaderPass(THREE.VerticalBlurShader);

            const [viewWidth, viewHeight] = this._getViewportSize();
            this._effectHorizBlur.uniforms["h"].value = 1 / viewWidth;
            this._effectVertiBlur.uniforms["v"].value = 1 / viewHeight;
            this._composer.addPass(this._effectHorizBlur);
            this._composer.addPass(this._effectVertiBlur);
        }

        //final render pass
        this._composer2 = new THREE.EffectComposer(this._renderer);

        const r2 = new THREE.RenderPass(this._scene, this._camera)
        this._composer2.addPass(r2);

        var effectBlend = new THREE.ShaderPass(additive_shader, 'tDiffuse1');
        effectBlend.uniforms['tDiffuse2'].value = this._composer.renderTarget2.texture;
        effectBlend.renderToScreen = true;
        this._composer2.addPass(effectBlend);
    }

    pulse(data) {
        this._lastMs = this._clock.getElapsedTime() * 1000
        for (const channel of ['left_leg', 'right_leg', 'left_hand', 'right_hand']) {
            const current = new THREE.Vector3(data[channel].x, data[channel].y, data[channel].z).divideScalar(sampleMax)
            let d = this._state[channel].push(current.x, current.y, current.z).length()
            this._state[channel].d += (d * GAIN_SCALE)
            this._state[channel].d *= decay
            this._state[channel].d = Math.max(0, Math.min(MAX_GAIN, this._state[channel].d))

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
        this._renderer.setClearColor(0x000000)
    }

    _initCamera() {
        this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000)
        this._camera.position.set(0, 0, 5)
        this._scene.add(this._camera)
    }

    _initMaterials() {
        this._map = new THREE.Texture(this._canvas2d)

        this._material = new THREE.MeshBasicMaterial({ map: this._map })
        //this._material.uniforms.map.value = this._map
        //this._material.uniforms.map.needsUpdate = true
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
        this._composer2.setSize(bufferWidth, bufferHeight);
    }

    animate() {
        const startMs = this._clock.getElapsedTime() * 1000
        const deltaMs = this._clock.getDelta() * 1000

        requestAnimationFrame(() => this.animate())

        // Update image
        this._ctx.drawImage(this._stream, 0, 0, this._canvas2d.width, this._canvas2d.height)
        this._map.needsUpdate = true
        this._material.needsUpdate = true

        this._s2.uniforms.weights.value.x = this._state.right_hand.d
        this._s2.uniforms.weights.value.y = this._state.left_hand.d
        this._s2.uniforms.weights.value.z = (this._state.right_leg.d + this._state.left_leg.d) / 2
        this._s2.uniforms.weights.needsUpdate = true

        //this._bloom.materialCopy.uniforms.opacity.value = this._state.right_hand.d
        //this._bloom.materialCopy.uniforms.opacity.needsUpdate = true

        this._render()
    }

    _render() {
        this._composer.render()
        this._composer2.render()
    }
}
