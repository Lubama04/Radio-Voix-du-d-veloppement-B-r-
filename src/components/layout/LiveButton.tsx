import { Radio, Pause } from 'lucide-react'
import { usePlayer } from '@/contexts/PlayerContext'
import { useLang } from '@/contexts/LanguageContext'

export default function LiveButton() {
  const { isPlaying, isLoading, toggle, openPlayer } = usePlayer()
  const { t } = useLang()

  const handleClick = () => { openPlayer(); toggle() }

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-24 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-full text-white font-bold transition-all duration-200 hover:scale-105 ${isPlaying ? 'animate-pulse-slow' : ''}`}
      style={{ background: '#9B2226', boxShadow: '0 4px 20px rgba(155, 34, 38, 0.4)' }}
      aria-label={isPlaying ? 'Mettre en pause' : 'Écouter en direct'}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : isPlaying ? (
        <>
          <Pause className="w-5 h-5" />
          <span className="hidden sm:inline text-sm">{t.live.on}</span>
        </>
      ) : (
        <>
          <Radio className="w-5 h-5" />
          <span className="text-sm">{t.live.label}</span>
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
        </>
      )}
    </button>
  )
}
