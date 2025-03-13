import { create } from 'zustand'

type MusicOptionsStore = {
    root: string
    displayInfo: ModeDataKeys
    setRoot: (root: string) => void
    setDisplayedInfo: (info: ModeDataKeys) => void
}
type ModeData = {
    triads: string[]
    sevenths: string[]
    notes: string[]
}
export type ModeDataKeys = keyof ModeData

export const useMusicOptionStore = create<MusicOptionsStore>()((set) => ({
    root: 'C',
    setRoot: (root: string) => set(() => ({ root })),
    displayInfo: 'notes',
    setDisplayedInfo: (info: ModeDataKeys) =>
        set(() => ({ displayInfo: info })),
}))
