import {
    buildChromaticScaleFromRoot,
    calculateOctaveAdditive,
    createNoteRangeFromIntervals,
    extendedModesForRoot,
    getChord,
    toFlatEnharmonic,
} from './lib/music'
import { useCallback, useEffect, useRef, useState } from 'react'
import { capitalize } from './lib/utils'
import { useMusicOptionStore, ModeDataKeys } from './stores/useMusicOptionStore'
import { useAudioStore } from './stores/useAudioStore'
import { Mode, Note } from 'tonal'
import { oscillatorFactory } from './lib/music/player'
import { useClickThrottle } from './hooks/useClickThrottle'

export default function App() {
    return (
        <div className='h-screen w-screen'>
            <MusicalPanel />
        </div>
    )
}

function MusicalPanel() {
    const audioContextRef = useRef<AudioContext | null>(null)
    const { setAudioCtx } = useAudioStore()

    useEffect(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new window.AudioContext()
            setAudioCtx(audioContextRef.current)
        }
    }, [])

    return (
        <>
            <Modes />
        </>
    )
}

function Modes() {
    const headers = ['name', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
    const { root, displayInfo } = useMusicOptionStore()
    const modes = useCallback(extendedModesForRoot, [root])(root)
    const modeled = modes.map((mode) => [mode.name, ...mode[displayInfo]])

    return (
        <div className='h-4/5 w-2/5 mx-auto mt-40'>
            <h1 className='text-5xl mb-5'>Modes</h1>
            <MusicTable headers={headers} data={modeled} />
        </div>
    )
}

function MusicTable({
    headers,
    data,
}: {
    headers: string[]
    data?: string[][]
}) {
    if (!data)
        data = Array.from({ length: headers.length }, () =>
            headers.map(() => '-'),
        )

    return (
        <div>
            <MusicTable.Options />
            <table className='table-auto border-collapse border border-gray-300 w-full text-sm'>
                <thead className='bg-gray-100'>
                    <tr>
                        {headers.map((header, index) => (
                            <MusicTable.Header key={index} header={header} />
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data &&
                        data.map((row, rowIndex) => (
                            <tr key={rowIndex} className='even:bg-gray-50'>
                                {row.map((cell, cellIndex) => (
                                    <MusicTable.Data
                                        key={cellIndex}
                                        data={cell ?? '-'}
                                    />
                                ))}
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    )
}

MusicTable.Header = function ({ header }: { header: string }) {
    return (
        <th className='border border-gray-300 px-4 py-2 text-left'>{header}</th>
    )
}

MusicTable.Data = function ({ data }: { data: string }) {
    const { audioCtx } = useAudioStore()
    const { root: scaleRoot } = useMusicOptionStore()
    const isThrottled = useClickThrottle(500)

    if (!audioCtx || !scaleRoot) return
    const createOscillatorNodeFn = oscillatorFactory(audioCtx)

    const handleOnClick = (event: React.MouseEvent<HTMLTableCellElement>) => {
        const target = event.currentTarget.innerText

        if (Mode.names().includes(target)) return

        const chord = getChord(event.currentTarget.innerText),
            chordTonic = chord.tonic!

        const additive = calculateOctaveAdditive(
            toFlatEnharmonic(scaleRoot),
            toFlatEnharmonic(chordTonic),
        )

        const notes = createNoteRangeFromIntervals(
            chord.intervals,
            chordTonic,
            3 + additive,
        )

        if (!isThrottled()) return

        const playChordNotes = () => {
            notes.forEach((note) => {
                const osc = createOscillatorNodeFn()
                const freq = Note.freq(note)

                if (!freq) return

                osc.frequency.value = freq
                osc.start()
                osc.stop(audioCtx?.currentTime! + 0.5)
            })
        }

        playChordNotes()
    }

    return (
        <td
            onClick={handleOnClick}
            className='max-w-9 border border-gray-300 px-4 py-2'
        >
            {data}
        </td>
    )
}

MusicTable.Options = function () {
    const { root, setRoot, setDisplayedInfo, displayInfo } =
        useMusicOptionStore()
    const [
        chromaticScaleNotesFromScaleRoot,
        setChromaticScaleNotesFromScaleRoot,
    ] = useState<string[]>(buildChromaticScaleFromRoot(root))

    const handleRootChange = (event?: React.ChangeEvent<HTMLSelectElement>) => {
        if (event) {
            setRoot(event.target.value)
            setChromaticScaleNotesFromScaleRoot(
                buildChromaticScaleFromRoot(root),
            )
        }
    }

    const handleDisplayInfoChange = (
        event?: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        if (event) {
            setDisplayedInfo(event.target.value as ModeDataKeys)
        }
    }

    return (
        <div className='w-full p-5 bg-gray-100 rounded-lg shadow-md'>
            <h3 className='text-2xl font-bold text-gray-700 mb-5 underline'>
                Options
            </h3>

            <div className='mb-4'>
                <label
                    htmlFor='note-selection'
                    className='block text-sm font-medium text-gray-700 mb-2'
                >
                    Root
                </label>
                <select
                    id='note-selection'
                    value={root}
                    onChange={handleRootChange}
                    className='w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                >
                    {chromaticScaleNotesFromScaleRoot.map((note, index) => (
                        <option key={index} value={note}>
                            {note}
                        </option>
                    ))}
                </select>

                <select
                    id='display-selection'
                    value={displayInfo}
                    onChange={handleDisplayInfoChange}
                    className='w-auto ml-3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                >
                    {['triads', 'notes', 'sevenths'].map((key, index) => (
                        <option key={index} value={key}>
                            {capitalize(key)}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}
