import { useEffect, useState } from 'react'
import { Radio, Users, Star } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { db } from '@/lib/supabase'
import SectionHeader from '@/components/shared/SectionHeader'
import GoogleMap from '@/components/shared/GoogleMap'
import SafeImage from '@/components/shared/SafeImage'
import type { Partenaire } from '@/types/database'

export default function AProposPage() {
  useDocumentTitle('À Propos | Radio La Voix du Développement de Béré')
  const { t } = useLang()
  const [partenaires, setPartenaires] = useState<Partenaire[]>([])

  useEffect(() => {
    db.partenaires().select('*').eq('actif', true).order('ordre_affichage').limit(10)
      .then(({ data }) => { if (data) setPartenaires(data as Partenaire[]) })
  }, [])

  return (
    <main className="pt-16">
      {/* Hero avec logo */}
      <div className="py-16 text-center text-white"
        style={{ background: 'linear-gradient(135deg, #004D2A 0%, #006B3C 60%, #008A4B 100%)' }}>
        <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
          <Radio className="w-12 h-12 text-white" />
        </div>
        <h1 className="font-display font-bold text-4xl mb-2">La Voix du Développement de Béré</h1>
        <p className="text-lg" style={{ color: 'rgba(255,255,255,0.85)' }}>96.7 FM · Béré, Province de la Tandjilé, Tchad</p>
        <p className="text-white/50 mt-2 italic">"La voix qui porte le développement"</p>
      </div>

      {/* Histoire */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <SectionHeader title="Notre histoire" align="center" />
          <div className="prose prose-lg mx-auto text-gray-700">
            <p>
              Autorisée par la HAMA (Haute Autorité des Médias et de l'Audiovisuel du Tchad) par
              décision n° 016/HAMA/SO/2023 du 16 mai 2023, la Radio Voix de Développement de Béré
              est une radio privée associative au service du développement local. Implantée à Béré,
              dans le département de la Tandjilé Centre, province de la Tandjilé, elle émet sur la
              fréquence 96.7 FM pour les populations de la région.
            </p>
            <p>
              Depuis son autorisation, nous accompagnons les grandes étapes du développement de notre
              province : campagnes de vaccination, sensibilisation agricole, couverture des événements
              locaux, mais aussi musique, culture et patrimoine des peuples de la Tandjilé.
            </p>
            <p>
              Aujourd'hui, la Radio Voix de Développement de Béré franchit un nouveau cap avec le
              lancement de son site web officiel et de son application en ligne, portant notre signal
              bien au-delà des ondes FM, jusqu'aux enfants de Béré dispersés aux quatre coins du monde.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Valeurs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-brand-light)' }}>
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Mission et valeurs" align="center" />
          <div className="grid sm:grid-cols-3 gap-6 mt-8">
            {[
              { icon: Radio,  title: 'Informer',      desc: 'Produire et diffuser une information locale fiable, vérifiée et utile pour les communautés de la Tandjilé.' },
              { icon: Users,  title: 'Rassembler',    desc: 'Être le lien entre les villages, les institutions et les organisations pour un développement concerté.' },
              { icon: Star,   title: 'Valoriser',     desc: 'Promouvoir les cultures, langues et savoirs locaux des peuples de la Tandjilé et du Tchad.' },
            ].map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 text-center shadow-sm"
                style={{ border: '1px solid var(--color-border)' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'var(--color-brand-primary)' }}>
                  <v.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-xl mb-3" style={{ color: 'var(--color-brand-primary)' }}>
                  {v.title}
                </h3>
                <p className="text-gray-600 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Équipe */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title={t.sections.team} subtitle="Les femmes et hommes qui font vivre la radio au quotidien" align="center" />
          <figure className="mt-8">
            <SafeImage
              src="/photos/equipe-radio-bere.jpg"
              alt="L'équipe de la Radio Voix de Développement de Béré devant les locaux de la station"
              loading="lazy"
              className="w-full rounded-2xl object-cover shadow-md max-h-[480px]"
              style={{ border: '3px solid var(--color-brand-primary)' }}
            />
            <figcaption className="text-center text-sm text-gray-500 mt-3">
              L'équipe de la Radio Voix de Développement de Béré
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Zone de couverture + carte */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-surface-alt)' }}>
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Zone de couverture" />
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <p className="text-gray-700 mb-6">
                La Voix du Développement de Béré couvre la ville de Béré et ses environs sur la
                fréquence 96.7 FM, atteignant les villages et communautés du Département de la
                Tandjilé Centre, dans la Province de la Tandjilé, au Tchad.
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Ville principale', value: 'Béré' },
                  { label: 'Département', value: 'Tandjilé Centre' },
                  { label: 'Province', value: 'Province de la Tandjilé' },
                  { label: 'Pays', value: 'Tchad' },
                  { label: 'Fréquence', value: '96.7 FM' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 py-2 border-b"
                    style={{ borderColor: 'var(--color-border)' }}>
                    <div className="text-sm text-gray-500 w-32 flex-shrink-0">{item.label}</div>
                    <div className="text-sm font-semibold text-gray-900">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <GoogleMap height="350px" />
          </div>
        </div>
      </section>

      {/* Partenaires */}
      {partenaires.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <SectionHeader title={t.sections.partners} align="center" />
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {partenaires.map(p => (
                <div key={p.id} className="bg-white rounded-xl px-6 py-4 shadow-sm text-center min-w-32"
                  style={{ border: '1px solid var(--color-border)' }}>
                  {p.logo_url ? (
                    <SafeImage src={p.logo_url} alt={p.nom} className="h-10 object-contain mx-auto mb-2" loading="lazy" />
                  ) : (
                    <div className="h-10 flex items-center justify-center mb-2">
                      <span className="font-bold text-sm" style={{ color: 'var(--color-brand-primary)' }}>{p.nom_court || p.nom}</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-500">{p.nom}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
