import THREE from 'three'

const shader = {
    uniforms: {
        samples: { type: 'tv', value: [] },
        weights: { type: 'iv', value: [0.6, 0.25, 0.15, 0.1] },
    },
    vertexShader: require('../effects/standard.vert'),
    fragmentShader: `
        #define size 4
        uniform sampler2D samples[size];
        uniform float weights[size];

        varying vec2 vUv;

        void main() {
            vec4 result = vec4(0.0);
            for (int i = 0; i < size; ++i) {
                result += texture2D(samples[i], vUv) * weights[i];
            }
            gl_FragColor = result;
        }
    `,
};

export default class Accumulator {
    constructor(effect, renderer, map) {
        this._passes = 4;
        this._i = 0
        this._targets = []
        this._composers = []
        for (let i = 0; i < this._passes; ++i) {
            this._targets[i] = new THREE.WebGLRenderTarget(map.image.width, map.image.height, { depthBuffer: false, stencilBuffer: false })
            const composer = new THREE.EffectComposer(renderer, this._targets[i])
            composer.addPass(new THREE.TexturePass(map))
            composer.addPass(new THREE.ShaderPass(THREE.CopyShader))
            this._composers[i] = composer
        }

        this._target = new THREE.WebGLRenderTarget(map.image.width, map.image.height, { depthBuffer: false, stencilBuffer: false, })
        this._composer = new THREE.EffectComposer(renderer, this._target)
        this._inputPass = new THREE.ShaderPass(shader)
        this._composer.addPass(this._inputPass);
        for (const p of effect.getPasses())
            this._composer.addPass(p)
        this._composer.addPass(new THREE.ShaderPass(THREE.CopyShader))
    }

    getOutput() {
        return this._target.texture
    }

    setStrengths(weights){
        this._inputPass.uniforms.weights.value = weights
        this._inputPass.uniforms.weights.needsUpdate = true
    }

    preRender() {
        const step = 3
        const index = Math.floor(this._i / step) % this._passes
        this._composers[index].render()
        if (this._i % step === 0) {
            for (let g = 0; g < this._passes; ++g) {
                this._inputPass.uniforms.samples.value[g] = this._targets[index - g < 0 ? this._passes - Math.abs(index - g) : index - g].texture
            }
            this._inputPass.uniforms.samples.needsUpdate = true
        }
        ++this._i;
    }

    render(time, delta) {
        this.preRender()
        this._composer.render()
    }
}