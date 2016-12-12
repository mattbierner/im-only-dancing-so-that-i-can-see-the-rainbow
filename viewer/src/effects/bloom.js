import THREE from 'three'

const shader = {
    uniforms: {
        tDiffuse: { type: 'tDiffuse', value: null },
        strength: { type: 'f', value: 0.5 }
    },
    vertexShader: require('./standard.vert'),
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float strength;

        varying vec2 vUv;

        void main() {
            vec4 main =  texture2D(tDiffuse, vUv);;
            float gamma = 1.0 - pow(main.r, strength);
            main.rgb += (main.rgb * main.a) * saturate(gamma);
            gl_FragColor = main;
        }
    `,
};

export default class BloomEffet {
    constructor(strength = 0.5) {
        this._pass = new THREE.ShaderPass(shader)
        this.setStrength(strength);
    }

    getPass() {
        return this._pass
    }

    setStrength(value) {
        this._pass.uniforms.strength.value = value
        this._pass.uniforms.strength.needsUpdate = true
    }
}