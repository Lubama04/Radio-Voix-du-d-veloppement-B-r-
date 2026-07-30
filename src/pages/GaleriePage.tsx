import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import SectionHeader from '@/components/shared/SectionHeader'

const CATEGORIES = ['Tous', 'Studio', 'Terrain', 'Événements', 'Équipe']
const PHOTOS = [
  { url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&q=80', titre: 'Studio de diffusion', cat: 'Studio' },
  { url: 'https://images.unsplash.com/photo-1598743400863-0201dc7f7d8a?w=600&q=80', titre: 'Animatrice en direct', cat: 'Studio' },
  { url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80', titre: 'Reportage terrain', cat: 'Terrain' },
  { url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80', titre: 'Couverture agricole', cat: 'Terrain' },
  { url: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=600&q=80', titre: 'Événement communautaire', cat: 'Événements' },
  { url: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=600&q=80', titre: 'Réunion partenaires', cat: 'Événements' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80', titre: 'Portrait directeur', cat: 'Équipe' },
  { url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&q=80', titre: 'Portrait rédactrice', cat: 'Équipe' },
  { url: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=600&q=80', titre: 'Jeunesse en action', cat: 'Événements' },
  { url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80', titre: 'Journal parlé', cat: 'Studio' },
  { url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80', titre: 'Émission santé', cat: 'Studio' },
  { url: 'https://images.unsplash.com/photo-1593113630400-ea4288922559?w=600&q=80', titre: 'Portrait équipe', cat: 'Équipe' },
]

export default function GaleriePage() {
  useDocumentTitle('Galerie Photos | Radio Voix de Béré')
  const [cat, setCat] = useState('Tous')
  const [lightbox, setLightbox] = useState<number | null>(null)
  const filtered = PHOTOS.filter(p => cat === 'Tous' || p.cat === cat)

  const prev = () => setLightbox(l => l !== null ? (l - 1 + filtered.length) % filtered.length : null)
  const next = () => setLightbox(l => l !== null ? (l + 1) % filtered.length : null)

  return (
    <main className="pt-16">
      <div className="py-12 px-4 text-center text-white"
        style={{ background: 'linear-gradient(135deg, var(--color-brand-dark), var(--color-brand-primary))' }}>
        <h1 className="font-display font-bold text-4xl mb-2">Galerie Photos</h1>
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
              <div key={i} className="relative group cursor-pointer overflow-hidden rounded-xl"
                onClick={() => setLightbox(i)}>
                <img src={photo.url} alt={photo.titre} loading="lazy"
                  className="w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <button onClick={e => { e.stopPropagation(); setLightbox(null) }}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2">
            <X className="w-8 h-8" />
          </button>
          <button onClick={e => { e.stopPropagation(); prev() }}
            className="absolute left-4 text-white/70 hover:text-white p-2">
            <ChevronLeft className="w-10 h-10" />
          </button>
          <img src={filtered[lightbox].url} alt={filtered[lightbox].titre} loading="lazy"
            className="max-w-full max-h-[85vh] object-contain rounded-xl"
            onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); next() }}
            className="absolute right-4 text-white/70 hover:text-white p-2">
            <ChevronRight className="w-10 h-10" />
          </button>
          <div className="absolute bottom-4 text-white/60 text-sm text-center">
            {filtered[lightbox].titre} — {lightbox + 1}/{filtered.length}
          </div>
        </div>
      )}
    </main>
  )
}
