import { create } from 'zustand'

type AudioStore = {
    audioCtx: AudioContext | null
    setAudioCtx: (ctx: AudioContext) => void
    target: string | null
    setTarget: (target: string) => void
}

export const useAudioStore = create<AudioStore>((set) => ({
    audioCtx: null,
    setAudioCtx: (ctx: AudioContext) => set(() => ({ audioCtx: ctx })),
    target: null,
    setTarget: (target: string) => set(() => ({ target })),
}))
