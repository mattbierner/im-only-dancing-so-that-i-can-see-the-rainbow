import THREE from 'three'

const shader = {
    uniforms: {
        map: { type: 'map', value: new THREE.Texture() }
    },
    vertexShader: require('./standard.vert'),
    fragmentShader: `
        uniform sampler2D map;
        uniform vec3 weights;

        varying vec2 vUv;

        void main() {
            float colors = 10.0;
            float gamma = 0.6;
            vec4 tex = texture2D(map, vUv);
            tex.rgb = pow(tex.rgb, vec3(gamma)) * colors;
            tex.rgb = floor(tex.rgb) / colors;
            tex.rgb = pow(tex.rgb, vec3(1.0 / gamma));
            gl_FragColor = tex;
        }
    `,
};

export default class PosterEffect {
    constructor() {
        this.pass = new THREE.ShaderPass(shader, 'map')
    }

    push(data) {
    }

    update(clock) {
    }
}