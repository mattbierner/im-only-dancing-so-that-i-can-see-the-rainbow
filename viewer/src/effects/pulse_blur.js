import THREE from 'three'

const shader = {
    uniforms: {
        tDiffuse: { type: 'tDiffuse', value: new THREE.Texture() },
        time: { type: 'f', value: 0 },
        strength: { type: 'f', value: 0.001 },
        speed: { type: 'f', value: 0.001 },
        amplitude: { type: 'f', value: 0.15 }
    },
    vertexShader: require('./standard.vert'),
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float strength;
        uniform float speed;
        uniform float amplitude;
        
        varying vec2 vUv;

        void main() {
            vec2 uv = vUv;
            vec2 center = vec2(0.5, 0.5);
            uv -= center;
            uv *= 1.0 - (sin(time * speed) * amplitude + amplitude) * 0.5;
            uv += center;

            vec4 main = texture2D(tDiffuse, uv);

            main.rgb += texture2D(tDiffuse, uv + strength * 1.0).rgb;
            main.rgb += texture2D(tDiffuse, vUv + strength * 2.0).rgb;
            main.rgb += texture2D(tDiffuse, uv + strength * 3.0).rgb;
            main.rgb += texture2D(tDiffuse, vUv + strength * 4.0).rgb;
            main.rgb += texture2D(tDiffuse, uv + strength * 5.0).rgb;
            main.rgb += texture2D(tDiffuse, uv - strength * 1.0).rgb;
            main.rgb += texture2D(tDiffuse, vUv - strength * 2.0).rgb;
            main.rgb += texture2D(tDiffuse, uv - strength * 3.0).rgb;
            main.rgb += texture2D(tDiffuse, vUv - strength * 4.0).rgb;
            main.rgb += texture2D(tDiffuse, uv - strength * 5.0).rgb;
            main.rgb /= 10.0;

            gl_FragColor = main;
        }
    `,
};

/**
 * 
 */
export default class PulseEffect {
    constructor(tablePath) {
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
        this._pass.uniforms.time.value = time
        this._pass.uniforms.time.needsUpdate = true
    }
}