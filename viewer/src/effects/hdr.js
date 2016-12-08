import THREE from 'three'



const shader = {
    uniforms: {
        tDiffuse: { type: 'tDiffuse', value: null },
        amount: { type: 'f', value: 0.5 },
        multiplier: { type: 'f', value: 1 }

    },
    vertexShader: require('./standard.vert'),
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float amount;
        uniform float multiplier;

        varying vec2 vUv;

        float luminance(vec3 rgb) {
            const vec3 W = vec3(0.2125, 0.7154, 0.0721);
            return dot(rgb, W);
        }

        void main() {
            vec4 tex = texture2D(tDiffuse, vUv);
            vec3 sample = tex.rgb;
            float std = min(amount, (1.0 - amount));
            float score = (luminance(tex.rgb) - amount) / std;
            tex.rgb = (tex.rgb * exp2(score)) - tex.rgb;
            tex *= multiplier;
            gl_FragColor = vec4(tex.rgb + sample, tex.a);
        }
    `,
};

export default class PosterEffect {
    constructor() {
        this._pass = new THREE.ShaderPass(shader)
    }

    getPasses() {
        return [this._pass]
    }

     update(time) {
        /* noop */
    }
}