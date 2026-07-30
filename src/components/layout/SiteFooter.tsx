import { Link } from '@tanstack/react-router'
import { Radio, Facebook, Youtube, Phone, Mail, MapPin, MessageCircle } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { useConfig } from '@/hooks/useConfig'

export default function SiteFooter() {
  const { t } = useLang()
  const { config } = useConfig()
  const year = new Date().getFullYear()

  const navLinks = [
    { to: '/',           label: t.nav.home },
    { to: '/actualites', label: t.nav.news },
    { to: '/radio',      label: t.nav.radio },
    { to: '/agenda',     label: 'Agenda' },
    { to: '/projets',    label: t.nav.projects },
    { to: '/galerie',    label: t.nav.gallery },
    { to: '/frequences', label: 'Fréquences' },
    { to: '/apropos',    label: t.nav.about },
    { to: '/contact',    label: t.nav.contact },
  ]

  const colTitleStyle: React.CSSProperties = {
    color: 'var(--color-gold)', textTransform: 'uppercase', fontSize: '0.72rem',
    letterSpacing: '0.1em', fontWeight: 700, marginBottom: '1rem',
  }
  const linkStyle: React.CSSProperties = { color: 'rgba(255,255,255,0.6)', transition: 'var(--transition-fast)' }

  return (
    <footer style={{ background: 'var(--color-brand-dark)', color: 'white', borderTop: '1px solid rgba(201, 168, 76, 0.3)' }}
      className="pb-20"> {/* pb-20 pour laisser place au player global */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Col 1 — Identité */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-display font-bold text-sm">La Voix du Développement</div>
                <div className="text-xs font-bold" style={{ color: 'var(--color-gold)' }}>96.7 FM · Béré, Tchad</div>
              </div>
            </div>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>{t.footer.description}</p>
            <div className="flex gap-3">
              {config.facebook && (
                <a href={config.facebook} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {config.youtube && (
                <a href={config.youtube} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {config.whatsapp && (
                <a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ background: '#25D366' }}>
                  <MessageCircle className="w-4 h-4 text-white" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2 — Navigation */}
          <div>
            <h3 style={colTitleStyle}>{t.footer.col2Title}</h3>
            <ul className="space-y-2">
              {navLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:!text-white transition-colors" style={linkStyle}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Émissions */}
          <div>
            <h3 style={colTitleStyle}>{t.footer.col3Title}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/radio" className="hover:!text-white transition-colors" style={linkStyle}>Journal de la Tandjilé</Link></li>
              <li><Link to="/radio" className="hover:!text-white transition-colors" style={linkStyle}>Voix des champs</Link></li>
              <li><Link to="/radio" className="hover:!text-white transition-colors" style={linkStyle}>Santé pour tous</Link></li>
              <li><Link to="/radio" className="hover:!text-white transition-colors" style={linkStyle}>Jeunesse en action</Link></li>
              <li><Link to="/radio" className="hover:!text-white transition-colors" style={linkStyle}>Femme et développement</Link></li>
              <li><Link to="/radio" className="hover:!text-white transition-colors" style={linkStyle}>Débat citoyen</Link></li>
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <h3 style={colTitleStyle}>{t.footer.col4Title}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2" style={linkStyle}>
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/40" />
                <span>{t.footer.address}</span>
              </li>
              {config.telephone && (
                <li className="flex items-center gap-2" style={linkStyle}>
                  <Phone className="w-4 h-4 flex-shrink-0 text-white/40" />
                  <a href={`tel:${config.telephone}`} className="hover:!text-white transition-colors">{config.telephone}</a>
                </li>
              )}
              {config.email && (
                <li className="flex items-center gap-2" style={linkStyle}>
                  <Mail className="w-4 h-4 flex-shrink-0 text-white/40" />
                  <a href={`mailto:${config.email}`} className="hover:!text-white transition-colors">{config.email}</a>
                </li>
              )}
              <li style={linkStyle}>{t.footer.schedule}</li>
            </ul>
          </div>
        </div>

        {/* Barre basse */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40 text-center">
            © {year} La Voix du Développement de Béré · 96.7 FM · Béré, Province de la Tandjilé, Tchad
            <br />
            {t.footer.rights} · {t.footer.madeBy}{' '}
            <a href="https://flaugustbusiness.com" target="_blank" rel="noopener noreferrer"
              className="transition-colors underline hover:!text-[var(--color-gold)]">
              ETS FLANGUST BUSINESS
            </a>
          </p>
          <div className="flex gap-4 text-xs text-white/40">
            <Link to="/mentions-legales" className="hover:text-white/70 transition-colors">Mentions légales</Link>
            <Link to="/contact" className="hover:text-white/70 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
