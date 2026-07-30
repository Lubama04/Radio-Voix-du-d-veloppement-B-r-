import { useEffect, useState } from 'react'
import { Radio, Users, MapPin, Star } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { db } from '@/lib/supabase'
import SectionHeader from '@/components/shared/SectionHeader'
import GoogleMap from '@/components/shared/GoogleMap'
import type { Partenaire } from '@/types/database'

const EQUIPE = [
  { nom: 'Jean-Pierre Moïse', fonction: 'Directeur & Fondateur', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', bio: 'Fondateur de la radio depuis 2010, journaliste communautaire engagé.' },
  { nom: 'Fatimé Harouna', fonction: 'Rédactrice en chef', photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80', bio: 'Journaliste professionnelle, responsable de la couverture locale.' },
  { nom: 'Théophile Nadji', fonction: 'Responsable technique', photo: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=200&q=80', bio: 'Technicien son expérimenté, garant de la qualité de diffusion.' },
  { nom: 'Adèle Yombé', fonction: 'Animatrice principale', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80', bio: 'Voix emblématique de la radio, animatrice de plusieurs émissions phares.' },
  { nom: 'Éric Dossia', fonction: 'Correspondant terrain', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80', bio: 'Journaliste de terrain couvrant la province de la Tandjilé.' },
  { nom: 'Marie-Claire Bao', fonction: 'Animatrice Jeunesse', photo: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=200&q=80', bio: 'Responsable des émissions dédiées aux jeunes de Béré.' },
]

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
        style={{ background: 'linear-gradient(135deg, var(--color-brand-dark), var(--color-brand-primary))' }}>
        <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
          <Radio className="w-12 h-12 text-white" />
        </div>
        <h1 className="font-display font-bold text-4xl mb-2">La Voix du Développement de Béré</h1>
        <p className="text-white/70 text-lg">96.7 FM · Béré, Province de la Tandjilé, Tchad</p>
        <p className="text-white/50 mt-2 italic">"La voix qui porte le développement"</p>
      </div>

      {/* Histoire */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <SectionHeader title="Notre histoire" align="center" />
          <div className="prose prose-lg mx-auto text-gray-700">
            <p>
              Née en 2010 à Béré, dans la province de la Tandjilé, La Voix du Développement de Béré
              s'est imposée comme la radio de référence des populations rurales de la Tandjilé Centre.
              Fondée avec la conviction que l'information locale est un droit fondamental pour chaque
              communauté, notre station émet en continu sur la fréquence 96.7 FM.
            </p>
            <p>
              En plus d'une décennie d'antenne, nous avons accompagné les grandes étapes du développement
              de notre province : campagnes de vaccination, sensibilisation agricole, couverture des
              événements locaux, mais aussi musique, culture et patrimoine des peuples de la Tandjilé.
            </p>
            <p>
              Aujourd'hui, La Voix du Développement de Béré franchit un nouveau cap avec le lancement
              de son site web officiel et de son application en ligne, portant notre signal bien au-delà
              des ondes FM — jusqu'aux enfants de Béré dispersés aux quatre coins du monde.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Valeurs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-brand-light)' }}>
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Mission & Valeurs" align="center" />
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mt-8">
            {EQUIPE.map((m, i) => (
              <div key={i} className="text-center">
                <img src={m.photo} alt={m.nom} loading="lazy"
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-3 shadow-md"
                  style={{ border: '3px solid var(--color-brand-primary)' }} />
                <div className="font-bold text-sm text-gray-900">{m.nom}</div>
                <div className="text-xs text-gray-500 mt-1">{m.fonction}</div>
              </div>
            ))}
          </div>
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
                  { label: 'Puissance', value: 'À préciser' },
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
                    <img src={p.logo_url} alt={p.nom} className="h-10 object-contain mx-auto mb-2" loading="lazy" />
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
