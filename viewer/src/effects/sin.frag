#define SIZE 8
#define LUT_FLIP_Y 1
#pragma glslify: transform = require('glsl-lut')

uniform sampler2D tDiffuse;
uniform sampler2D table;
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
    vec3 result = transform(tex, table).rgb;
    for (int i = 0; i < SIZE; ++i) {
        vec3 diff = abs(tex.rgb - targetColors[i]);
        if (max3(diff) < tolerance[i]) {
            result = mix(gray, replacementColors[i], strength);
            //result = mix(result, replacementColors[i], strength * (tolerance - max3(diff)));
        }
    }
    gl_FragColor = vec4(result, tex.a);
}