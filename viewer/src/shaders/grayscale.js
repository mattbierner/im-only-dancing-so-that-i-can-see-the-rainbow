import THREE from 'three';

/**
 */
export default {
    uniforms: {
        map: { type: 't', value: new THREE.Texture() }
    },
    vertexShader: `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D map;

        varying vec2 vUv;

        void main() {
            vec4 tex = texture2D(map, vUv);
            vec3 gray = vec3(tex.r * 0.2126 + tex.g * 0.7152 + tex.b * 0.0722);
            gl_FragColor = vec4(gray, 1.0);
        }
    `,
};