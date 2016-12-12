import THREE from 'three'
import repeat from '../util/repeat'

const ARRAY_SIZE = 8

const shader = {
    uniforms: {
        tDiffuse: { type: 'tDiffuse', value: null },
        time: { type: 'f', value: 0 },
        strength: { type: 'fv', value: repeat(0, ARRAY_SIZE) },
        offset: { type: 'fv', value: repeat(0, ARRAY_SIZE) },
        sample: { type: 'fv', value: repeat(0, ARRAY_SIZE) },
        speed: { type: 'fv', value: repeat(0, ARRAY_SIZE) },
        amplitude: { type: 'fv', value: repeat(0, ARRAY_SIZE) },
        count: { type: 'i', value: 1 }
    },
    vertexShader: require('./standard.vert'),
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float strength[${ARRAY_SIZE}];
        uniform float offset[${ARRAY_SIZE}];
        uniform float sample[${ARRAY_SIZE}];
        uniform float speed[${ARRAY_SIZE}];
        uniform float amplitude[${ARRAY_SIZE}];
        uniform int count;

        varying vec2 vUv;

        void main() {
            vec4 main = vec4(0.0);
            float sampleWeight = 1.0 / (float(count) * 2.0);
            for (int i = 0; i < ${ARRAY_SIZE}; ++i) {
                vec2 uv = vUv;
                vec2 center = vec2(0.5, 0.5);
                uv -= center;
                uv *= 1.0 - (sin((time + offset[i]) * speed[i]) * amplitude[i] + amplitude[i]) * 0.5;
                uv += center;

                main.rgb += texture2D(tDiffuse, uv + sample[i]).rgb * strength[i] * sampleWeight;
                main.rgb += texture2D(tDiffuse, uv - sample[i]).rgb * strength[i] * sampleWeight;
            }

            gl_FragColor = main;
        }
    `,
};

/**
 * 
 */
export default class PulseEffect {
    constructor(blurs) {
        this._pass = new THREE.ShaderPass(shader)

        this.setBlurs(blurs)
    }

    getPass() {
        return this._pass
    }

    setBlurs(blurs) {
        let i = 0;
        for (const blur of blurs) {
            this._pass.uniforms.strength.value[i] = blur.strength
            this._pass.uniforms.offset.value[i] = blur.offset
            this._pass.uniforms.speed.value[i] = blur.speed
            this._pass.uniforms.amplitude.value[i] = blur.amplitude
            this._pass.uniforms.sample.value[i] = blur.sample
            ++i
        }
        this._pass.uniforms.strength.needsUpdate = true
        this._pass.uniforms.offset.needsUpdate = true
        this._pass.uniforms.speed.needsUpdate = true
        this._pass.uniforms.amplitude.needsUpdate = true
        this._pass.uniforms.sample.needsUpdate = true


        this._pass.uniforms.count.value = blurs.length
        this._pass.uniforms.count.needsUpdate = true
    }

    update(time) {
        this._pass.uniforms.time.value = time
        this._pass.uniforms.time.needsUpdate = true
    }
}