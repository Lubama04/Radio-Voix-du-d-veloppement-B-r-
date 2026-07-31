import { Radio, FileText, Building2, Calendar, MapPin, CheckCircle, Clock } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import GoogleMap from '@/components/shared/GoogleMap'

const INFOS = [
  { label: 'Fréquence', value: '96.7 FM', icon: Radio },
  { label: 'Décision HAMA', value: 'N° 016/HAMA/SO/2023', icon: FileText },
  { label: 'Autorité', value: "Haute Autorité des Médias et de l'Audiovisuel (HAMA)", icon: Building2 },
  { label: "Date d'attribution", value: '16 mai 2023', icon: Calendar },
  { label: 'Zone de diffusion', value: 'Béré, Département de la Tandjilé Centre, Province de la Tandjilé, Tchad', icon: MapPin },
  { label: 'Statut', value: 'Radio privée associative autorisée', icon: CheckCircle },
  { label: 'Antenne', value: '24 heures sur 24, 7 jours sur 7', icon: Clock },
]

export default function FrequencesPage() {
  useDocumentTitle('Fréquences et autorisation | Radio Voix de Béré')
  return (
    <main className="pt-16">
      <div className="py-12 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, #004D2A 0%, #006B3C 60%, #008A4B 100%)' }}>
        <h1 className="font-display font-bold text-4xl mb-2" style={{ color: '#FFFFFF' }}>Fréquences et autorisation</h1>
        <p style={{ color: 'rgba(255,255,255,0.85)' }}>Informations officielles de diffusion</p>
      </div>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #DEDBD3' }}>
            <h2 className="font-display font-bold text-2xl mb-6" style={{ color: '#1E2A22' }}>
              Informations de diffusion
            </h2>

            {INFOS.map((item, i) => (
              <div key={i} className="flex items-start gap-4 py-4 border-b last:border-0" style={{ borderColor: '#DEDBD3' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#E8F5EE' }}>
                  <item.icon className="w-4 h-4" style={{ color: 'var(--color-brand-primary)' }} />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#6B6B6B' }}>
                    {item.label}
                  </div>
                  <div className="font-semibold" style={{ color: '#1C1C1C' }}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <GoogleMap height="100%" />
        </div>
      </section>
    </main>
  )
}
