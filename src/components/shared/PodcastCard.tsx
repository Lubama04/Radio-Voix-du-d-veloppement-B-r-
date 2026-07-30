import { Play, Headphones, Clock } from 'lucide-react'
import { usePlayer } from '@/contexts/PlayerContext'
import { db } from '@/lib/supabase'
import SafeImage from '@/components/shared/SafeImage'
import type { PodcastView } from '@/types/database'

interface Props { podcast: PodcastView }

function formatDuration(seconds?: number) {
  if (!seconds) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function PodcastCard({ podcast }: Props) {
  const { play, openPlayer } = usePlayer()

  const handlePlay = () => {
    db.incrementerEcoutes(podcast.id)
    openPlayer()
    // Le PlayerContext gère la lecture via STREAM_URL ou audio_url
    play()
  }

  return (
    <div className="card group flex flex-col">
      <div className="relative h-40 overflow-hidden">
        <SafeImage
          src={podcast.image_url || podcast.emission_image || `https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=70`}
          alt={podcast.titre} loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Écouter ${podcast.titre}`}
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white"
            style={{ background: 'var(--color-accent)' }}>
            <Play className="w-6 h-6 translate-x-0.5" />
          </div>
        </button>
        {podcast.categorie_nom && (
          <span className="absolute top-2 left-2 badge text-xs font-semibold text-white"
            style={{ background: podcast.categorie_couleur || 'var(--color-brand-primary)' }}>
            {podcast.categorie_nom}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-bold text-sm text-gray-900 line-clamp-2 mb-2">{podcast.titre}</h3>
        {podcast.animateur && <p className="text-xs text-gray-500 mb-2">{podcast.animateur}</p>}
        <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-3 border-t"
          style={{ borderColor: 'var(--color-border)' }}>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(podcast.duree_secondes)}</span>
          <span className="flex items-center gap-1"><Headphones className="w-3 h-3" />{podcast.ecoutes}</span>
        </div>
      </div>
    </div>
  )
}
