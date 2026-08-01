import { Link } from '@tanstack/react-router'
import { CalendarDays } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function AgendaPage() {
  useDocumentTitle('Agenda | Radio Voix de Béré')
  return (
    <main className="pt-16">
      <div className="py-12 px-4 text-center text-white"
        style={{ background: 'linear-gradient(135deg, #004D2A 0%, #006B3C 60%, #008A4B 100%)' }}>
        <h1 className="font-display font-bold text-4xl mb-2" style={{ color: '#FFFFFF' }}>Agenda</h1>
        <p style={{ color: 'rgba(255,255,255,0.85)' }}>Les événements locaux de Béré et de la Tandjilé</p>
      </div>

      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'var(--color-brand-light)' }}>
            <CalendarDays className="w-10 h-10" style={{ color: 'var(--color-brand-primary)' }} />
          </div>
          <h2 className="font-display font-bold text-2xl mb-4" style={{ color: 'var(--color-brand-primary)' }}>
            Aucun événement programmé pour le moment
          </h2>
          <p className="text-gray-600 mb-8">
            Revenez bientôt ou contactez-nous pour annoncer votre événement.
          </p>
          <Link to="/contact" className="btn-primary inline-flex">
            Soumettre un événement
          </Link>
        </div>
      </section>
    </main>
  )
}
