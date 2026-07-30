import { FileText, MapPin, Calendar, Landmark, AlertTriangle } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import GoogleMap from '@/components/shared/GoogleMap'

export default function FrequencesPage() {
  useDocumentTitle('Fréquences et autorisation | Radio Voix de Béré')
  return (
    <main className="pt-16">
      <div className="py-12 px-4 text-center text-white"
        style={{ background: 'linear-gradient(135deg, var(--color-brand-dark), var(--color-brand-primary))' }}>
        <h1 className="font-display font-bold text-4xl mb-2">Fréquences et autorisation</h1>
        <p className="text-white/70">Informations officielles de diffusion</p>
      </div>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-6 space-y-4" style={{ border: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-brand-primary)' }} />
              <div>
                <div className="text-xs text-gray-500">Décision</div>
                <div className="font-bold text-gray-900">N° 016/HAMA/SO/2023</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Landmark className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-brand-primary)' }} />
              <div>
                <div className="text-xs text-gray-500">Autorité</div>
                <div className="font-bold text-gray-900">HAMA, Haute autorité des médias et de l'audiovisuel</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-brand-primary)' }} />
              <div>
                <div className="text-xs text-gray-500">Date d'attribution</div>
                <div className="font-bold text-gray-900">16 mai 2023</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-brand-primary)' }} />
              <div>
                <div className="text-xs text-gray-500">Zone de diffusion</div>
                <div className="font-bold text-gray-900">Béré, Département de la Tandjilé Centre, province de la Tandjilé</div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl flex items-start gap-3" style={{ background: '#fff8e6', border: '1px solid #f0d896' }}>
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#b8860b' }} />
              <div className="text-sm text-gray-700">
                <p className="font-semibold text-gray-900 mb-1">Fréquence : 96.7 FM (à confirmer)</p>
                <p>
                  La décision HAMA n° 016/HAMA/SO/2023 assigne, dans son texte, la fréquence
                  98.7 MHz à la RADIO VOIX DE DEVELOPPEMENT. Le site affiche actuellement 96.7 FM
                  ailleurs dans son contenu, il conviendra de confirmer la fréquence exacte en
                  exploitation avant publication définitive.
                </p>
              </div>
            </div>
          </div>

          <GoogleMap height="100%" />
        </div>
      </section>
    </main>
  )
}
