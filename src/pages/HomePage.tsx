import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Play, ChevronRight, Newspaper, Radio, Briefcase, Image as ImageIcon, Info, Phone, Mic, Sprout, Heart, Star } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { usePlayer } from '@/contexts/PlayerContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { db } from '@/lib/supabase'
import SectionHeader from '@/components/shared/SectionHeader'
import ArticleCard from '@/components/shared/ArticleCard'
import GoogleMap from '@/components/shared/GoogleMap'
import Ticker from '@/components/layout/Ticker'
import type { ActualiteView, ProgrammeView } from '@/types/database'

const NAV_CARDS = [
  { to: '/actualites', icon: Newspaper, title: 'Actualités', desc: 'Nouvelles de Béré, de la Tandjilé et du Tchad', badge: { text: 'Mis à jour', color: '#CC0000' }, img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=70' },
  { to: '/radio',      icon: Radio,     title: 'Radio et émissions', desc: 'Grille des programmes, podcasts, journaux et écoute en direct', badge: { text: '96.7 FM', color: '#006400' }, img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&q=70' },
  { to: '/projets',    icon: Briefcase, title: 'Projets et partenariats', desc: 'Nos projets de développement local et nos partenaires', badge: null, img: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=600&q=70' },
  { to: '/galerie',    icon: ImageIcon,  title: 'Galerie photos', desc: 'Studio, terrain, événements et équipe en images', badge: null, img: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=600&q=70' },
  { to: '/apropos',    icon: Info,       title: 'À propos', desc: 'Notre histoire, notre mission et notre équipe depuis Béré', badge: null, img: 'https://images.unsplash.com/photo-1593113630400-ea4288922559?w=600&q=70' },
  { to: '/contact',    icon: Phone,      title: 'Nous contacter', desc: 'Téléphone, WhatsApp, email et formulaire de contact', badge: { text: 'Répondons vite', color: '#CC0000' }, img: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=600&q=70' },
]

const VALEUR_ICONS = [Mic, Sprout, Heart]

export default function HomePage() {
  useDocumentTitle('La Voix du Développement de Béré, 96.7 FM | Béré, Tandjilé, Tchad')
  const { t } = useLang()
  const { toggle, isPlaying, openPlayer } = usePlayer()
  const [articles, setArticles] = useState<ActualiteView[]>([])
  const [programmes, setProgrammes] = useState<ProgrammeView[]>([])
  const [loadingActus, setLoadingActus] = useState(true)
  const today = new Date().getDay() // 0=dim...6=sam

  useEffect(() => {
    async function load() {
      try {
        const { data } = await db.vActualites().select('*').order('date_publication', { ascending: false }).limit(3)
        if (data) setArticles(data as ActualiteView[])
      } finally {
        setLoadingActus(false)
      }
    }
    load()

    db.vProgrammes().select('*').eq('jour_semaine', today).order('heure_debut', { ascending: true }).limit(3)
      .then(({ data }) => { if (data) setProgrammes(data as ProgrammeView[]) })
  }, [today])

  const handleLive = () => { openPlayer(); toggle() }

  return (
    <main className="pt-16">

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── HERO ── */}
      <section className="relative min-h-[85vh] sm:min-h-[70vh] flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--color-brand-dark) 0%, var(--color-brand-primary) 100%)' }}>
        {/* Pattern d'onde radio SVG en overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {[20,35,50,65,80].map((r, i) => (
              <circle key={i} cx="50" cy="50" r={r} fill="none" stroke="white" strokeWidth="0.5" />
            ))}
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Gauche — Texte */}
            <div className="animate-hero-in">
              <div className="live-badge inline-flex mb-6">
                <span className="live-dot" />
                🔴 {t.hero.badge}
              </div>
              <h1 className="font-display text-white mb-4 leading-tight" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                {t.hero.title}
              </h1>
              <p className="text-white/85 text-lg mb-8 max-w-lg">{t.hero.subtitle}</p>
              <div className="flex flex-wrap gap-4">
                <button onClick={handleLive}
                  className="btn-accent flex items-center gap-2 text-base px-8 py-4">
                  <Play className="w-5 h-5" />
                  {t.hero.cta1}
                </button>
                <Link to="/radio" className="btn-outline text-base px-8 py-4"
                  style={{ borderColor: 'white', color: 'white' }}>
                  {t.hero.cta2}
                </Link>
              </div>
            </div>

            {/* Droite — Image animatrice */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl opacity-20"
                  style={{ background: 'var(--color-accent)', filter: 'blur(40px)', transform: 'scale(0.9)' }} />
                <img
                  src="/photos/studio-radio-bere.jpg"
                  alt="Studio de la Radio Voix de Développement de Béré"
                  loading="eager"
                  // @ts-expect-error fetchpriority n'est pas encore dans les types React 18, mais l'attribut HTML est valide
                  fetchpriority="high"
                  className="relative rounded-3xl w-80 h-80 object-cover shadow-2xl"
                  style={{ border: '4px solid rgba(255,255,255,0.2)' }}
                />
                {/* Badge fréquence flottant */}
                <div className="absolute -bottom-4 -right-4 px-4 py-3 rounded-2xl shadow-xl"
                  style={{ background: 'var(--color-accent)' }}>
                  <div className="text-white font-display font-bold text-2xl">96.7</div>
                  <div className="text-white/80 text-xs font-semibold">FM · Béré</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CHIFFRES CLÉS ── */}
      <div style={{ background: '#004d00' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/20">
            {[
              { val: '96.7 FM', label: t.home.statLabels[0] },
              { val: 'Béré', label: t.home.statLabels[1] },
              { val: '24h/24', label: t.home.statLabels[2] },
              { val: '2023', label: t.home.statLabels[3] },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center py-3 px-4 border-t sm:border-t-0 border-white/20 first:border-t-0">
                <div className="font-display font-bold text-xl sm:text-2xl text-white">{s.val}</div>
                <div className="text-white/60 text-xs text-center">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CARTES DE NAVIGATION ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <SectionHeader
          title={t.home.exploreTitle}
          subtitle={t.home.exploreSubtitle}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {NAV_CARDS.map(card => (
            <Link key={card.to} to={card.to} className="card group flex flex-col cursor-pointer">
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <img src={card.img} alt={card.title} loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {card.badge && (
                  <span className="absolute top-2 right-2 badge text-xs font-bold text-white"
                    style={{ background: card.badge.color }}>
                    {card.badge.text}
                  </span>
                )}
              </div>
              {/* Texte */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <card.icon className="w-5 h-5" style={{ color: 'var(--color-brand-primary)' }} />
                  <h3 className="font-display font-bold text-base text-gray-900 group-hover:text-green-700 transition-colors">
                    {card.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 flex-1">{card.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-sm font-semibold"
                  style={{ color: 'var(--color-brand-primary)' }}>
                  Découvrir <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── DERNIÈRES ACTUALITÉS ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        style={{ background: 'var(--color-surface-alt)' }}>
        <div className="max-w-7xl mx-auto">
          <SectionHeader title={t.sections.latestNews} action={{ label: 'Toutes les actualités', href: '/actualites' }} />
          {loadingActus ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Les actualités arrivent bientôt…</p>
            </div>
          )}
        </div>
      </section>

      {/* ── PROGRAMME DU JOUR ── */}
      {programmes.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <SectionHeader title={t.sections.programs} action={{ label: 'Grille complète', href: '/radio' }} />
            <div className="space-y-3 max-w-2xl">
              {programmes.map((p, i) => (
                <div key={p.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    i === 0 ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                  }`}>
                  {i === 0 && (
                    <span className="badge-red flex-shrink-0 animate-pulse">EN COURS</span>
                  )}
                  <div className="font-mono text-sm font-bold text-gray-500 flex-shrink-0">
                    {p.heure_debut.slice(0,5)} – {p.heure_fin.slice(0,5)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 truncate">{p.titre}</div>
                    {p.animateur && <div className="text-xs text-gray-500">{p.animateur}</div>}
                  </div>
                  {p.categorie_nom && (
                    <span className="badge text-xs hidden sm:inline-flex"
                      style={{ background: `${p.categorie_couleur}22`, color: p.categorie_couleur || '#006400' }}>
                      {p.categorie_nom}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── NOTRE MISSION ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-brand-light)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeader title={t.home.missionTitle} />
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                {t.home.missionText}
              </p>
              <div className="space-y-4">
                {t.home.valeurs.map((v, i) => {
                  const Icon = VALEUR_ICONS[i]
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--color-brand-primary)' }}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">{v.title}</h4>
                        <p className="text-sm text-gray-600">{v.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <Link to="/apropos" className="btn-primary mt-8 inline-flex">En savoir plus</Link>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80"
                alt="Journaliste africain en studio radio"
                loading="lazy"
                className="rounded-3xl w-full h-80 object-cover shadow-xl"
                style={{ border: '4px solid var(--color-brand-primary)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── LOCALISATION ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title={t.sections.location} align="center" />
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <GoogleMap height="350px" />
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--color-border)' }}>
                <h3 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--color-brand-primary)' }}>
                  Radio La Voix du Développement de Béré
                </h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex gap-3"><dt className="text-gray-500 w-20 flex-shrink-0">Fréquence</dt><dd className="font-bold text-gray-900">96.7 FM</dd></div>
                  <div className="flex gap-3"><dt className="text-gray-500 w-20 flex-shrink-0">Ville</dt><dd className="text-gray-700">Béré, Département de la Tandjilé Centre</dd></div>
                  <div className="flex gap-3"><dt className="text-gray-500 w-20 flex-shrink-0">Province</dt><dd className="text-gray-700">Province de la Tandjilé, Tchad</dd></div>
                  <div className="flex gap-3"><dt className="text-gray-500 w-20 flex-shrink-0">Antenne</dt><dd className="text-gray-700">24h/24, 7j/7</dd></div>
                </dl>
                <Link to="/contact" className="btn-primary mt-6 w-full justify-center">
                  Nous contacter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
