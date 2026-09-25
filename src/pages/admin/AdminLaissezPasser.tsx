import { useState, useEffect, useCallback } from 'react'
import { Copy, Download, ExternalLink, Pencil, Ban, Upload, X, Check, History } from 'lucide-react'
import { db, supabase } from '@/lib/supabase'
import { logAction } from '@/hooks/useAuditLog'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { genererQRCode, telechargerQRCode } from '@/utils/qrcode'
import SafeImage from '@/components/shared/SafeImage'
import type { LaissezPasser, VerificationLP } from '@/types/database'

const CATEGORIES = ['Journaliste', 'Correspondant', 'Technicien', 'Personnel de direction', 'Stagiaire']
const FILTRES = ['Tous', 'Valides', 'Expirés', 'Révoqués'] as const

const emptyForm = {
  nom: '', prenoms: '', photo_url: '', fonction: '', matricule: '',
  categorie: 'Journaliste', telephone_professionnel: '',
  date_delivrance: new Date().toISOString().slice(0, 10),
  date_expiration: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
}

function statutBadge(statut: string) {
  const map: Record<string, { bg: string; label: string }> = {
    valide:  { bg: '#E8F5EE', label: 'Valide' },
    expire:  { bg: '#FEF3C7', label: 'Expiré' },
    revoque: { bg: '#FEE2E2', label: 'Révoqué' },
  }
  const s = map[statut] ?? map.valide
  const color = statut === 'valide' ? '#007A33' : statut === 'expire' ? '#92400E' : '#991B1B'
  return <span className="badge text-xs" style={{ background: s.bg, color }}>{s.label}</span>
}

