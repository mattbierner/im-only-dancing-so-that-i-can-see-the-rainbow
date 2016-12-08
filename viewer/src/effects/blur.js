import THREE from 'three'

const shader = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        strength: { type: 'f', value: 0.001 }
    },
    vertexShader: require('./standard.vert'),
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float strength;

        varying vec2 vUv;

        void main() {
            vec4 main = texture2D(tDiffuse, vUv);

            main.rgb += texture2D(tDiffuse, vUv + strength * 1.0).rgb;
            main.rgb += texture2D(tDiffuse, vUv + strength * 2.0).rgb;
            main.rgb += texture2D(tDiffuse, vUv + strength * 3.0).rgb;
            main.rgb += texture2D(tDiffuse, vUv + strength * 4.0).rgb;
            main.rgb += texture2D(tDiffuse, vUv + strength * 5.0).rgb;
            main.rgb += texture2D(tDiffuse, vUv - strength * 1.0).rgb;
            main.rgb += texture2D(tDiffuse, vUv - strength * 2.0).rgb;
            main.rgb += texture2D(tDiffuse, vUv - strength * 3.0).rgb;
            main.rgb += texture2D(tDiffuse, vUv - strength * 4.0).rgb;
            main.rgb += texture2D(tDiffuse, vUv - strength * 5.0).rgb;

            main.rgb /= 10.0;

            gl_FragColor = main;
        }
    `,
};

/**
 * Multisample blur
 */
export default class BlurEffect {
    constructor() {
        this._pass = new THREE.ShaderPass(shader)
    }

    getPasses() {
        return [this._pass]
    }

    setStrength(value) {
        this._pass.uniforms.strength.value = value
        this._pass.uniforms.strength.needsUpdate = true
    }

    update(time) {
        /* noop */
    }
}