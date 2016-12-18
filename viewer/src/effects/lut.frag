#define LUT_FLIP_Y 1
#pragma glslify: transform = require('glsl-lut')

uniform sampler2D tDiffuse;
uniform sampler2D table;

uniform float strength;

varying vec2 vUv;

void main() {
    vec4 tex = texture2D(tDiffuse, vUv);
    gl_FragColor = mix(tex, transform(tex, table), clamp(strength, 0.0, 1.0));
}
