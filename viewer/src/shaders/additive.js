export default {
    uniforms: {
        tDiffuse1: { type: 't', value: null },
        tDiffuse2: { type: 't', value: null }
    },

    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `,

    fragmentShader: `
        uniform sampler2D tDiffuse1;
        uniform sampler2D tDiffuse2;

        varying vec2 vUv;

        void main() {
            vec4 texel1 = texture2D(tDiffuse1, vUv);
            vec4 texel2 = texture2D(tDiffuse2, vUv);

            vec4 gray = vec4(vec3(texel1.r * 0.2126 + texel1.g * 0.7152 + texel1.b * 0.0722), texel1.w);

            gl_FragColor =   texel2;
        }
    `
};