import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Save, Megaphone, AlertTriangle } from 'lucide-react'
import { db } from '@/lib/supabase'
import { logAction } from '@/hooks/useAuditLog'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { BroadcastConfig } from '@/types/database'

const CONFIG_KEYS = [
  'nom_radio', 'slogan', 'description', 'frequence',
  'telephone', 'telephone2', 'email', 'ville', 'facebook',
  'stream_primary', 'stream_backup',
]

const STATUTS = [
  { value: 'auto', label: 'Automatique (17h–21h)' },
  { value: 'on_air', label: 'En direct forcé' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'off', label: 'Hors diffusion' },
]

export default function AdminConfiguration() {
  useDocumentTitle('Configuration | Administration')
  const [values, setValues] = useState<Record<string, string>>({})
  const [broadcast, setBroadcast] = useState<Partial<BroadcastConfig>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([
      db.config().select('cle, valeur'),
      db.broadcastConfig().select('*').single(),
    ]).then(([{ data: cfg }, { data: bc }]) => {
      const map: Record<string, string> = {}
      for (const row of (cfg as { cle: string; valeur: string | null }[]) ?? []) map[row.cle] = row.valeur ?? ''
      setValues(map)
      setBroadcast((bc as BroadcastConfig) ?? {})
      setLoading(false)
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    // Un UPDATE par ligne modifiée dans config_radio
    for (const key of CONFIG_KEYS) {
      if (values[key] !== undefined) {
        await db.config().update({ valeur: values[key] }).eq('cle', key)
      }
    }
    if (broadcast.id) {
      await db.broadcastConfig().update({
        heure_debut: broadcast.heure_debut, heure_fin: broadcast.heure_fin,
        statut: broadcast.statut, message_maint: broadcast.message_maint,
      }).eq('id', broadcast.id)
    }
    await logAction('update_config', 'config_radio', undefined, { keys: CONFIG_KEYS })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return <p className="text-gray-400 text-sm">Chargement…</p>

  const field = (key: string, label: string, type = 'text') => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input type={type} value={values[key] ?? ''} onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
        className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
    </div>
  )

  return (
    <div className="max-w-3xl">
      <h1 className="font-display font-bold text-2xl mb-6" style={{ color: 'var(--color-brand-primary)' }}>Configuration</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--color-border)' }}>
          <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4" style={{ color: 'var(--color-brand-primary)' }}>Identité de la radio</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {field('nom_radio', 'Nom de la radio')}
            {field('slogan', 'Slogan')}
            {field('frequence', 'Fréquence')}
            {field('description', 'Description')}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--color-border)' }}>
          <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4" style={{ color: 'var(--color-brand-primary)' }}>Contact</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {field('telephone', 'Téléphone 1')}
            {field('telephone2', 'Téléphone 2')}
            {field('email', 'Email', 'email')}
            {field('ville', 'Adresse / Ville')}
            {field('facebook', 'Facebook (URL)')}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--color-border)' }}>
          <h2 className="font-display font-bold text-sm uppercase tracking-wide mb-4" style={{ color: 'var(--color-brand-primary)' }}>Diffusion</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Heure début (Tchad)</label>
              <input type="number" min={0} max={23} value={broadcast.heure_debut ?? ''}
                onChange={e => setBroadcast(b => ({ ...b, heure_debut: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Heure fin (Tchad)</label>
              <input type="number" min={0} max={23} value={broadcast.heure_fin ?? ''}
                onChange={e => setBroadcast(b => ({ ...b, heure_fin: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Statut</label>
              <select value={broadcast.statut ?? 'auto'} onChange={e => setBroadcast(b => ({ ...b, statut: e.target.value as BroadcastConfig['statut'] }))}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }}>
                {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Message maintenance</label>
              <textarea rows={2} value={broadcast.message_maint ?? ''} onChange={e => setBroadcast(b => ({ ...b, message_maint: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm resize-none" style={{ borderColor: 'var(--color-border)' }} />
            </div>
            {field('stream_primary', 'URL stream principal')}
            {field('stream_backup', 'URL stream backup')}
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl text-xs" style={{ background: '#FEF3C7', color: '#92400E' }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            Ces deux URLs sont enregistrées ici pour référence, mais le lecteur utilise en réalité les variables
            d'environnement <code>VITE_STREAM_PRIMARY</code> / <code>VITE_STREAM_BACKUP</code> définies au moment du build
            (Vercel). Les modifier ici ne change pas le flux en direct tant qu'elles ne sont pas aussi mises à jour côté Vercel
            et le site redéployé.
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 flex items-center justify-between" style={{ border: '1px solid var(--color-border)' }}>
          <div>
            <h2 className="font-display font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-brand-primary)' }}>Fil d'info</h2>
            <p className="text-xs text-gray-500 mt-1">Gérer les messages du ticker défilant</p>
          </div>
          <Link to="/admin/ticker" className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border" style={{ borderColor: 'var(--color-border)' }}>
            <Megaphone className="w-4 h-4" /> Ouvrir
          </Link>
        </section>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            <Save className="w-4 h-4" /> {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          {saved && <span className="text-sm" style={{ color: '#007A33' }}>Configuration enregistrée.</span>}
        </div>
      </form>
    </div>
  )
}
