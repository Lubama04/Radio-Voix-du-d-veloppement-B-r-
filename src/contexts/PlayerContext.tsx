import { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react'

interface PlayerState {
  isPlaying: boolean
  isLoading: boolean
  volume: number
  currentShow: string
  streamUrl: string
  showPlayer: boolean
}

interface PlayerCtx extends PlayerState {
  play:        () => void
  pause:       () => void
  toggle:      () => void
  setVolume:   (v: number) => void
  openPlayer:  () => void
  closePlayer: () => void
}

const PlayerContext = createContext<PlayerCtx | null>(null)

const STREAM_URL = import.meta.env.VITE_STREAM_URL || ''
const DEFAULT_SHOW = 'La Voix du Développement de Béré — 96.7 FM'

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [state, setState] = useState<PlayerState>({
    isPlaying:   false,
    isLoading:   false,
    volume:      0.8,
    currentShow: DEFAULT_SHOW,
    streamUrl:   STREAM_URL,
    showPlayer:  false,
  })

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio()
      audio.preload = 'none'
      audio.onwaiting = () => setState(s => ({ ...s, isLoading: true }))
      audio.oncanplay  = () => setState(s => ({ ...s, isLoading: false }))
      audio.onended    = () => setState(s => ({ ...s, isPlaying: false }))
      audio.onerror    = () => setState(s => ({ ...s, isPlaying: false, isLoading: false }))
      audioRef.current = audio
    }
    return audioRef.current
  }, [])

  const play = useCallback(() => {
    if (!STREAM_URL) return
    const audio = getAudio()
    audio.src = STREAM_URL
    audio.volume = state.volume
    audio.play().then(() => {
      setState(s => ({ ...s, isPlaying: true, isLoading: false, showPlayer: true }))
    }).catch(() => {
      setState(s => ({ ...s, isPlaying: false, isLoading: false }))
    })
  }, [getAudio, state.volume])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setState(s => ({ ...s, isPlaying: false }))
  }, [])

  const toggle = useCallback(() => {
    state.isPlaying ? pause() : play()
  }, [state.isPlaying, play, pause])

  const setVolume = useCallback((v: number) => {
    if (audioRef.current) audioRef.current.volume = v
    setState(s => ({ ...s, volume: v }))
  }, [])

  const openPlayer  = useCallback(() => setState(s => ({ ...s, showPlayer: true })), [])
  const closePlayer = useCallback(() => { pause(); setState(s => ({ ...s, showPlayer: false })) }, [pause])

  return (
    <PlayerContext.Provider value={{ ...state, play, pause, toggle, setVolume, openPlayer, closePlayer }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer doit être dans PlayerProvider')
  return ctx
}
