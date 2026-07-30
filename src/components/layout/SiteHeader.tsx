import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Menu, X, Globe, ChevronDown, Check } from 'lucide-react'
import { useLang, type Lang } from '@/contexts/LanguageContext'
import { usePlayer } from '@/contexts/PlayerContext'

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ar', flag: '🇸🇦', label: 'العربية' },
]

export default function SiteHeader() {
  const { t, lang, setLang } = useLang()
  const { toggle, isPlaying } = usePlayer()
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const location = useLocation()
  const langRef = useRef<HTMLDivElement>(null)

  const navLinks = [
    { to: '/',           label: t.nav.home },
    { to: '/actualites', label: t.nav.news },
    { to: '/radio',      label: t.nav.radio },
    { to: '/agenda',     label: 'Agenda', mobileHidden: true },
    { to: '/projets',    label: t.nav.projects },
    { to: '/galerie',    label: t.nav.gallery },
    { to: '/frequences', label: 'Fréquences', mobileHidden: true },
    { to: '/apropos',    label: t.nav.about },
    { to: '/contact',    label: t.nav.contact },
  ]
  const mobileNavLinks = navLinks.filter(l => !l.mobileHidden)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  const currentLang = LANGS.find(l => l.code === lang)!

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40"
      style={{
        backgroundColor: '#FAFAF7',
        borderBottom: '1px solid #E8E4DC',
        boxShadow: '0 2px 12px rgba(27, 67, 50, 0.08)',
        height: '68px',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">

          {/* Logo + Nom */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img
              src="/logo.png"
              alt="Radio La Voix du Développement de Béré 96.7 FM"
              style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #C9A84C' }}
            />
            <div className="hidden sm:block">
              <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '0.9rem', color: '#1B4332', lineHeight: 1.2 }}>
                La Voix du Développement
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9B2226', letterSpacing: '0.04em' }}>
                96.7 FM · Béré, Tchad
              </div>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={isActive(link.to)
                  ? { background: '#D8F3DC', color: '#1B4332', borderRadius: 8, padding: '6px 12px', fontWeight: 600, fontSize: '0.88rem' }
                  : { color: '#2C2C2C', fontWeight: 600, fontSize: '0.88rem', padding: '6px 12px' }
                }
                className="transition-colors duration-150 hover:!text-[#1B4332]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions droite */}
          <div className="flex items-center gap-2">

            {/* Bouton EN DIRECT */}
            <button
              onClick={toggle}
              className={`hidden sm:flex ${isPlaying ? 'animate-pulse-slow' : ''}`}
              style={{
                background: '#9B2226', color: 'white', borderRadius: '9999px', padding: '8px 18px',
                fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.04em', border: 'none',
                alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(155,34,38,0.3)',
              }}
              aria-label="Écouter en direct"
            >
              <span className={`w-2 h-2 rounded-full bg-white ${isPlaying ? 'animate-ping' : ''}`} />
              {t.live.label}
            </button>

            {/* Sélecteur de langue */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-semibold transition-all"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                aria-label="Changer de langue"
                aria-expanded={langOpen}
              >
                <Globe className="w-4 h-4" style={{ color: 'var(--color-brand-primary)' }} />
                <span className="hidden sm:inline">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
                <span className="sm:hidden">{currentLang.flag}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border overflow-hidden z-50 animate-fade-in"
                  style={{ borderColor: 'var(--color-border)' }}>
                  {LANGS.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false) }}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
                      style={lang === l.code ? { background: 'var(--color-brand-light)', color: 'var(--color-brand-primary)' } : {}}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      {lang === l.code && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hamburger mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg transition-colors"
              style={{ color: 'var(--color-brand-primary)' }}
              aria-label="Menu de navigation"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Drawer mobile */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 top-16 bg-black/40 z-30 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
          {/* Menu panel */}
          <div
            className="fixed top-16 left-0 right-0 z-40 lg:hidden shadow-2xl animate-slide-up"
            style={{ backgroundColor: '#ffffff' }}
          >
            <nav className="px-4 py-4 space-y-1">
              {mobileNavLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                    isActive(link.to) ? 'text-white' : 'text-gray-800'
                  }`}
                  style={isActive(link.to) ? { background: 'var(--color-brand-primary)' } : {}}
                >
                  {link.label}
                </Link>
              ))}
              {/* EN DIRECT dans le menu mobile */}
              <button
                onClick={toggle}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-white mt-2"
                style={{ background: 'var(--color-accent)' }}
              >
                <span className={`w-2 h-2 rounded-full bg-white ${isPlaying ? 'animate-ping' : ''}`} />
                {t.live.label}, 96.7 FM
              </button>
              {/* Sélecteur langue dans le drawer */}
              <div className="flex gap-2 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                {LANGS.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setMenuOpen(false) }}
                    className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-sm font-medium transition-all"
                    style={lang === l.code
                      ? { background: 'var(--color-brand-light)', color: 'var(--color-brand-primary)' }
                      : { color: 'var(--color-text-secondary)' }}
                  >
                    <span className="text-xl">{l.flag}</span>
                    <span>{l.code.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  )
}
