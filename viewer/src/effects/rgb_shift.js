import THREE from 'three'

// From felixturner / http://airtight.cc/
const shader = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        amount: { type: 'f', value: 0.01 },
        angle: { type: 'f', value: 0.2 },
        strength: { type: 'f', value: 1.0 }
    },
    vertexShader: require('./standard.vert'),
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float amount;
        uniform float angle;
        uniform float strength;
        varying vec2 vUv;

        void main() {
            vec2 offset = strength * amount * vec2( cos(angle), sin(angle));
            vec4 cr = texture2D(tDiffuse, vUv + offset);
            vec4 cga = texture2D(tDiffuse, vUv);
            vec4 cb = texture2D(tDiffuse, vUv - offset);
            gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);
        }`
};

/**
 * Rgb Shift Effect
 */
export default class RgbShift {
    constructor(tablePath) {
        this._pass = new THREE.ShaderPass(shader)
    }

    getPass() {
        return this._pass
    }

    setStrength(value) {
        this._pass.uniforms.strength.value = value
        this._pass.uniforms.strength.needsUpdate = true
    }

}