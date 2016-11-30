import THREE from 'three';

/**
 * Draws a red vignette on each beat.
 */
export default {
    uniforms: {
        map: { type: 't', value: new THREE.Texture() },
        weights: { type: 'v3', value: new THREE.Vector3(0, 0, 0) },
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
        uniform vec3 weights;

        varying vec2 vUv;

        void main() {
            vec4 tex = texture2D(map, vUv);
            vec3 gray = vec3(tex.r * 0.2126 + tex.g * 0.7152 + tex.b * 0.0722);

            vec3 color = gray + max(tex.rgb - gray, 0.0) * weights;

            gl_FragColor = vec4(color, 1.0);
        }
    `,
};