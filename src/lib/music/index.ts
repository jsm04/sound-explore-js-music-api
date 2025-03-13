import { Scale, Mode, transpose, Chord, Note } from 'tonal'

const { log } = console

export const chromaticScale = Scale.get('chromatic')

export const buildChromaticScaleFromRoot = function (root: string) {
    return chromaticScale.intervals.map((interval) => transpose(root, interval))
}

export const chromaticScaleNotes = buildChromaticScaleFromRoot('c')

export const chromaticScaleNotesFromC = (function () {
    return buildChromaticScaleFromRoot('C')
})()

type ExtendedMode = Mode.Mode & {
    notes: string[]
    triads: string[]
    sevenths: string[]
}

export const extendedModesForRoot = function (root: string): ExtendedMode[] {
    return Mode.all().map((mode) => {
        const modified_mode = mode as ExtendedMode
        modified_mode.notes = Mode.notes(mode, root)
        modified_mode.triads = Mode.triads(mode, root)
        modified_mode.sevenths = Mode.seventhChords(mode, root)
        return modified_mode as ExtendedMode
    })
}

export const NoteToFrequency = function (note: number) {
    return 440 * Math.pow(2, (note - 69) / 12)
}

export const createNoteRangeFromIntervals = function (
    intervals: string[],
    root: string,
    octave: number = 4,
) {
    return intervals.map((currentInterval) =>
        Note.transpose(root + octave, currentInterval),
    )
}

export const getChord = (c: string) => Chord.get(c)

export const calculateOctaveAdditive = function (
    scaleRoot: string,
    chordRoot: string,
) {
    const indexOfScaleRoot = chromaticScaleNotesFromC.indexOf(scaleRoot)
    const indexOfChordRoot = chromaticScaleNotesFromC.indexOf(chordRoot)

    if (indexOfChordRoot >= indexOfScaleRoot) return 0
    return 1
}

export const toFlatEnharmonic = function (note: string) {
    if (!note.includes('#')) return note
    return Note.enharmonic(note)
}

// const temp = extendedModesForRoot('C#')
log(chromaticScaleNotes)
