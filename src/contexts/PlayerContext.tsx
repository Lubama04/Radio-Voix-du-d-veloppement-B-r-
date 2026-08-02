import { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react'
import { CONFIG } from '@/config'

interface PlayerState {
  isPlaying: boolean
  isLoading: boolean
  volume: number
  currentShow: string
  streamUrl: string
  showPlayer: boolean
  streamError: boolean
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

const STREAM_PRIMARY = CONFIG.STREAM_PRIMARY
const STREAM_BACKUP  = CONFIG.STREAM_BACKUP
const DEFAULT_SHOW = 'La Voix du Développement de Béré, 96.7 FM'

function createWatchdog(
  audio: HTMLAudioElement,
  onFail: () => void
): () => void {
  let lastTime = -1
  let stuckCount = 0

  const interval = setInterval(() => {
    if (audio.paused) {
      stuckCount = 0
      return
    }
    if (audio.currentTime === lastTime) {
      stuckCount++
      if (stuckCount >= CONFIG.WATCHDOG_STUCK_LIMIT) {
        clearInterval(interval)
        audio.removeEventListener('error', onError)
        onFail()
      }
    } else {
      stuckCount = 0
      lastTime = audio.currentTime
    }
  }, CONFIG.WATCHDOG_INTERVAL_MS)

  const onError = () => {
    clearInterval(interval)
    onFail()
  }
  audio.addEventListener('error', onError)

  return () => {
    clearInterval(interval)
    audio.removeEventListener('error', onError)
  }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const watchdogCleanupRef = useRef<(() => void) | null>(null)
  const [state, setState] = useState<PlayerState>({
    isPlaying:   false,
    isLoading:   false,
    volume:      0.8,
    currentShow: DEFAULT_SHOW,
    streamUrl:   STREAM_PRIMARY,
    showPlayer:  false,
    streamError: false,
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

  const play = useCallback(async () => {
    if (!STREAM_PRIMARY && !STREAM_BACKUP) return
    const audio = getAudio()
    audio.volume = state.volume
    setState(s => ({ ...s, isLoading: true, streamError: false }))

    watchdogCleanupRef.current?.()
    watchdogCleanupRef.current = null

    const tryPlay = async (url: string): Promise<boolean> => {
      if (!url) return false
      audio.src = url
      try {
        await audio.play()
        return true
      } catch {
        return false
      }
    }

    const played = await tryPlay(STREAM_PRIMARY) || await tryPlay(STREAM_BACKUP)

    if (!played) {
      setState(s => ({ ...s, isPlaying: false, isLoading: false }))
      return
    }

    setState(s => ({ ...s, isPlaying: true, isLoading: false, showPlayer: true }))

    // Timeout 15s si jamais playing n'est pas atteint
    const playTimeout = setTimeout(() => {
      if (!audio.paused) return
      watchdogCleanupRef.current?.()
      watchdogCleanupRef.current = null
      setState(s => ({
        ...s,
        isPlaying: false,
        isLoading: false,
        streamError: true,
      }))
    }, CONFIG.PLAY_TIMEOUT_MS)

    audio.addEventListener('playing', () => {
      clearTimeout(playTimeout)
    }, { once: true })

    watchdogCleanupRef.current = createWatchdog(audio, () => {
      watchdogCleanupRef.current = null
      setState(s => ({ ...s, isPlaying: false, isLoading: false, streamError: true }))
    })
  }, [getAudio, state.volume])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    watchdogCleanupRef.current?.()
    watchdogCleanupRef.current = null
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
  // Réduit le player sans arrêter le son — l'audio continue en arrière-plan.
  const closePlayer = useCallback(() => setState(s => ({ ...s, showPlayer: false })), [])

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
