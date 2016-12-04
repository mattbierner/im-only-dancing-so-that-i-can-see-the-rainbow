import THREE from 'three';

/**
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

        vec4 rgbToCmyk(vec3 rgb) {
            float k = min(1.0 - rgb.r, min(1.0 - rgb.g, 1.0 - rgb.b));
            return vec4((1.0 - rgb - k) / (1.0 - k), k);
        }

        vec3 cmykToRgb(vec4 cmyk) { 
            return 1.0 - min(vec3(1.0), cmyk.xyz * ( 1.0 - cmyk.w ) + cmyk.w);
        }

        void main() {
            vec4 tex = texture2D(map, vUv);
            vec3 gray = vec3(tex.r * 0.2126 + tex.g * 0.7152 + tex.b * 0.0722);

            vec4 cmyk = rgbToCmyk(tex.rgb);
            vec4 graycmyk = rgbToCmyk(gray);

            vec4 color = cmyk + max(cmyk - graycmyk, 0.0) * vec4(weights, 1.0);

            gl_FragColor = vec4(cmykToRgb(color), tex.w);
        }
    `,
};