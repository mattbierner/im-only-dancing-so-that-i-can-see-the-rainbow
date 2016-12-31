import THREE from 'three'

// Adapted from http://www.geeks3d.com/20110428/shader-library-swirl-post-processing-filter-in-glsl/
const shader = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        time: { type: 'f', value: 0 }
    },
    vertexShader: require('./standard.vert'),
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;

        varying vec2 vUv;

        void main() {
            float radius = 0.8;
            float angle = 0.6 * sin(time);
            vec2 tc = vUv - vec2(0.5, 0.5);
            float dist = length(tc);
            if (dist < radius) 
            {
                float percent = (radius - dist) / radius;
                float theta = percent * percent * angle * 8.0;
                float s = sin(theta);
                float c = cos(theta);
                tc = vec2(dot(tc, vec2(c, -s)), dot(tc, vec2(s, c)));
            }
            tc += vec2(0.5, 0.5);
            gl_FragColor = texture2D(tDiffuse, tc);
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

    getPass() {
        return this._pass
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