function formatDate(d?: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function formatDateTime(d?: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleString('fr-FR')
}

export default function AdminLaissezPasser() {
  useDocumentTitle('Laissez-passer | Administration')

  const [items, setItems] = useState<LaissezPasser[]>([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState<typeof FILTRES[number]>('Tous')
  const [form, setForm] = useState(emptyForm)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [creating, setCreating] = useState(false)
  const [createdQr, setCreatedQr] = useState<{ token: string; nom: string; qr: string } | null>(null)
  const [revoking, setRevoking] = useState<LaissezPasser | null>(null)
  const [motif, setMotif] = useState('')
  const [historique, setHistorique] = useState<{ lp: LaissezPasser; entries: VerificationLP[] } | null>(null)

  // Modification d'un laissez-passer existant — modal séparé du formulaire
  // de création. Matricule, token de vérification et statut n'y sont
  // jamais modifiables (voir handleUpdate).
  const [editingLP, setEditingLP] = useState<LaissezPasser | null>(null)
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null)
  const [updating, setUpdating] = useState(false)

  const fetchLP = useCallback(async () => {
    setLoading(true)
    const { data } = await db.laissezPasser().select('*').order('date_expiration', { ascending: true })
    setItems((data as LaissezPasser[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchLP() }, [fetchLP])

  const filtered = items.filter(i => {
    if (filtre === 'Valides') return i.statut === 'valide'
    if (filtre === 'Expirés') return i.statut === 'expire'
    if (filtre === 'Révoqués') return i.statut === 'revoque'
    return true
  })

  const counts = {
    actifs: items.filter(i => i.statut === 'valide').length,
    expires: items.filter(i => i.statut === 'expire').length,
    revoques: items.filter(i => i.statut === 'revoque').length,
  }

  const currentYear = new Date().getFullYear()
  const nextMatricule = `RVD-${currentYear}-${String(items.length + 1).padStart(3, '0')}`

  // Nom de fichier = ID du laissez-passer (jamais le nom d'origine ou un
  // timestamp) : sans ça, deux photos uploadées à la même seconde — ou
  // simplement le hasard de Date.now() — s'écrasent l'une l'autre dans le
  // bucket. L'ID étant unique et stable par titulaire, upsert:true remplace
  // proprement l'ancienne photo du même titulaire sans jamais toucher celle
  // d'un autre.
  const uploadPhoto = async (
    file: File,
    lpId: string
  ): Promise<string | null> => {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${lpId}.${ext}`

    const { data, error } = await supabase.storage
      .from('lp-photos')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      })

    if (error) {
      console.error('Upload photo error:', error)
      return null
    }

    const { data: urlData } = supabase.storage
      .from('lp-photos')
      .getPublicUrl(data.path)

    return urlData.publicUrl
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    // La ligne doit exister avant l'upload : le nom du fichier est l'ID du
    // laissez-passer, généré par la base à l'insertion.
    const { data, error } = await db.laissezPasser().insert({
      ...form,
      matricule: form.matricule || nextMatricule,
      photo_url: null,
    }).select('id, verification_token, nom, prenoms').single()

    if (error || !data) { setCreating(false); return }

    if (photoFile) {
      const photoUrl = await uploadPhoto(photoFile, data.id)
      if (photoUrl) {
        await supabase.from('laissez_passer').update({ photo_url: photoUrl }).eq('id', data.id)
      }
    }

    setCreating(false)
    await logAction('create_laissez_passer', 'laissez_passer', data.id, { nom: form.nom, prenoms: form.prenoms })
    const qr = await genererQRCode(data.verification_token)
    setCreatedQr({ token: data.verification_token, nom: `${data.prenoms} ${data.nom}`, qr })
    setForm(emptyForm)
    setPhotoFile(null)
    fetchLP()
  }

  const handleRevoke = async () => {
    if (!revoking) return
    await db.laissezPasser().update({
      statut: 'revoque', date_revocation: new Date().toISOString(), motif_revocation: motif,
    }).eq('id', revoking.id)
    await logAction('revoke_laissez_passer', 'laissez_passer', revoking.id, { motif })
    setRevoking(null)
    setMotif('')
    fetchLP()
  }

  const rehabiliter = async (id: string) => {
    const confirme = window.confirm(
      'Réhabiliter ce laissez-passer ? Il redeviendra valide.'
    )
    if (!confirme) return

    const { error } = await supabase
      .from('laissez_passer')
      .update({
        statut: 'valide',
        date_revocation: null,
        motif_revocation: null,
      })
      .eq('id', id)

    if (!error) {
      await logAction('rehabiliter_laissez_passer', 'laissez_passer', id)
      fetchLP()
    }
  }

  const supprimer = async (id: string, nom: string) => {
    const confirme1 = window.confirm(
      `Supprimer définitivement le laissez-passer de ${nom} ?`
    )
    if (!confirme1) return

    const confirme2 = window.confirm(
      'Cette action est irréversible. Confirmer la suppression ?'
    )
    if (!confirme2) return

    const { error } = await supabase
      .from('laissez_passer')
      .delete()
      .eq('id', id)

    if (!error) {
      await logAction('supprimer_laissez_passer', 'laissez_passer', id, { nom })
      fetchLP()
    }
  }

  const copyUrl = (token: string) => {
    navigator.clipboard.writeText(`https://rvd967-bere.com/verify/${token}`)
  }

  const openHistorique = async (lp: LaissezPasser) => {
    const { data } = await db.verificationsLP().select('*').eq('lp_id', lp.id).order('verifie_le', { ascending: false }).limit(20)
    setHistorique({ lp, entries: (data as VerificationLP[]) ?? [] })
  }

  const handleUpdate = async () => {
    if (!editingLP) return
    setUpdating(true)

    // Ne réuploader que si l'admin a choisi un nouveau fichier — sinon on
    // garde la photo_url existante telle quelle.
    let photo_url = editingLP.photo_url
    if (editPhotoFile) {
      const uploaded = await uploadPhoto(editPhotoFile, editingLP.id)
      if (uploaded) photo_url = uploaded
    }

    const { error } = await supabase
      .from('laissez_passer')
      .update({
        nom: editingLP.nom,
        prenoms: editingLP.prenoms,
        fonction: editingLP.fonction,
        categorie: editingLP.categorie,
        telephone_professionnel: editingLP.telephone_professionnel,
        date_delivrance: editingLP.date_delivrance,
        date_expiration: editingLP.date_expiration,
        observations: editingLP.observations,
        photo_url,
      })
      .eq('id', editingLP.id)

    setUpdating(false)
    if (!error) {
      await logAction('update_laissez_passer', 'laissez_passer', editingLP.id, { matricule: editingLP.matricule })
      setEditingLP(null)
      setEditPhotoFile(null)
      fetchLP()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-brand-primary)' }}>Laissez-passer presse</h1>
          <p className="text-sm text-gray-500">Gestion des accréditations</p>
        </div>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 text-center" style={{ border: '1px solid var(--color-border)' }}>
          <div className="text-2xl font-bold" style={{ color: '#007A33' }}>{counts.actifs}</div>
          <div className="text-xs text-gray-500">✅ Actifs</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center" style={{ border: '1px solid var(--color-border)' }}>
          <div className="text-2xl font-bold" style={{ color: '#92400E' }}>{counts.expires}</div>
          <div className="text-xs text-gray-500">⚠️ Expirés</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center" style={{ border: '1px solid var(--color-border)' }}>
          <div className="text-2xl font-bold" style={{ color: '#991B1B' }}>{counts.revoques}</div>
          <div className="text-xs text-gray-500">❌ Révoqués</div>
        </div>
      </div>

      {/* Créer un laissez-passer */}
      <div className="bg-white rounded-2xl p-6 mb-8" style={{ border: '1px solid var(--color-border)' }}>
        <h2 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--color-brand-primary)' }}>
          Créer un laissez-passer
        </h2>
        <form onSubmit={handleCreate} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nom *</label>
            <input required value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Prénoms *</label>
            <input required value={form.prenoms} onChange={e => setForm(f => ({ ...f, prenoms: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Photo</label>
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer text-gray-500"
              style={{ borderColor: 'var(--color-border)' }}>
              <Upload className="w-4 h-4" />
              {photoFile ? photoFile.name : 'Choisir un fichier'}
              <input type="file" accept="image/*" className="hidden"
                onChange={e => setPhotoFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Fonction *</label>
            <input required value={form.fonction} onChange={e => setForm(f => ({ ...f, fonction: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Matricule *</label>
            <input required value={form.matricule} onChange={e => setForm(f => ({ ...f, matricule: e.target.value }))}
              placeholder={nextMatricule}
              className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Catégorie</label>
            <select value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Téléphone professionnel</label>
            <input value={form.telephone_professionnel} onChange={e => setForm(f => ({ ...f, telephone_professionnel: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Date de délivrance *</label>
            <input required type="date" value={form.date_delivrance} onChange={e => setForm(f => ({ ...f, date_delivrance: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Date d'expiration *</label>
            <input required type="date" value={form.date_expiration} onChange={e => setForm(f => ({ ...f, date_expiration: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" disabled={creating} className="btn-primary flex-1 justify-center disabled:opacity-60">
              {creating ? 'Création…' : 'Créer le laissez-passer'}
            </button>
          </div>
        </form>
      </div>

      {createdQr && (
        <div className="bg-white rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-6" style={{ border: '2px solid #007A33' }}>
          <img src={createdQr.qr} alt="QR code du laissez-passer" className="w-40 h-40" />
          <div className="flex-1 text-center sm:text-left">
            <p className="font-bold" style={{ color: '#007A33' }}>LAISSEZ-PASSER CRÉÉ — {createdQr.nom}</p>
            <p className="text-xs text-gray-500 mb-1">Statut : Valide</p>
            <p className="text-xs text-gray-500 break-all mb-3">rvd967-bere.com/verify/{createdQr.token}</p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <button onClick={() => telechargerQRCode(createdQr.token, createdQr.nom)}
                className="btn-accent text-xs px-3 py-2"><Download className="w-3.5 h-3.5" /> Télécharger le QR</button>
              <a href={`/verify/${createdQr.token}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs px-3 py-2 rounded-full border" style={{ borderColor: 'var(--color-border)' }}>
                <ExternalLink className="w-3.5 h-3.5" /> Voir la vérification
              </a>
              <button onClick={() => setCreatedQr(null)} className="text-xs px-3 py-2 text-gray-400">Fermer</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {FILTRES.map(f => (
          <button key={f} onClick={() => setFiltre(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${filtre === f ? 'text-white border-transparent' : 'bg-white text-gray-700'}`}
            style={filtre === f ? { background: 'var(--color-brand-primary)' } : { borderColor: 'var(--color-border)' }}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase" style={{ background: 'var(--color-surface-alt)' }}>
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3">Nom complet</th>
                <th className="px-4 py-3">Fonction</th>
                <th className="px-4 py-3">Matricule</th>
                <th className="px-4 py-3">Expiration</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Vérifications</th>
                <th className="px-4 py-3">Dernière vérification</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Chargement…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Aucun laissez-passer.</td></tr>
              ) : filtered.map(lp => (
                <tr key={lp.id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <td className="px-4 py-3"><SafeImage src={lp.photo_url || ''} alt={lp.nom} className="w-9 h-9 rounded-full object-cover" /></td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{lp.prenoms} {lp.nom}</td>
                  <td className="px-4 py-3 text-gray-600">{lp.fonction}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{lp.matricule}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(lp.date_expiration)}</td>
                  <td className="px-4 py-3">{statutBadge(lp.statut)}</td>
                  <td className="px-4 py-3 text-gray-500">{lp.verifications_count}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDateTime(lp.derniere_verification)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a href={`/verify/${lp.verification_token}`} target="_blank" rel="noopener noreferrer"
                        title="Voir la vérification" className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><ExternalLink className="w-4 h-4" /></a>
                      <button title="Copier l'URL" onClick={() => copyUrl(lp.verification_token)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Copy className="w-4 h-4" /></button>
                      <button title="Télécharger le QR" onClick={() => telechargerQRCode(lp.verification_token, `${lp.prenoms} ${lp.nom}`)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Download className="w-4 h-4" /></button>
                      <button title="Historique" onClick={() => openHistorique(lp)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><History className="w-4 h-4" /></button>
                      <button
                        onClick={() => { setEditingLP(lp); setEditPhotoFile(null) }}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: '#E8F5EE', color: '#007A33' }}
                        title="Modifier ce laissez-passer">
                        <Pencil className="w-3.5 h-3.5" /> Modifier
                      </button>
                      {lp.statut !== 'revoque' && (
                        <button title="Révoquer" onClick={() => setRevoking(lp)}
                          className="p-1.5 rounded hover:bg-red-50 text-red-600"><Ban className="w-4 h-4" /></button>
                      )}
                      {lp.statut === 'revoque' && (
                        <button
                          onClick={() => rehabiliter(lp.id)}
                          style={{
                            padding: '4px 12px', borderRadius: 6,
                            border: '1px solid #007A33',
                            background: '#E8F5EE', color: '#007A33',
                            fontWeight: 600, fontSize: 13, cursor: 'pointer',
                          }}
                        >
                          Réhabiliter
                        </button>
                      )}
                      <button
                        onClick={() => supprimer(lp.id, lp.nom + ' ' + lp.prenoms)}
                        style={{
                          padding: '4px 12px', borderRadius: 6,
                          border: '1px solid #CC0000',
                          background: '#FFF0F0', color: '#CC0000',
                          fontWeight: 600, fontSize: 13, cursor: 'pointer',
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de révocation */}
      {revoking && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setRevoking(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold" style={{ color: '#DC2626' }}>Révoquer le laissez-passer</h3>
              <button onClick={() => setRevoking(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-700 mb-3"><strong>{revoking.prenoms} {revoking.nom}</strong> — {revoking.fonction}</p>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Motif de révocation</label>
            <textarea value={motif} onChange={e => setMotif(e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-lg border text-sm mb-4" style={{ borderColor: 'var(--color-border)' }} />
            <div className="flex gap-2">
              <button onClick={handleRevoke} className="flex-1 py-2.5 rounded-full font-bold text-white text-sm" style={{ background: '#DC2626' }}>
                <Check className="w-4 h-4 inline mr-1" /> Confirmer la révocation
              </button>
              <button onClick={() => setRevoking(null)} className="px-4 py-2.5 rounded-full border text-sm" style={{ borderColor: 'var(--color-border)' }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {editingLP && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditingLP(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold" style={{ color: 'var(--color-brand-primary)' }}>
                Modifier le laissez-passer
              </h3>
              <button onClick={() => setEditingLP(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nom *</label>
                <input required value={editingLP.nom} onChange={e => setEditingLP({ ...editingLP, nom: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Prénoms *</label>
                <input required value={editingLP.prenoms} onChange={e => setEditingLP({ ...editingLP, prenoms: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Fonction *</label>
                <input required value={editingLP.fonction} onChange={e => setEditingLP({ ...editingLP, fonction: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Catégorie</label>
                <select value={editingLP.categorie} onChange={e => setEditingLP({ ...editingLP, categorie: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Téléphone professionnel</label>
                <input value={editingLP.telephone_professionnel || ''}
                  onChange={e => setEditingLP({ ...editingLP, telephone_professionnel: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Matricule <span className="text-gray-400 normal-case">(non modifiable)</span>
                </label>
                <input disabled value={editingLP.matricule}
                  className="w-full px-3 py-2 rounded-lg border text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                  style={{ borderColor: 'var(--color-border)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Date de délivrance *</label>
                <input required type="date" value={editingLP.date_delivrance}
                  onChange={e => setEditingLP({ ...editingLP, date_delivrance: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Date d'expiration *</label>
                <input required type="date" value={editingLP.date_expiration}
                  onChange={e => setEditingLP({ ...editingLP, date_expiration: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Observations</label>
              <textarea rows={2} value={editingLP.observations || ''}
                onChange={e => setEditingLP({ ...editingLP, observations: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm resize-none" style={{ borderColor: 'var(--color-border)' }} />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Photo</label>
              <div className="flex items-center gap-3">
                <SafeImage src={editingLP.photo_url || ''} alt={editingLP.nom} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer text-gray-500"
                  style={{ borderColor: 'var(--color-border)' }}>
                  <Upload className="w-4 h-4" />
                  {editPhotoFile ? editPhotoFile.name : 'Changer la photo'}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => setEditPhotoFile(e.target.files?.[0] ?? null)} />
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={handleUpdate} disabled={updating}
                className="btn-primary flex-1 justify-center disabled:opacity-60">
                {updating ? 'Enregistrement…' : 'Enregistrer les modifications'}
              </button>
              <button onClick={() => setEditingLP(null)} className="px-4 py-2.5 rounded-full border text-sm" style={{ borderColor: 'var(--color-border)' }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historique / Audit */}
      {historique && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setHistorique(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold" style={{ color: 'var(--color-brand-primary)' }}>
                Historique — {historique.lp.prenoms} {historique.lp.nom}
              </h3>
              <button onClick={() => setHistorique(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {historique.entries.length === 0 ? (
              <p className="text-sm text-gray-400">Aucune vérification enregistrée.</p>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {historique.entries.map(e => (
                  <div key={e.id} className="py-2 flex items-center justify-between text-sm">
                    <span className="text-gray-500">{formatDateTime(e.verifie_le)}</span>
                    {statutBadge(e.resultat)}
                    <span className="text-xs text-gray-400 font-mono">{e.ip_partielle || '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
