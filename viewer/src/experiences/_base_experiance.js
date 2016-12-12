import THREE from 'three'

class Renderer {
    constructor(effects, renderer, map) {
        this._target = new THREE.WebGLRenderTarget(map.image.width, map.image.height, { depthBuffer: false, stencilBuffer: false })
        this._composer = new THREE.EffectComposer(renderer, this._target)
        this._inputPass = new THREE.TexturePass(map)
        this._composer.addPass(this._inputPass);
        for (const p of effects)
            this._composer.addPass(p.getPass())
        this._composer.addPass(new THREE.ShaderPass(THREE.CopyShader))
    }

    getOutput() {
        return this._target.texture
    }

    render(time, delta) {
        this._composer.render()
    }
}

export default class SimpleComposer {
    constructor() { }

    forComposer(renderer, map) {
        return new Renderer(this._effects, renderer, map)
    }

    push(data) {
        // noop
    }

    update(time) {
        this._effects.forEach(p => p.update && p.update(time))
    }
}