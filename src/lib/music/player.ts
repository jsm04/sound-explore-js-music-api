const normalizeGain = (velocity: number, max_gain: number = 0.6) => {
    const normalizedVelocity = velocity / 127
    const gainValue = normalizedVelocity * max_gain
    return gainValue
}

export const oscillatorFactory = function (ctx: AudioContext) {
    const createOscillatorNode = function (
        noteVelocity: number = 40,
        type: OscillatorType = 'triangle',
    ): OscillatorNode {
        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 1500
        filter.Q.value = 1

        const gainNode = ctx.createGain()
        filter.connect(gainNode)
        gainNode.connect(ctx.destination)

        const oscillator = ctx.createOscillator()
        oscillator.type = type
        oscillator.connect(filter)

        gainNode.gain.value = normalizeGain(noteVelocity)
        return oscillator
    }

    return createOscillatorNode
}
