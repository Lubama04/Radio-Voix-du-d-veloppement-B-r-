import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Copy, Download, ExternalLink, Pencil, Ban, LogOut, Upload, X, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { db, supabase } from '@/lib/supabase'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { genererQRCode, telechargerQRCode } from '@/utils/qrcode'
import SafeImage from '@/components/shared/SafeImage'
import type { LaissezPasser } from '@/types/database'

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

export default function LaissezPasserAdminPage() {
  useDocumentTitle('Laissez-passer presse — Administration | Radio Voix de Béré')
  const { session, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()

  const [items, setItems] = useState<LaissezPasser[]>([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState<typeof FILTRES[number]>('Tous')
  const [form, setForm] = useState(emptyForm)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [creating, setCreating] = useState(false)
  const [createdQr, setCreatedQr] = useState<{ token: string; nom: string; qr: string } | null>(null)
  const [revoking, setRevoking] = useState<LaissezPasser | null>(null)
  const [motif, setMotif] = useState('')
  const [editing, setEditing] = useState<LaissezPasser | null>(null)

  useEffect(() => {
    if (!authLoading && !session) navigate({ to: '/admin/login' })
  }, [authLoading, session, navigate])

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await db.laissezPasser().select('*').order('date_expiration', { ascending: true })
    setItems((data as LaissezPasser[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { if (session) load() }, [session, load])

  if (authLoading || !session) return null

  const filtered = items.filter(i => {
    if (filtre === 'Valides') return i.statut === 'valide'
    if (filtre === 'Expirés') return i.statut === 'expire'
    if (filtre === 'Révoqués') return i.statut === 'revoque'
    return true
  })

  const nextMatricule = `RVD-2026-${String(items.length + 1).padStart(3, '0')}`

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return form.photo_url || null
    const path = `${Date.now()}-${photoFile.name.replace(/\s+/g, '-')}`
    const { error } = await supabase.storage.from('lp-photos').upload(path, photoFile, { upsert: true })
    if (error) return null
    const { data } = supabase.storage.from('lp-photos').getPublicUrl(path)
    return data.publicUrl
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    const photo_url = await uploadPhoto()
    const { data, error } = await db.laissezPasser().insert({
      ...form,
      matricule: form.matricule || nextMatricule,
      photo_url,
    }).select('verification_token, nom, prenoms').single()
    setCreating(false)
    if (error || !data) return
    const qr = await genererQRCode(data.verification_token)
    setCreatedQr({ token: data.verification_token, nom: `${data.prenoms} ${data.nom}`, qr })
    setForm(emptyForm)
    setPhotoFile(null)
    load()
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    const photo_url = await uploadPhoto()
    await db.laissezPasser().update({
      nom: form.nom, prenoms: form.prenoms, fonction: form.fonction,
      matricule: form.matricule, categorie: form.categorie,
      telephone_professionnel: form.telephone_professionnel || null,
      date_delivrance: form.date_delivrance, date_expiration: form.date_expiration,
      photo_url: photo_url ?? editing.photo_url,
    }).eq('id', editing.id)
    setEditing(null)
    setForm(emptyForm)
    setPhotoFile(null)
    load()
  }

  const handleRevoke = async () => {
    if (!revoking) return
    await db.laissezPasser().update({
      statut: 'revoque', date_revocation: new Date().toISOString(), motif_revocation: motif,
    }).eq('id', revoking.id)
    setRevoking(null)
    setMotif('')
    load()
  }

  const copyUrl = (token: string) => {
    navigator.clipboard.writeText(`https://rvd967-bere.com/verify/${token}`)
  }

  const startEdit = (lp: LaissezPasser) => {
    setEditing(lp)
    setForm({
      nom: lp.nom, prenoms: lp.prenoms, photo_url: lp.photo_url || '', fonction: lp.fonction,
      matricule: lp.matricule, categorie: lp.categorie, telephone_professionnel: lp.telephone_professionnel || '',
      date_delivrance: lp.date_delivrance, date_expiration: lp.date_expiration,
    })
  }

  return (
    <main className="pt-16 min-h-screen" style={{ background: 'var(--color-ivory)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-brand-primary)' }}>
              Laissez-passer presse
            </h1>
            <p className="text-sm text-gray-500">Gestion des accréditations — Radio Voix de Béré</p>
          </div>
          <button onClick={() => signOut().then(() => navigate({ to: '/admin/login' }))}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>

        {/* ── B. Créer un laissez-passer ── */}
        <div className="bg-white rounded-2xl p-6 mb-8" style={{ border: '1px solid var(--color-border)' }}>
          <h2 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--color-brand-primary)' }}>
            {editing ? 'Modifier le laissez-passer' : 'Créer un laissez-passer'}
          </h2>
          <form onSubmit={editing ? handleUpdate : handleCreate} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                {creating ? 'Création…' : editing ? 'Enregistrer' : 'Créer le laissez-passer'}
              </button>
              {editing && (
                <button type="button" onClick={() => { setEditing(null); setForm(emptyForm); setPhotoFile(null) }}
                  className="px-4 py-2.5 rounded-full border text-sm" style={{ borderColor: 'var(--color-border)' }}>
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        {/* QR généré après création */}
        {createdQr && (
          <div className="bg-white rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-6"
            style={{ border: '2px solid #007A33' }}>
            <img src={createdQr.qr} alt="QR code du laissez-passer" className="w-40 h-40" />
            <div className="flex-1 text-center sm:text-left">
              <p className="font-bold" style={{ color: '#007A33' }}>LAISSEZ-PASSER CRÉÉ — {createdQr.nom}</p>
              <p className="text-xs text-gray-500 mb-1">Statut : Valide</p>
              <p className="text-xs text-gray-500 break-all mb-3">
                rvd967-bere.com/verify/{createdQr.token}
              </p>
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

        {/* ── A. Tableau de gestion ── */}
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
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Chargement…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Aucun laissez-passer.</td></tr>
                ) : filtered.map(lp => (
                  <tr key={lp.id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <td className="px-4 py-3">
                      <SafeImage src={lp.photo_url || ''} alt={lp.nom} className="w-9 h-9 rounded-full object-cover" />
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{lp.prenoms} {lp.nom}</td>
                    <td className="px-4 py-3 text-gray-600">{lp.fonction}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{lp.matricule}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(lp.date_expiration)}</td>
                    <td className="px-4 py-3">{statutBadge(lp.statut)}</td>
                    <td className="px-4 py-3 text-gray-500">{lp.verifications_count}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a href={`/verify/${lp.verification_token}`} target="_blank" rel="noopener noreferrer"
                          title="Voir la vérification" className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button title="Copier l'URL" onClick={() => copyUrl(lp.verification_token)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Copy className="w-4 h-4" /></button>
                        <button title="Télécharger le QR" onClick={() => telechargerQRCode(lp.verification_token, `${lp.prenoms} ${lp.nom}`)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Download className="w-4 h-4" /></button>
                        <button title="Modifier" onClick={() => startEdit(lp)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil className="w-4 h-4" /></button>
                        {lp.statut !== 'revoque' && (
                          <button title="Révoquer" onClick={() => setRevoking(lp)}
                            className="p-1.5 rounded hover:bg-red-50 text-red-600"><Ban className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de révocation */}
      {revoking && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setRevoking(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold" style={{ color: '#DC2626' }}>Révoquer le laissez-passer</h3>
              <button onClick={() => setRevoking(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              <strong>{revoking.prenoms} {revoking.nom}</strong> — {revoking.fonction}
            </p>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Motif de révocation</label>
            <textarea value={motif} onChange={e => setMotif(e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-lg border text-sm mb-4" style={{ borderColor: 'var(--color-border)' }} />
            <div className="flex gap-2">
              <button onClick={handleRevoke} className="flex-1 py-2.5 rounded-full font-bold text-white text-sm"
                style={{ background: '#DC2626' }}>
                <Check className="w-4 h-4 inline mr-1" /> Confirmer la révocation
              </button>
              <button onClick={() => setRevoking(null)} className="px-4 py-2.5 rounded-full border text-sm"
                style={{ borderColor: 'var(--color-border)' }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function formatDate(d?: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
