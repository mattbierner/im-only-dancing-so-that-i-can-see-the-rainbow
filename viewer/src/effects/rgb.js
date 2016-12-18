import THREE from 'three'

const shader = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        weights: { type: 'v3', value: new THREE.Vector3(0, 0, 0) },
    },
    vertexShader: require('./standard.vert'),
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec3 weights;

        varying vec2 vUv;

        void main() {
            vec4 tex = texture2D(tDiffuse, vUv);
            vec3 gray = vec3(tex.r * 0.2126 + tex.g * 0.7152 + tex.b * 0.0722);
            vec3 color = gray + max(tex.rgb - gray, 0.0) * weights;
            gl_FragColor = vec4(color, 1.0);
        }
    `,
}

/**
 * Shows world as grayscale with individually controllable rgb channels
 */
export default class RgbEffect {
    constructor(weights) {
        this._pass = new THREE.ShaderPass(shader)
        this.setWeights(weights)
    }

    getPass() {
        return this._pass
    }

    setWeights(weights) {
        this._pass.uniforms.weights.value.copy(weights)
        this._pass.uniforms.weights.needsUpdate = true
    }
}