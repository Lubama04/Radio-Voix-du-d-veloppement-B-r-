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
    { to: '/projets',    label: t.nav.projects },
    { to: '/galerie',    label: t.nav.gallery },
    { to: '/apropos',    label: t.nav.about },
    { to: '/contact',    label: t.nav.contact },
  ]

  return (
    <footer style={{ background: 'var(--color-brand-dark)', color: 'white' }}
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
                <div className="text-xs font-bold" style={{ color: '#ff6666' }}>96.7 FM · Béré, Tchad</div>
              </div>
            </div>
            <p className="text-sm text-white/70 mb-4">{t.footer.description}</p>
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
            <h3 className="font-bold text-sm uppercase tracking-wide text-white/50 mb-4">Navigation</h3>
            <ul className="space-y-2">
              {navLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to}
                    className="text-sm text-white/70 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Émissions */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide text-white/50 mb-4">Émissions</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/radio" className="hover:text-white transition-colors">Journal de la Tandjilé</Link></li>
              <li><Link to="/radio" className="hover:text-white transition-colors">Voix des Champs</Link></li>
              <li><Link to="/radio" className="hover:text-white transition-colors">Santé pour Tous</Link></li>
              <li><Link to="/radio" className="hover:text-white transition-colors">Jeunesse en Action</Link></li>
              <li><Link to="/radio" className="hover:text-white transition-colors">Femme et Développement</Link></li>
              <li><Link to="/radio" className="hover:text-white transition-colors">Débat Citoyen</Link></li>
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide text-white/50 mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/40" />
                <span>Béré, Tandjilé Centre<br />Province de la Tandjilé, Tchad</span>
              </li>
              {config.telephone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0 text-white/40" />
                  <a href={`tel:${config.telephone}`} className="hover:text-white transition-colors">{config.telephone}</a>
                </li>
              )}
              {config.email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0 text-white/40" />
                  <a href={`mailto:${config.email}`} className="hover:text-white transition-colors">{config.email}</a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Barre basse */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40 text-center">
            © {year} La Voix du Développement de Béré · 96.7 FM · Béré, Province de la Tandjilé, Tchad
            <br />
            {t.footer.rights} · Réalisé par{' '}
            <a href="https://flaugustbusiness.com" target="_blank" rel="noopener noreferrer"
              className="hover:text-white/70 transition-colors underline">
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
