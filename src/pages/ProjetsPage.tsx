import { ExternalLink } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import SectionHeader from '@/components/shared/SectionHeader'

const PROJETS = [
  { titre: 'Radios Rurales Connectées', desc: 'Déploiement d\'une infrastructure numérique pour connecter les radios rurales du Tchad et favoriser l\'échange de contenus entre stations.', image: 'https://images.unsplash.com/photo-1598743400863-0201dc7f7d8a?w=600&q=70', partenaire: 'CFI / Afri\'Kibaaru', statut: 'En cours', couleur: '#006400' },
  { titre: 'Santé pour Tous', desc: 'Partenariat avec l\'UNICEF pour la diffusion de messages de santé communautaire : vaccination, nutrition maternelle et infantile, lutte contre le choléra.', image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=70', partenaire: 'UNICEF Tchad', statut: 'Actif', couleur: '#1CABE2' },
  { titre: 'École des Ondes', desc: 'Programme de formation au journalisme communautaire pour les jeunes de la province de la Tandjilé, en partenariat avec le réseau JCAC.', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=70', partenaire: 'JCAC / DW Akademie', statut: 'En développement', couleur: '#E30614' },
  { titre: 'Agriculture & Développement', desc: 'Émissions agricoles hebdomadaires en partenariat avec la FAO Tchad : météo agricole, prix des marchés, techniques culturales adaptées à la Tandjilé.', image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=70', partenaire: 'FAO Tchad', statut: 'Actif', couleur: '#F6A800' },
]

export default function ProjetsPage() {
  useDocumentTitle('Projets & Partenariats | Radio Voix de Béré')
  return (
    <main className="pt-16">
      <div className="py-12 px-4 text-center text-white"
        style={{ background: 'linear-gradient(135deg, var(--color-brand-dark), var(--color-brand-primary))' }}>
        <h1 className="font-display font-bold text-4xl mb-2">Projets & Partenariats</h1>
        <p className="text-white/70">Nos projets de développement local et nos partenaires institutionnels</p>
      </div>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Nos projets en cours" />
          <div className="grid sm:grid-cols-2 gap-8">
            {PROJETS.map((p, i) => (
              <div key={i} className="card group flex flex-col">
                <div className="relative h-52 overflow-hidden">
                  <img src={p.image} alt={p.titre} loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <span className="absolute top-3 right-3 badge text-white text-xs"
                    style={{ background: p.couleur }}>{p.statut}</span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-display font-bold text-xl mb-2 group-hover:text-green-700 transition-colors">
                    {p.titre}
                  </h3>
                  <p className="text-gray-600 text-sm flex-1 mb-4">{p.desc}</p>
                  <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="text-xs text-gray-500 font-medium">{p.partenaire}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA devenir partenaire */}
          <div className="mt-16 text-center bg-white rounded-3xl p-12" style={{ border: '2px dashed var(--color-brand-primary)' }}>
            <h2 className="font-display font-bold text-3xl mb-4" style={{ color: 'var(--color-brand-primary)' }}>
              Vous souhaitez devenir partenaire ?
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto mb-8">
              La Voix du Développement de Béré est ouverte à tout partenariat aligné avec sa mission de service à la communauté. ONG, institutions, entreprises locales — contactez-nous.
            </p>
            <Link to="/contact" className="btn-primary text-base px-8 py-4">
              Proposer un partenariat <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
