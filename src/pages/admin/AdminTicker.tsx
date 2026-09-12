import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Pencil, X, Power } from 'lucide-react'
import { db } from '@/lib/supabase'
import { logAction } from '@/hooks/useAuditLog'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { TickerMsg } from '@/types/database'

const emptyForm = { texte: '', lien_url: '', priorite: '0' }

export default function AdminTicker() {
  useDocumentTitle('Ticker | Administration')
  const [items, setItems] = useState<TickerMsg[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<TickerMsg | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await db.ticker().select('*').order('priorite', { ascending: false })
    setItems((data as TickerMsg[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowForm(true) }
  const openEdit = (t: TickerMsg) => {
    setEditing(t)
    setForm({ texte: t.texte, lien_url: t.lien_url || '', priorite: String(t.priorite) })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { texte: form.texte, lien_url: form.lien_url || null, priorite: Number(form.priorite) }
    if (editing) {
      await db.ticker().update(payload).eq('id', editing.id)
      await logAction('update_ticker', 'ticker_messages', editing.id)
    } else {
      const { data } = await db.ticker().insert({ ...payload, actif: true, date_debut: new Date().toISOString() }).select('id').single()
      await logAction('create_ticker', 'ticker_messages', data?.id)
    }
    setShowForm(false)
    load()
  }

  const toggleActif = async (t: TickerMsg) => {
    await db.ticker().update({ actif: !t.actif }).eq('id', t.id)
    await logAction(t.actif ? 'desactiver_ticker' : 'activer_ticker', 'ticker_messages', t.id)
    load()
  }

  const remove = async (t: TickerMsg) => {
    if (!confirm('Supprimer ce message ?')) return
    await db.ticker().delete().eq('id', t.id)
    await logAction('delete_ticker', 'ticker_messages', t.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-brand-primary)' }}>Fil d'info (ticker)</h1>
        <button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Ajouter un message</button>
      </div>

      <div className="bg-white rounded-2xl divide-y" style={{ border: '1px solid var(--color-border)' }}>
        {loading ? <p className="p-6 text-sm text-gray-400">Chargement…</p> : items.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">Aucun message.</p>
        ) : items.map(t => (
          <div key={t.id} className="p-4 flex items-center justify-between gap-4">
            <div className="min-w-0 flex items-center gap-3">
              <span className="text-xs font-mono text-gray-400 flex-shrink-0">#{t.priorite}</span>
              <p className={`truncate text-sm ${t.actif ? 'text-gray-900' : 'text-gray-400 line-through'}`}>{t.texte}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => toggleActif(t)} title={t.actif ? 'Désactiver' : 'Activer'}
                className="p-1.5 rounded hover:bg-gray-100" style={{ color: t.actif ? '#007A33' : '#9CA3AF' }}>
                <Power className="w-4 h-4" />
              </button>
              <button onClick={() => openEdit(t)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => remove(t)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold" style={{ color: 'var(--color-brand-primary)' }}>{editing ? 'Modifier' : 'Nouveau message'}</h3>
              <button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <textarea required rows={2} placeholder="Texte du message" value={form.texte} onChange={e => setForm(f => ({ ...f, texte: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm resize-none" style={{ borderColor: 'var(--color-border)' }} />
            <input placeholder="Lien (optionnel)" value={form.lien_url} onChange={e => setForm(f => ({ ...f, lien_url: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Priorité (plus haut = affiché en premier)</label>
              <input type="number" value={form.priorite} onChange={e => setForm(f => ({ ...f, priorite: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
            </div>
            <button type="submit" className="btn-primary w-full justify-center">{editing ? 'Enregistrer' : 'Ajouter'}</button>
          </form>
        </div>
      )}
    </div>
  )
}
