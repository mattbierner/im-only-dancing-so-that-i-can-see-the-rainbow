import THREE from 'three'

const shader = {
    uniforms: {
        tDiffuse: { type: 'tDiffuse', value: new THREE.Texture() },
        time: { type: 'f', value: 0 },
        speed: { type: 'f', value: 0.001 },
        amplitude: { type: 'f', value: 0.15 }
    },
    vertexShader: require('./standard.vert'),
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float speed;
        uniform float amplitude;

        varying vec2 vUv;

        void main() {
            vec2 uv = vUv;
            vec2 center = vec2(0.5, 0.5);
            uv -= center;
            uv *= 1.0 - (sin(time * speed) * amplitude + amplitude) * 0.5;
            uv += center;

            gl_FragColor = texture2D(tDiffuse, uv);
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

    getPass() {
        return this._pass
    }

    update(time) {
        this._pass.uniforms.time.value = time
        this._pass.uniforms.time.needsUpdate = true
    }
}