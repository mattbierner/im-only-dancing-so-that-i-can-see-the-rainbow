import THREE from 'three'

const shader = {
    uniforms: {
        tDiffuse: { type: 't', value: new THREE.Texture() },
        table: { type: 't', value: null },
        strength: { type: 'f', value: 1.0 }
    },
    vertexShader: require('./standard.vert'),
    fragmentShader: require('./lut.frag'),
};

/**
 * Lookup table effect.
 */
export default class Lut {
    constructor(tablePath) {
        this._pass = new THREE.ShaderPass(shader)
        new THREE.TextureLoader().load(tablePath, tex => {
            tex.minFilter = tex.magFilter = THREE.NearestFilter
            tex.needsUpdate = true
            this._pass.uniforms.table.value = tex
            this._pass.uniforms.table.needsUpdate = true
        })
    }

    getPasses() {
        return [this._pass]
    }

    setStrength(value) {
        this._pass.uniforms.strength.value = value
        this._pass.uniforms.strength.needsUpdate = true
    }

    update(time) {
        /* noop */
    }
}