import { useState, useEffect } from 'react'
import { Play, Pause, Mic, Clock, Headphones, ChevronRight } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { usePlayer } from '@/contexts/PlayerContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { db } from '@/lib/supabase'
import SectionHeader from '@/components/shared/SectionHeader'
import PodcastCard from '@/components/shared/PodcastCard'
import type { ProgrammeView, PodcastView, Journal } from '@/types/database'

const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const STREAM_URL = import.meta.env.VITE_STREAM_URL

export default function RadioPage() {
  useDocumentTitle('Radio en Direct & Émissions | Voix de Béré 96.7 FM')
  const { t } = useLang()
  const { isPlaying, isLoading, toggle, openPlayer } = usePlayer()
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())
  const [programmes, setProgrammes] = useState<ProgrammeView[]>([])
  const [podcasts, setPodcasts] = useState<PodcastView[]>([])
  const [journaux, setJournaux] = useState<Journal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      db.vProgrammes().select('*').eq('jour_semaine', selectedDay).order('heure_debut'),
      db.vPodcasts().select('*').order('date_diffusion', { ascending: false }).limit(8),
      db.journauxParles().select('*').eq('publie', true).order('date_diffusion', { ascending: false }).limit(6),
    ]).then(([p, pod, j]) => {
      if (p.data)   setProgrammes(p.data as ProgrammeView[])
      if (pod.data) setPodcasts(pod.data as PodcastView[])
      if (j.data)   setJournaux(j.data as Journal[])
      setLoading(false)
    })
  }, [selectedDay])

  const handleLive = () => { openPlayer(); toggle() }

  function formatDur(s?: number) {
    if (!s) return ''
    return `${Math.floor(s/60)}min`
  }

  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`

  const isCurrentProgram = (p: ProgrammeView) =>
    selectedDay === new Date().getDay() &&
    p.heure_debut.slice(0,5) <= currentTime &&
    p.heure_fin.slice(0,5) > currentTime

  return (
    <main className="pt-16">
      {/* ── HERO DIRECT ── */}
      <section className="py-20 text-center text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--color-brand-dark), var(--color-brand-primary))' }}>
        <div className="absolute inset-0 opacity-5">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {[30,50,70,90,110].map((r, i) => (
              <circle key={i} cx="100" cy="100" r={r} fill="none" stroke="white" strokeWidth="1" />
            ))}
          </svg>
        </div>
        <div className="relative max-w-2xl mx-auto px-4">
          <div className="live-badge inline-flex mb-6">
            <span className={`live-dot ${isPlaying ? 'animate-ping' : ''}`} />
            {isPlaying ? t.live.on : t.live.label}, 96.7 FM
          </div>

          {/* Visualiseur audio */}
          {isPlaying && (
            <div className="flex justify-center items-end gap-1 h-16 mb-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className={`w-2 rounded-full bg-white/80 bar-${(i%5)+1}`}
                  style={{ height: `${30 + Math.random() * 40}%` }} />
              ))}
            </div>
          )}

          <h1 className="font-display font-bold text-3xl sm:text-5xl mb-4">Radio & Émissions</h1>
          <p className="text-white/80 mb-8">Écoutez en direct, réécouter en podcast, consultez la grille</p>

          <button
            onClick={handleLive}
            disabled={!STREAM_URL}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold text-lg text-white transition-all hover:scale-105 disabled:opacity-60 shadow-xl"
            style={{ background: 'var(--color-accent)' }}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 translate-x-0.5" />
            )}
            {isLoading ? t.live.loading : isPlaying ? 'Pause' : t.hero.cta1}
          </button>

          {!STREAM_URL && (
            <p className="text-white/50 text-sm mt-4">Le streaming sera disponible prochainement</p>
          )}
        </div>
      </section>

      {/* ── GRILLE DES PROGRAMMES ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <SectionHeader title={t.sections.schedule} />
        {/* Sélecteur de jour */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {JOURS.map((j, i) => (
            <button key={i} onClick={() => setSelectedDay(i)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                selectedDay === i ? 'text-white shadow-md' : 'bg-white border text-gray-600 hover:border-green-500'
              }`}
              style={selectedDay === i
                ? { background: 'var(--color-brand-primary)', border: 'none' }
                : { borderColor: 'var(--color-border)' }}>
              {j}
              {i === new Date().getDay() && <span className="ml-1 text-xs">(auj.)</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
        ) : programmes.length > 0 ? (
          <div className="space-y-3">
            {programmes.map(p => {
              const current = isCurrentProgram(p)
              return (
                <div key={p.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    current
                      ? 'shadow-md'
                      : 'bg-white hover:border-green-300'
                  }`}
                  style={current
                    ? { background: 'var(--color-brand-light)', borderColor: 'var(--color-brand-primary)' }
                    : { borderColor: 'var(--color-border)' }}>
                  {current && (
                    <span className="badge-red flex-shrink-0 animate-pulse text-xs">EN COURS</span>
                  )}
                  <div className="font-mono text-sm font-bold text-gray-500 flex-shrink-0 w-24">
                    {p.heure_debut.slice(0,5)} – {p.heure_fin.slice(0,5)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 truncate">{p.titre}</div>
                    {p.animateur && <div className="text-xs text-gray-500">{p.animateur}</div>}
                  </div>
                  {p.categorie_nom && (
                    <span className="badge text-xs hidden sm:inline-flex flex-shrink-0"
                      style={{ background: `${p.categorie_couleur}22`, color: p.categorie_couleur || '#006400' }}>
                      {p.categorie_nom}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun programme pour ce jour</p>
          </div>
        )}
      </section>

      {/* ── JOURNAL PARLÉ ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-surface-alt)' }}>
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Journal parlé" subtitle="Écoutez ou réécoutez nos bulletins d'information" />
          {journaux.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {journaux.map(j => (
                <div key={j.id} className="bg-white rounded-2xl p-5 flex items-center gap-4"
                  style={{ border: '1px solid var(--color-border)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--color-brand-light)' }}>
                    <Mic className="w-6 h-6" style={{ color: 'var(--color-brand-primary)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm truncate">{j.titre}</div>
                    <div className="text-xs text-gray-500 capitalize">{j.horaire} {j.heure_diffusion ? `· ${j.heure_diffusion.slice(0,5)}` : ''}</div>
                    {j.duree_secondes && <div className="text-xs text-gray-400">{formatDur(j.duree_secondes)}</div>}
                  </div>
                  {j.audio_url && (
                    <a href={j.audio_url} target="_blank" rel="noopener noreferrer"
                      className="btn-accent px-3 py-2 text-xs flex-shrink-0">
                      <Play className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Mic className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Les journaux parlés seront disponibles prochainement</p>
            </div>
          )}
        </div>
      </section>

      {/* ── PODCASTS ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title={t.sections.podcasts} />
          {podcasts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {podcasts.map(p => <PodcastCard key={p.id} podcast={p} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Headphones className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Les podcasts seront disponibles prochainement</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
