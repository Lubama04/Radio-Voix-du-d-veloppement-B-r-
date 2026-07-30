import { Link } from '@tanstack/react-router'
import { Briefcase } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function ProjetsPage() {
  useDocumentTitle('Projets et partenariats | Radio Voix de Béré')
  return (
    <main className="pt-16">
      <div className="py-12 px-4 text-center text-white"
        style={{ background: 'linear-gradient(135deg, var(--color-brand-dark), var(--color-brand-primary))' }}>
        <h1 className="font-display font-bold text-4xl mb-2">Projets et partenariats</h1>
        <p className="text-white/70">Nos initiatives au service du développement local</p>
      </div>

      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'var(--color-brand-light)' }}>
            <Briefcase className="w-10 h-10" style={{ color: 'var(--color-brand-primary)' }} />
          </div>
          <h2 className="font-display font-bold text-2xl mb-4"
            style={{ color: 'var(--color-brand-primary)' }}>
            Projets en cours de développement
          </h2>
          <p className="text-gray-600 mb-8">
            La Radio Voix de Développement de Béré travaille actuellement
            à la mise en place de partenariats avec des organisations locales
            et internationales. Cette section sera mise à jour dès que
            les projets seront officiellement lancés.
          </p>
          <Link to="/contact" className="btn-primary inline-flex">
            Proposer un partenariat
          </Link>
        </div>
      </section>
    </main>
  )
}
