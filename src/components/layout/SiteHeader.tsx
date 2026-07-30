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
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const langRef = useRef<HTMLDivElement>(null)

  const navLinks = [
    { to: '/',           label: t.nav.home },
    { to: '/actualites', label: t.nav.news },
    { to: '/radio',      label: t.nav.radio },
    { to: '/projets',    label: t.nav.projects },
    { to: '/galerie',    label: t.nav.gallery },
    { to: '/apropos',    label: t.nav.about },
    { to: '/contact',    label: t.nav.contact },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'shadow-md bg-white/98 backdrop-blur-md' : 'bg-white border-b-2'
      }`}
      style={{ borderBottomColor: scrolled ? 'transparent' : 'var(--color-brand-primary)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo + Nom */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img
              src="/logo.png"
              alt="Radio La Voix du Développement de Béré 96.7 FM"
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              width="40"
              height="40"
            />
            <div className="hidden sm:block">
              <div className="font-display font-bold text-sm leading-tight"
                style={{ color: 'var(--color-brand-primary)' }}>
                La Voix du Développement
              </div>
              <div className="text-xs font-bold leading-tight"
                style={{ color: 'var(--color-accent)' }}>
                96.7 FM — Béré, Tchad
              </div>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  isActive(link.to)
                    ? 'text-white'
                    : 'text-gray-700 hover:text-white hover:bg-[var(--color-brand-primary)]'
                }`}
                style={isActive(link.to) ? { background: 'var(--color-brand-primary)' } : undefined}
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
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white transition-all duration-200 ${
                isPlaying ? 'animate-pulse-slow' : ''
              }`}
              style={{ background: 'var(--color-accent)' }}
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
              {navLinks.map(link => (
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
                {t.live.label} — 96.7 FM
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
