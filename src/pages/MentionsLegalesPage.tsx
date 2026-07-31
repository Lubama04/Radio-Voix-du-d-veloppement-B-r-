import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function MentionsLegalesPage() {
  useDocumentTitle('Mentions légales | Radio Voix de Béré')
  return (
    <main className="pt-16">
      <div className="py-12 px-4 text-center text-white"
        style={{ background: 'linear-gradient(135deg, var(--color-brand-dark), var(--color-brand-secondary))' }}>
        <h1 className="font-display font-bold text-3xl">Mentions légales</h1>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-16 prose prose-sm text-gray-700">
        <h2>Éditeur du site</h2>
        <p>
          <strong>Radio La Voix du Développement de Béré</strong><br />
          96.7 FM, Béré, Département de la Tandjilé Centre<br />
          Province de la Tandjilé, République du Tchad
        </p>
        <h2>Réalisation</h2>
        <p>
          Site web réalisé par <strong>ETS FLANGUST BUSINESS</strong><br />
          RCCM : TD-SRH-2024-A-140 · ANIE N°0008290<br />
          flaugustb@gmail.com
        </p>
        <h2>Hébergement</h2>
        <p>Ce site est hébergé sur Vercel Inc., San Francisco, Californie, États-Unis.</p>
        <h2>Données personnelles</h2>
        <p>
          Les informations collectées via le formulaire de contact sont utilisées exclusivement pour répondre à vos
          demandes. Elles ne sont ni cédées ni vendues à des tiers. Conformément aux dispositions applicables, vous
          disposez d'un droit d'accès, de rectification et de suppression de vos données en contactant la radio.
        </p>
        <h2>Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus de ce site (textes, images, sons, programmes) est la propriété exclusive de
          Radio La Voix du Développement de Béré ou de ses partenaires. Toute reproduction est interdite sans
          autorisation préalable.
        </p>
        <h2>Cookies</h2>
        <p>Ce site utilise uniquement un cookie fonctionnel pour mémoriser votre préférence de langue. Aucun cookie publicitaire n'est utilisé.</p>
      </div>
    </main>
  )
}
