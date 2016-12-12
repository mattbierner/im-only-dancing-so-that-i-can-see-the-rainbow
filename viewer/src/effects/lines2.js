import THREE from 'three'

// From https://github.com/jjhesk/unity-interview/blob/master/Assets/Resources/Aubergine/Shaders/ImageEffects/Contours.shader
const shader = {
    uniforms: {
        tDiffuse: { type: 'tDiffuse', value: null },
        sampleSize: { type: 'v2', value: new THREE.Vector2(1 / 800 / 2, 1 / 600 / 2) }
    },
    vertexShader: require('./standard.vert'),
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 sampleSize;

        varying vec2 vUv;

        void main() {
            vec3 minVal = vec3(1.0);
            vec3 maxVal = vec3(0.0);

            for (int xRow = 0; xRow < 4; ++xRow) {
                for (int yRow = 0; yRow < 4; ++yRow) {
                    vec3 sample = texture2D(tDiffuse, vUv + vec2(float(xRow) * sampleSize.x, float(yRow) * sampleSize.y)).rgb;
                    minVal = min(minVal, sample);
                    maxVal = max(maxVal, sample);
                }
            }

            float f = dot(maxVal - minVal, vec3(1.0));
            f = 1.0 - saturate(f);
            f = 0.5 + 1.0 * (f - 0.5);
            f = 1.0 - saturate(f);
            gl_FragColor = 1.0 - vec4(f) * 0.8;

        }
    `,
};


export default class PosterEffect {
    constructor() {
        this._pass = new THREE.ShaderPass(shader)
    }

    getPass() {
        return this._pass
    }

     update(time) {
        /* noop */
    }
}