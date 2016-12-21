import THREE from 'three'
import BaseExperinace from './_base_experiance'
import BlurEffect from '../effects/blur'
import PulseBlurEffect from '../effects/pulse_blur'
import LutEffect from '../effects/lut'
import RgbShiftEffect from '../effects/rgb_shift'
import TvEffect from '../effects/tv'
import BloomEffect from '../effects/bloom'
import FilmEffect from '../effects/film'
import Collector from '../collector'
import Sound from '../audio/mp3'

/**
 * 80s workout video
 */
export default class EightiesWorkout extends BaseExperinace {
    constructor() {
        super()
        this._state = new Collector(0.97)

        this._lut = new LutEffect('./resources/luts/vintage2.png')
        this._blur = new BlurEffect()
        this._tv = new TvEffect()
        this._rgbShift = new RgbShiftEffect()
        this._film = new FilmEffect()
        this._bulge =  new PulseBlurEffect([
            { strength: 1.0, speed: 5, amplitude: 0.15, sample: 0.000, offset: 2 },
        ])
        this._bloom = new BloomEffect(0.2);
        this._effects = [
            this._lut,
            this._rgbShift,
            this._tv,
            this._film,
            this._bulge,
            this._bloom,
            this._blur,
        ]

        this._sound = new Sound('./resources/music/maniac.mp3')
        this._sound.setPlaybackRate(0)
        this._sound.play()
    }

    push(data) {
        this._state.push(data)

        this._sound.setPlaybackRate(this._getPlaybackRate())
    }

    update(time) {
        const r = this._getPlaybackRate();
        this._tv.setDistortion(3 * r, 5 * r)
        this._lut.setStrength(r / 1.5)
        this._bulge.setStrength(r / 1.5)
        this._rgbShift.setStrength(r / 1.5)
        this._bloom.setStrength(r * (0.2 + (Math.sin(time * 10) / 2 + Math.sin((time + 709) * 10) / 2) * 0.4))
        this._effects.forEach(p => p.update && p.update(time))
    }

    _getPlaybackRate() {
        const SCALE = 2

        const handsPercent = 0.7
        const feetPercent = 0.3

        let rate = Math.min(this._state.right_hand.d * SCALE, 2) * handsPercent / 2
            + Math.min(this._state.left_hand.d * SCALE, 2) * handsPercent / 2
            + Math.min((this._state.left_leg.d / 2 + this._state.right_leg.d / 2) * SCALE, 2) * feetPercent;

        if (rate < 0.05)
            rate = 0

        if (rate > 1.5)
            rate = 1.5

        return rate
    }
}