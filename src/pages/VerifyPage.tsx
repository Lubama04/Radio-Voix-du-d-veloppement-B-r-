import { useEffect } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { CheckCircle2, Clock, XCircle, HelpCircle } from 'lucide-react'
import { useVerification } from '@/hooks/useVerification'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import SafeImage from '@/components/shared/SafeImage'

const STATUT_STYLE: Record<string, { bg: string; label: string; Icon: typeof CheckCircle2 }> = {
  valide:   { bg: '#007A33', label: 'VALIDE',          Icon: CheckCircle2 },
  expire:   { bg: '#F59E0B', label: 'EXPIRÉ',          Icon: Clock },
  revoque:  { bg: '#DC2626', label: 'RÉVOQUÉ',         Icon: XCircle },
  invalide: { bg: '#6B7280', label: 'NON AUTHENTIFIÉ', Icon: HelpCircle },
}

function formatDate(d?: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const routeApi = getRouteApi('/verify/$token')

export default function VerifyPage() {
  const { token } = routeApi.useParams()
  const { result, loading } = useVerification(token)
  useDocumentTitle('Vérification — Radio Voix de Béré')

  // Cette page ne doit jamais être indexée : elle sert à authentifier un
  // document nominatif via un token à usage privé, pas à être découverte.
  // index.html porte déjà un <meta name="robots"> global ("index, follow") —
  // en ajouter un second créerait deux balises contradictoires dont le
  // comportement combiné n'est pas garanti selon les robots d'indexation.
  // On modifie donc la balise existante en place, et on restaure sa valeur
  // d'origine au démontage (navigation SPA vers une autre page sans reload).
  useEffect(() => {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const created = !meta
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'robots'
      document.head.appendChild(meta)
    }
    const original = meta.content
    meta.content = 'noindex, nofollow'
    return () => {
      if (created) meta!.remove()
      else meta!.content = original
    }
  }, [])

  const statutKey = result?.statut ?? 'invalide'
  const { bg, label, Icon } = STATUT_STYLE[statutKey] ?? STATUT_STYLE.invalide

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--color-ivory)' }}>
      <div className="flex-1 max-w-md w-full mx-auto px-4 py-10">

        {/* En-tête */}
        <div className="text-center mb-6">
          <SafeImage
            src="/logo.png"
            alt="Radio La Voix du Développement de Béré"
            className="mx-auto mb-3 rounded-full object-cover"
            style={{ width: 80, height: 80 }}
          />
          <h1 className="font-display font-bold text-lg" style={{ color: '#007A33' }}>
            RADIO LA VOIX DU DÉVELOPPEMENT
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--color-gray-medium)', fontFamily: 'var(--font-body)' }}>
            96.7 FM · Béré · Province de la Tandjilé · Tchad
          </p>
        </div>

        <div style={{ height: 2, background: '#007A33', borderRadius: 2 }} className="mb-6" />

        {loading ? (
          <div className="flex flex-col items-center py-16">
            <div className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: '#007A33', borderTopColor: 'transparent' }} />
            <p className="text-sm text-gray-500 mt-4">Vérification en cours…</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>

            {/* Badge de statut */}
            <div className="flex flex-col items-center gap-2 py-6" style={{ background: bg }}>
              <Icon className="w-10 h-10 text-white" />
              <span className="font-bold text-white text-xl tracking-wide">{label}</span>
            </div>

            <div className="p-6 text-center">
              <p className="font-display font-bold text-sm uppercase tracking-wide mb-4" style={{ color: 'var(--color-anthracite)' }}>
                Laissez-passer presse
              </p>

              {statutKey === 'valide' && (
                <div>
                  {result?.photo_url && (
                    <SafeImage
                      src={result.photo_url}
                      alt={`${result.prenoms ?? ''} ${result.nom ?? ''}`}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                      style={{ border: '3px solid #007A33' }}
                    />
                  )}
                  <p className="font-display font-bold text-xl" style={{ color: 'var(--color-anthracite)' }}>
                    {result?.prenoms} {result?.nom}
                  </p>
                  <p className="text-sm text-gray-600 mb-5">{result?.fonction}</p>

                  <dl className="grid grid-cols-2 gap-y-3 text-left text-sm">
                    <dt className="text-gray-500">Matricule</dt>
                    <dd className="font-semibold text-gray-900">{result?.matricule}</dd>
                    <dt className="text-gray-500">Catégorie</dt>
                    <dd className="font-semibold text-gray-900">{result?.categorie}</dd>
                    <dt className="text-gray-500">Délivré le</dt>
                    <dd className="font-semibold text-gray-900">{formatDate(result?.date_delivrance)}</dd>
                    <dt className="text-gray-500">Expire le</dt>
                    <dd className="font-semibold text-gray-900">{formatDate(result?.date_expiration)}</dd>
                  </dl>
                </div>
              )}

              {statutKey === 'expire' && (
                <div>
                  <p className="font-display font-bold text-xl" style={{ color: 'var(--color-anthracite)' }}>
                    {result?.prenoms} {result?.nom}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">{result?.fonction}</p>
                  <p className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-4"
                    style={{ background: '#FEF3C7', color: '#92400E' }}>
                    Expiré le {formatDate(result?.date_expiration)}
                  </p>
                  <p className="text-sm text-gray-600">{result?.message}</p>
                </div>
              )}

              {(statutKey === 'revoque' || statutKey === 'invalide') && (
                <p className="text-sm text-gray-600">{result?.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Pied de page */}
        <div className="mt-8 text-center">
          <div style={{ height: 2, background: '#007A33', borderRadius: 2 }} className="mb-4" />
          <p className="text-xs text-gray-500">
            Document vérifié par le système officiel de Radio La Voix du Développement
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Vérification effectuée le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </main>
  )
}
