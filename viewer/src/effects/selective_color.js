import THREE from 'three'

const ARRAY_SIZE = 8;

const repeat = (x, times) => {
    const out = [];
    for (let i = 0; i < times; ++i)
        out.push(x)
    return out
}

const shader = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        saturation: { type: 'f', value: 0.9 },
        tolerance: { type: 'fv', value: repeat(0, ARRAY_SIZE) },
        strength: { type: 'f', value: 0.4 },
        targetColors: { type: 'v3v', value: repeat(new THREE.Vector3(-100, -100, -100), ARRAY_SIZE) },
        replacementColors: { type: 'v3v', value: repeat(new THREE.Vector3(-100, -100, -100), ARRAY_SIZE) },
    },
    vertexShader: require('./standard.vert'),
    fragmentShader: `
        #define SIZE ${ARRAY_SIZE}

        uniform sampler2D tDiffuse;
        uniform float saturation;
        uniform float tolerance[SIZE];
        uniform float strength;
        uniform vec3 targetColors[SIZE];
        uniform vec3 replacementColors[SIZE];

        varying vec2 vUv;

        float luminance(vec3 rgb) {
            const vec3 W = vec3(0.2125, 0.7154, 0.0721);
            return dot(rgb, W);
        }

        float max3(vec3 v) {
            return max(max(v.x, v.y), v.z);
        }

        void main() {
            vec4 tex = texture2D(tDiffuse, vUv);
            vec3 gray = vec3(luminance(tex.rgb) * saturation);
            vec3 result = gray;
            for (int i = 0; i < SIZE; ++i) {
                vec3 diff = abs(tex.rgb - targetColors[i]);
                if (max3(diff) < tolerance[i]) {
                    result = mix(result, replacementColors[i], strength);
                    //result = mix(result, replacementColors[i], strength * (tolerance - max3(diff)));
                }
            }
            gl_FragColor = vec4(result, tex.a);
        }`,
};

/**
 * Selects one color and replaces it with another solid color
 */
export default class SelectiveColor {
    constructor(replacements) {
        this._pass = new THREE.ShaderPass(shader)
        this.setColors(replacements)
    }

    getPasses() {
        return [this._pass]
    }

    update(time) {
        /* noop */
    }

    setStrength(value) {
        this._pass.uniforms.strength.value = value
        this._pass.uniforms.strength.needsUpdate = true
    }



    setColors(replacements) {
        let i = 0;
        for (const [tolerance, target, replacement] of replacements) {
            this._pass.uniforms.tolerance.value[i] = tolerance
            this._pass.uniforms.targetColors.value[i] = target
            this._pass.uniforms.replacementColors.value[i] = replacement
            ++i
        }
        this._pass.uniforms.targetColors.needsUpdate = true
        this._pass.uniforms.replacementColors.needsUpdate = true
    }
}