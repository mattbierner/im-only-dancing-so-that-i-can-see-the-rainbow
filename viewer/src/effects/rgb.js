import THREE from 'three'
import BaseColorEffect from './color_base'

const shader = {
    uniforms: {
        map: { type: 't', value: new THREE.Texture() },
        weights: { type: 'v3', value: new THREE.Vector3(0, 0, 0) },
    },
    vertexShader: require('./standard.vert'),
    fragmentShader: `
        uniform sampler2D map;
        uniform vec3 weights;

        varying vec2 vUv;

        void main() {
            vec4 tex = texture2D(map, vUv);
            vec3 gray = vec3(tex.r * 0.2126 + tex.g * 0.7152 + tex.b * 0.0722);

            vec3 color = gray + max(tex.rgb - gray, 0.0) * weights;

            gl_FragColor = vec4(color, 1.0);
        }
    `,
}

export default class Rgb extends BaseColorEffect {
    constructor() {
        super(shader)
    }
}