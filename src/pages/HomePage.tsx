import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Play, ChevronRight, Newspaper, Radio, Briefcase, Image as ImageIcon, Info, Phone } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { usePlayer } from '@/contexts/PlayerContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { db } from '@/lib/supabase'
import SectionHeader from '@/components/shared/SectionHeader'
import ArticleCard from '@/components/shared/ArticleCard'
import SafeImage from '@/components/shared/SafeImage'
import Ticker from '@/components/layout/Ticker'
import type { ActualiteView, ProgrammeView } from '@/types/database'

const NAV_CARDS = [
  { key: 'news' as const,     to: '/actualites', icon: Newspaper, badgeColor: '#9B2226', img: '/photos/studio-radio-bere.jpg', alt: 'Studio de diffusion de la Radio Voix de Béré' },
  { key: 'radio' as const,    to: '/radio',      icon: Radio,     badgeColor: '#1B4332', img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&q=75&auto=format&fit=crop', alt: 'Studio de radio avec microphone professionnel' },
  { key: 'projects' as const, to: '/projets',    icon: Briefcase, badgeColor: null, img: '/photos/equipe-radio-bere.jpg', alt: "L'équipe de la Radio Voix de Béré" },
  { key: 'gallery' as const,  to: '/galerie',    icon: ImageIcon, badgeColor: null, img: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=75&auto=format&fit=crop', alt: 'Paysage de savane africaine au coucher de soleil' },
  { key: 'about' as const,    to: '/apropos',    icon: Info,      badgeColor: null, img: '/photos/equipe-radio-bere.jpg', alt: "L'équipe de la Radio Voix de Béré devant les locaux de la station" },
  { key: 'contact' as const,  to: '/contact',    icon: Phone,     badgeColor: '#9B2226', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=75&auto=format&fit=crop', alt: 'Professionnel de santé africain consultant son téléphone' },
]

export default function HomePage() {
  useDocumentTitle('La Voix du Développement de Béré, 96.7 FM | Béré, Tandjilé, Tchad')
  const { t } = useLang()
  const { toggle, isPlaying, openPlayer } = usePlayer()
  const [articles] = useState<ActualiteView[]>([])
  // Chargement des actualités désactivé le temps que les premières vraies actualités soient publiées.
  // Décommenter quand du contenu réel est prêt.
  // const [articles, setArticles] = useState<ActualiteView[]>([])
  const [programmes, setProgrammes] = useState<ProgrammeView[]>([])
  const loadingActus = false
  const today = new Date().getDay() // 0=dim...6=sam

  useEffect(() => {
    // db.vActualites()
    //   .select('id,titre,slug,extrait,image_url,date_publication,categorie_nom,categorie_couleur,a_la_une,vues')
    //   .order('date_publication', { ascending: false })
    //   .limit(3)
    //   .then(({ data }) => { if (data) setArticles(data as ActualiteView[]) })

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
        style={{ background: 'linear-gradient(135deg, #3A8F6B 0%, #52B788 50%, #3A8F6B 100%)' }}>
        {/* Ondes radio animées, côté droit */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <svg className="absolute" style={{ right: '2%', top: '50%', transform: 'translateY(-50%)' }}
            width="420" height="420" viewBox="0 0 420 420">
            {['wave-1', 'wave-2', 'wave-3', 'wave-4', 'wave-5'].map(cls => (
              <circle key={cls} cx="210" cy="210" r="50" fill="none" stroke="white" strokeWidth="1.5"
                className={cls} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
            ))}
          </svg>
          {/* Lignes horizontales animées */}
          {[22, 50, 78].map((top, i) => (
            <div key={top} className="absolute h-px bg-white line-anim"
              style={{ top: `${top}%`, left: 0, width: '60%', opacity: 0.04, animationDelay: `${i * 3}s` }} />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Gauche — Texte */}
            <div className="animate-hero-in">
              <div className="live-badge inline-flex mb-6">
                <span className="live-dot" />
                🔴 {t.hero.badge}
              </div>
              <h1 className="font-display text-white mb-4 leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                {t.hero.title}
              </h1>
              <p className="text-lg mb-8 max-w-lg" style={{ color: 'rgba(255,255,255,0.85)' }}>{t.hero.subtitle}</p>
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
                <SafeImage
                  src="/photos/studio-radio-bere.jpg"
                  alt="Studio de diffusion de la Radio Voix de Développement de Béré"
                  loading="eager"
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
      <div style={{ background: '#243B2F', borderTop: '1px solid rgba(201, 168, 76, 0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {[
              { val: '96.7 FM', label: t.home.statLabels[0] },
              { val: 'Béré, Tandjilé', label: t.home.statLabels[1] },
              { val: '24h sur 24', label: t.home.statLabels[2] },
              { val: 'Depuis 2023', label: t.home.statLabels[3] },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center py-3 px-4"
                style={{ borderLeft: i > 0 ? '1px solid rgba(201, 168, 76, 0.3)' : undefined }}>
                <div className="font-display font-bold" style={{ fontSize: '1.6rem', color: '#C9A84C' }}>{s.val}</div>
                <div className="text-center" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>{s.label}</div>
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
          {NAV_CARDS.map(card => {
            const text = t.cards[card.key]
            return (
            <Link key={card.to} to={card.to} className="card group flex flex-col cursor-pointer">
              {/* Image */}
              <div className="relative h-[180px] overflow-hidden">
                <SafeImage src={card.img} alt={card.alt} loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {text.badge && card.badgeColor && (
                  <span className="absolute top-2 right-2 badge text-xs font-bold text-white"
                    style={{ background: card.badgeColor }}>
                    {text.badge}
                  </span>
                )}
              </div>
              {/* Texte */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <card.icon className="w-5 h-5" style={{ color: 'var(--color-gold)' }} />
                  <h3 className="font-display transition-colors" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
                    {text.title}
                  </h3>
                </div>
                <p className="flex-1" style={{ fontSize: '0.85rem', color: 'var(--color-gray-medium)' }}>{text.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-sm"
                  style={{ color: 'var(--color-brand-primary)', fontWeight: 700 }}>
                  Découvrir <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          )})}
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
          ) : null}
        </div>
      </section>

      {/* ── PROGRAMME DU JOUR ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title={t.sections.programs} action={{ label: 'Grille complète', href: '/radio' }} />
          {programmes.length > 0 ? (
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
          ) : (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: '#6B6B6B' }}>
                Les programmes seront disponibles prochainement.
              </p>
            </div>
          )}
        </div>
      </section>

    </main>
  )
}
