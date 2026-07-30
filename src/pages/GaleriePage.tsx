import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ImageOff } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const CATEGORIES = ['Tous', 'Studio', 'Terrain', 'Événements', 'Équipe']

interface Photo {
  url?: string
  titre: string
  legende?: string
  cat: string
  placeholder?: boolean
}

const PHOTOS: Photo[] = [
  {
    url: '/photos/equipe-radio-bere.jpg',
    titre: "L'équipe de la Radio Voix de Béré",
    legende: "L'équipe de la Radio Voix de Développement devant les locaux de la station à Béré, province de la Tandjilé.",
    cat: 'Équipe',
  },
  {
    url: '/photos/studio-radio-bere.jpg',
    titre: 'Le studio de diffusion',
    legende: "Notre technicien en cabine de diffusion. Le studio est équipé d'une console de mixage et d'un microphone professionnel.",
    cat: 'Studio',
  },
  { placeholder: true, titre: 'Photo à venir', cat: 'Studio' },
  { placeholder: true, titre: 'Photo à venir', cat: 'Terrain' },
  { placeholder: true, titre: 'Photo à venir', cat: 'Terrain' },
  { placeholder: true, titre: 'Photo à venir', cat: 'Événements' },
  { placeholder: true, titre: 'Photo à venir', cat: 'Événements' },
  { placeholder: true, titre: 'Photo à venir', cat: 'Équipe' },
]

function PlaceholderTile({ titre }: { titre: string }) {
  return (
    <div className="w-full aspect-[4/3] flex flex-col items-center justify-center gap-2"
      style={{ background: 'linear-gradient(135deg, var(--color-brand-light), #fdecec)' }}>
      <ImageOff className="w-8 h-8" style={{ color: 'var(--color-brand-primary)' }} />
      <span className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>{titre}</span>
    </div>
  )
}

export default function GaleriePage() {
  useDocumentTitle('Galerie Photos | Radio Voix de Béré')
  const [cat, setCat] = useState('Tous')
  const [lightbox, setLightbox] = useState<number | null>(null)
  const filtered = PHOTOS.filter(p => cat === 'Tous' || p.cat === cat)
  const viewable = filtered.filter(p => !p.placeholder)

  const openLightbox = (photo: Photo) => {
    const idx = viewable.indexOf(photo)
    if (idx !== -1) setLightbox(idx)
  }
  const prev = () => setLightbox(l => l !== null ? (l - 1 + viewable.length) % viewable.length : null)
  const next = () => setLightbox(l => l !== null ? (l + 1) % viewable.length : null)

  return (
    <main className="pt-16">
      <div className="py-12 px-4 text-center text-white"
        style={{ background: 'linear-gradient(135deg, var(--color-brand-dark), var(--color-brand-primary))' }}>
        <h1 className="font-display font-bold text-4xl mb-2">Galerie photos</h1>
        <p className="text-white/70">Studio, terrain, événements et équipe en images</p>
      </div>

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 flex-wrap mb-8">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                  cat === c ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-700'
                }`}
                style={cat === c ? { background: 'var(--color-brand-primary)' } : {}}>
                {c}
              </button>
            ))}
          </div>

          <div className="masonry">
            {filtered.map((photo, i) => (
              <div key={i}
                className={`relative group overflow-hidden rounded-xl ${photo.placeholder ? '' : 'cursor-pointer'}`}
                onClick={() => !photo.placeholder && openLightbox(photo)}>
                {photo.placeholder ? (
                  <PlaceholderTile titre={photo.titre} />
                ) : (
                  <>
                    <img src={photo.url} alt={photo.titre} loading="lazy"
                      className="w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && viewable[lightbox] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <button onClick={e => { e.stopPropagation(); setLightbox(null) }}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
            aria-label="Fermer">
            <X className="w-8 h-8" />
          </button>
          <button onClick={e => { e.stopPropagation(); prev() }}
            className="absolute left-4 text-white/70 hover:text-white p-2"
            aria-label="Photo précédente">
            <ChevronLeft className="w-10 h-10" />
          </button>
          <img src={viewable[lightbox].url} alt={viewable[lightbox].titre} loading="lazy"
            className="max-w-full max-h-[85vh] object-contain rounded-xl"
            onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); next() }}
            className="absolute right-4 text-white/70 hover:text-white p-2"
            aria-label="Photo suivante">
            <ChevronRight className="w-10 h-10" />
          </button>
          <div className="absolute bottom-4 max-w-xl px-4 text-white/70 text-sm text-center">
            <div className="font-semibold text-white">{viewable[lightbox].titre}</div>
            {viewable[lightbox].legende && <p className="mt-1">{viewable[lightbox].legende}</p>}
            <p className="mt-1 text-white/50">{lightbox + 1}/{viewable.length}</p>
          </div>
        </div>
      )}
    </main>
  )
}
