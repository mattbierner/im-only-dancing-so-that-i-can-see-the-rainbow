import THREE from 'three';
import repeat from '../util/repeat'

const ARRAY_SIZE = 8

/**
 * Shader with multiple vignette overlays
 */
const shader = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        time: { type: 'f', value: 0 },
        strength: { type: 'f', value: 1.0 },
        color: { type: 'v4v', value: repeat(new THREE.Vector4(0, 0, 0, 0), ARRAY_SIZE) },
        radius: { type: 'fv', value: repeat(0.5, ARRAY_SIZE) },
        softness: { type: 'fv', value: repeat(0.5, ARRAY_SIZE) },
        waves: { type: 'fv', value: repeat(0, ARRAY_SIZE) },
        magnitude: { type: 'fv', value: repeat(0.2, ARRAY_SIZE) },
        speed: { type: 'fv', value: repeat(0, ARRAY_SIZE) },
        offset: { type: 'fv', value: repeat(0, ARRAY_SIZE) },
    },
    vertexShader: require('./standard.vert'),
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float strength;

        uniform vec4 color[${ARRAY_SIZE}];
        uniform float radius[${ARRAY_SIZE}];
        uniform float softness[${ARRAY_SIZE}];
        uniform float waves[${ARRAY_SIZE}];
        uniform float magnitude[${ARRAY_SIZE}];
        uniform float offset[${ARRAY_SIZE}];
        uniform float speed[${ARRAY_SIZE}];

        varying vec2 vUv;

        void main() {
            vec4 tex = texture2D(tDiffuse, vUv);

            vec2 position = vUv - 0.5;
            float angle = atan(position.y, position.x);

            for (int i = 0; i < ${ARRAY_SIZE}; ++i) {
                float len = length(position) + sin((angle + (time + offset[i])  * speed[i] ) * waves[i]) * magnitude[i];
                float weight = 1.0 - smoothstep(radius[i], radius[i] - softness[i], len);
                tex.rgb = mix(tex.rgb, color[i].rgb, strength * color[i].a * weight);
            }
            gl_FragColor = vec4(tex.rgb, 1.0);
        }
    `,
};

export default class VignetteEffect {
    constructor(vignettes) {
        this._pass = new THREE.ShaderPass(shader)
        this.setVignettes(vignettes)
    }

    getPass() {
        return this._pass
    }

    setVignettes(vignettes) {
        let i = 0;
        for (const vignette of vignettes) {
            this._pass.uniforms.color.value[i] = vignette.color.clone()
            this._pass.uniforms.radius.value[i] = vignette.radius
            this._pass.uniforms.softness.value[i] = vignette.softness
            this._pass.uniforms.waves.value[i] = vignette.waves
            this._pass.uniforms.magnitude.value[i] = vignette.magnitude
            this._pass.uniforms.offset.value[i] = vignette.offset
            this._pass.uniforms.speed.value[i] = vignette.speed
            ++i
        }

        this._pass.uniforms.color.needsUpdate = true
        this._pass.uniforms.radius.needsUpdate = true
        this._pass.uniforms.softness.needsUpdate = true
        this._pass.uniforms.waves.needsUpdate = true
        this._pass.uniforms.offset.needsUpdate = true
        this._pass.uniforms.magnitude.needsUpdate = true
        this._pass.uniforms.speed.needsUpdate = true
    }

    update(time) {
        this._pass.uniforms.time.value = time
        this._pass.uniforms.time.needsUpdate = true
    }

    setStrength(value) {
        this._pass.uniforms.strength.value = value
        this._pass.uniforms.strength.needsUpdate = true
    }
}