import THREE from 'three'


const shader = {
    uniforms: {
        tDiffuse: { type: 'tDiffuse', value: null },
        strength: { type: 'f', value: 0.5 },
    },
    vertexShader: require('./standard.vert'),
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float strength;

        varying vec2 vUv;
     
        void main() {
            vec4 tex = texture2D(tDiffuse, vUv);;
            float gamma = 1.0 - pow(tex.r, strength);
            tex.rgb += (tex.rgb * tex.a) * saturate(gamma);
            gl_FragColor = tex;
        }
    `,
}

/**
 * Fake hdr effect
 */
export default class HdrEffect {
    constructor(strength = 0.5) {
        this._pass = new THREE.ShaderPass(shader)
        this.setStrength(strength)
    }

    getPass() {
        return this._pass
    }

    setStrength(value) {
        this.pass.uniforms.strength.value = value
        this.pass.uniforms.strength.needsUpdate = true
    }
}