import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import SafeImage from '@/components/shared/SafeImage'

const CATEGORIES = ['Tous', 'Studio', 'Terrain', 'Événements', 'Équipe']

interface Photo {
  url: string
  titre: string
  legende: string
  cat: string
}

const PHOTOS: Photo[] = [
  {
    url: '/photos/equipe-radio-bere.jpg',
    titre: "L'équipe de la radio",
    legende: "L'équipe de la Radio Voix de Développement de Béré devant les locaux de la station.",
    cat: 'Équipe',
  },
  {
    url: '/photos/studio-radio-bere.jpg',
    titre: 'Le studio de diffusion',
    legende: "Notre technicien en cabine de diffusion avec la console de mixage et le microphone professionnel.",
    cat: 'Studio',
  },
  {
    url: '/photos/visite-prefet-maire-bere.jpg',
    titre: 'Visite du préfet et du maire',
    legende: 'Visite officielle du préfet et du maire de Béré à la Radio Voix de Développement, province de la Tandjilé.',
    cat: 'Événements',
  },
]

export default function GaleriePage() {
  useDocumentTitle('Galerie Photos | Radio Voix de Béré')
  const [cat, setCat] = useState('Tous')
  const [lightbox, setLightbox] = useState<number | null>(null)
  const filtered = PHOTOS.filter(p => cat === 'Tous' || p.cat === cat)

  const openLightbox = (photo: Photo) => {
    const idx = filtered.indexOf(photo)
    if (idx !== -1) setLightbox(idx)
  }
  const prev = () => setLightbox(l => l !== null ? (l - 1 + filtered.length) % filtered.length : null)
  const next = () => setLightbox(l => l !== null ? (l + 1) % filtered.length : null)

  return (
    <main className="pt-16">
      <div className="py-12 px-4 text-center text-white"
        style={{ background: 'linear-gradient(135deg, #004D2A 0%, #006B3C 60%, #008A4B 100%)' }}>
        <h1 className="font-display font-bold text-4xl mb-2" style={{ color: '#FFFFFF' }}>Galerie photos</h1>
        <p style={{ color: 'rgba(255,255,255,0.85)' }}>Studio, terrain, événements et équipe en images</p>
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

          {filtered.length > 0 ? (
            <div className="masonry">
              {filtered.map((photo, i) => (
                <div key={i} className="relative group overflow-hidden rounded-xl cursor-pointer"
                  onClick={() => openLightbox(photo)}>
                  <SafeImage src={photo.url} alt={photo.titre} loading="lazy"
                    className="w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-sm">
                Photos en cours d'acquisition pour cette catégorie.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && filtered[lightbox] && (
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
          <img src={filtered[lightbox].url} alt={filtered[lightbox].titre} loading="lazy"
            className="max-w-full max-h-[85vh] object-contain rounded-xl"
            onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); next() }}
            className="absolute right-4 text-white/70 hover:text-white p-2"
            aria-label="Photo suivante">
            <ChevronRight className="w-10 h-10" />
          </button>
          <div className="absolute bottom-4 max-w-xl px-4 text-sm text-center" style={{ color: '#FFFFFF' }}>
            <div className="font-semibold" style={{ color: '#FFFFFF' }}>{filtered[lightbox].titre}</div>
            {filtered[lightbox].legende && <p className="mt-1" style={{ color: '#FFFFFF' }}>{filtered[lightbox].legende}</p>}
            <p className="mt-1" style={{ color: '#FFFFFF' }}>{lightbox + 1}/{filtered.length}</p>
          </div>
        </div>
      )}
    </main>
  )
}
