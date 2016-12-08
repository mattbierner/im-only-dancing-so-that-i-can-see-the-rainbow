import THREE from 'three'

// From felixturner / http://airtight.cc/
const shader = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        amount: { type: 'f', value: 0.005 },
        angle: { type: 'f', value: 0.0 }
    },
    vertexShader: require('./standard.vert'),
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float amount;
        uniform float angle;

        varying vec2 vUv;

        void main() {
            vec2 offset = amount * vec2( cos(angle), sin(angle));
            vec4 cr = texture2D(tDiffuse, vUv + offset);
            vec4 cga = texture2D(tDiffuse, vUv);
            vec4 cb = texture2D(tDiffuse, vUv - offset);
            gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);
        }`,
};

/**
 * Rgb Shift Effect
 */
export default class RgbShift {
    constructor(tablePath) {
        this._pass = new THREE.ShaderPass(shader)
    }

    getPasses() {
        return [this._pass]
    }

    update(time) {
        /* noop */
    }
}