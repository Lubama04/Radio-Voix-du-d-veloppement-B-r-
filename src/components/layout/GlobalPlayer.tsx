import { Play, Pause, Volume2, VolumeX, X, Radio } from 'lucide-react'
import { usePlayer } from '@/contexts/PlayerContext'
import { useLang } from '@/contexts/LanguageContext'

export default function GlobalPlayer() {
  const { isPlaying, isLoading, volume, currentShow, showPlayer, toggle, setVolume, closePlayer } = usePlayer()
  const { t } = useLang()
  const streamUrl = import.meta.env.VITE_STREAM_URL

  if (!showPlayer) return null

  return (
    <div className="global-player safe-bottom">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-4">

        {/* Info station */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
            style={{ background: 'var(--color-brand-primary)' }}>
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold truncate" style={{ color: 'var(--color-brand-primary)' }}>
              {isLoading ? t.live.loading : isPlaying ? t.live.on : t.live.off}
            </div>
            <div className="text-sm font-semibold truncate" style={{ color: 'var(--color-brand-primary)' }}>{currentShow}</div>
          </div>
        </div>

        {/* Visualiseur audio */}
        <div className="hidden sm:flex items-end gap-[3px] h-8 flex-shrink-0">
          {[0.4, 0.7, 1.0, 0.8, 0.5, 0.9, 0.6, 0.75, 0.45, 0.85].map((height, i) => (
            <div
              key={i}
              style={{
                width: 3,
                borderRadius: 2,
                background: '#006B3C',
                height: isPlaying ? undefined : `${height * 12}px`,
                minHeight: 4,
                maxHeight: 32,
                transformOrigin: 'bottom',
                animation: isPlaying
                  ? `bars ${0.8 + (i % 4) * 0.2}s ease-in-out ${i * 0.08}s infinite`
                  : 'none',
                transform: isPlaying ? undefined : 'scaleY(1)',
                opacity: isPlaying ? 1 : 0.35,
                transition: 'opacity 0.4s ease',
              }}
            />
          ))}
        </div>

        {/* Contrôles */}
        <div className="flex items-center gap-3">
          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)} aria-label="Couper le son">
              {volume === 0 ? <VolumeX className="w-5 h-5 text-gray-500" /> : <Volume2 className="w-5 h-5 text-gray-500" />}
            </button>
            <input
              type="range" min={0} max={1} step={0.05} value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-20 accent-green-700"
              aria-label="Volume"
            />
          </div>

          {/* Play/Pause */}
          <button
            onClick={toggle}
            disabled={!streamUrl}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: 'var(--color-accent)' }}
            aria-label={isPlaying ? 'Pause' : 'Lire'}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 translate-x-0.5" />
            )}
          </button>

          {/* Fermer */}
          <button onClick={closePlayer} className="p-2 text-gray-400 hover:text-gray-700" aria-label="Fermer le player">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message si pas de stream */}
        {!streamUrl && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 rounded-full text-xs text-white whitespace-nowrap"
            style={{ background: 'var(--color-accent)' }}>
            Streaming en cours de configuration
          </div>
        )}
      </div>
    </div>
  )
}
