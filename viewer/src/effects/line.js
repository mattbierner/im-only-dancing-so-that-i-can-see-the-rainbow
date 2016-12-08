import THREE from 'three'


//https://github.com/jjhesk/unity-interview/blob/master/Assets/Resources/Aubergine/Shaders/ImageEffects/LineArt.shader
const shader = {
    uniforms: {
        map: { type: 'map', value: null }
    },
    vertexShader: require('./standard.vert'),
    fragmentShader: `
        uniform sampler2D map;
        uniform vec3 weights;

        varying vec2 vUv;

        float luminance(vec3 rgb) {
            const vec3 W = vec3(0.2125, 0.7154, 0.0721);
            return dot(rgb, W);
        }

        const vec3 _LineColor = vec3(0.909, 0.415, 1.0);//
        const vec3 _bgColor = vec3(0.50, 1.0, 0.81);


        void main() {
            float _Strength = 500.0;
            float x = vUv.x;
            float xi = floor(x * _Strength);
            float x2 = xi / _Strength;

            float f = (x - x2) * _Strength;
            if (f > 0.5)
                f = 1.0 - f;
            vec4 main = texture2D(map,  vec2(x2, vUv.y));

            float lum =  luminance(main.rgb) * 0.5;
            if (f > 0.45)
                lum = 1.0;
            else if(f < 0.5 - lum)
                lum = 0.0;
            else {
                f = 0.45 - f;
                lum = 1.0 - f / lum;
            }
            main.rgb = lum * _LineColor.rgb + (1.0 - lum) * (_bgColor);
            //main.a *= _LineColor.a * lum;
            gl_FragColor = main;
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