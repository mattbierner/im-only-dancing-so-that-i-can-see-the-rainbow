import THREE from 'three'

const shader = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        table: { type: 't', value: null },
        strength: { type: 'f', value: 1.0 }
    },
    vertexShader: require('./standard.vert'),
    fragmentShader: require('./lut.frag'),
};

/**
 * Lookup table.
 */
export default class Lut {
    constructor(tablePath, strength = 1.0) {
        this.pass = new THREE.ShaderPass(shader)
        new THREE.TextureLoader().load(tablePath, tex => {
            tex.minFilter = tex.magFilter = THREE.NearestFilter
            tex.needsUpdate = true
            this.pass.uniforms.table.value = tex
            this.pass.uniforms.table.needsUpdate = true
        })

        this.setStrength(strength)
    }

    getPass() {
        return this.pass
    }

    setStrength(value) {
        this.pass.uniforms.strength.value = value
        this.pass.uniforms.strength.needsUpdate = true
    }
}