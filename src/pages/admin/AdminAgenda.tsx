import { useEffect, useState, useCallback } from 'react'
import { Check, X, Trash2, Plus } from 'lucide-react'
import { db } from '@/lib/supabase'
import { logAction } from '@/hooks/useAuditLog'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { Evenement } from '@/types/database'

const FILTRES = ['À valider', 'Validés', 'Tous'] as const

const emptyForm = {
  titre: '', description: '', organisateur: '', lieu: '', ville: 'Béré',
  date_debut: new Date().toISOString().slice(0, 10), gratuit: true,
}

export default function AdminAgenda() {
  useDocumentTitle('Agenda | Administration')
  const [items, setItems] = useState<Evenement[]>([])
  const [filtre, setFiltre] = useState<typeof FILTRES[number]>('À valider')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await db.agenda().select('*').order('date_debut', { ascending: false })
    setItems((data as Evenement[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = items.filter(e => {
    if (filtre === 'À valider') return !e.valide && !e.publie
    if (filtre === 'Validés') return e.valide && e.publie
    return true
  })

  const valider = async (e: Evenement) => {
    await db.agenda().update({ valide: true, publie: true }).eq('id', e.id)
    await logAction('valider_evenement', 'agenda', e.id, { titre: e.titre })
    load()
  }
  const rejeter = async (e: Evenement) => {
    await db.agenda().update({ valide: false, publie: false }).eq('id', e.id)
    await logAction('rejeter_evenement', 'agenda', e.id, { titre: e.titre })
    load()
  }
  const remove = async (e: Evenement) => {
    if (!confirm(`Supprimer « ${e.titre} » ?`)) return
    await db.agenda().delete().eq('id', e.id)
    await logAction('delete_evenement', 'agenda', e.id, { titre: e.titre })
    load()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data } = await db.agenda().insert({
      ...form, toute_la_journee: true, valide: true, publie: true,
    }).select('id').single()
    await logAction('create_evenement', 'agenda', data?.id, { titre: form.titre })
    setShowForm(false)
    setForm(emptyForm)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-brand-primary)' }}>Agenda</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Créer un événement</button>
      </div>

      <div className="flex gap-2 mb-4">
        {FILTRES.map(f => (
          <button key={f} onClick={() => setFiltre(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${filtre === f ? 'text-white border-transparent' : 'bg-white text-gray-700'}`}
            style={filtre === f ? { background: 'var(--color-brand-primary)' } : { borderColor: 'var(--color-border)' }}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl divide-y" style={{ border: '1px solid var(--color-border)' }}>
        {loading ? (
          <p className="p-6 text-sm text-gray-400">Chargement…</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">Aucun événement.</p>
        ) : filtered.map(e => (
          <div key={e.id} className="p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{e.titre}</p>
              <p className="text-xs text-gray-500">
                {new Date(e.date_debut).toLocaleDateString('fr-FR')} · {e.organisateur || 'Organisateur non précisé'} · {e.lieu || e.ville}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!(e.valide && e.publie) && (
                <button onClick={() => valider(e)} title="Valider" className="p-1.5 rounded hover:bg-green-50 text-green-600"><Check className="w-4 h-4" /></button>
              )}
              {(e.valide || e.publie) && (
                <button onClick={() => rejeter(e)} title="Rejeter" className="p-1.5 rounded hover:bg-orange-50 text-orange-600"><X className="w-4 h-4" /></button>
              )}
              <button onClick={() => remove(e)} title="Supprimer" className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold" style={{ color: 'var(--color-brand-primary)' }}>Créer un événement</h3>
              <button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <input required placeholder="Titre" value={form.titre} onChange={ev => setForm(f => ({ ...f, titre: ev.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
            <textarea placeholder="Description" rows={2} value={form.description} onChange={ev => setForm(f => ({ ...f, description: ev.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm resize-none" style={{ borderColor: 'var(--color-border)' }} />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Organisateur" value={form.organisateur} onChange={ev => setForm(f => ({ ...f, organisateur: ev.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
              <input placeholder="Lieu" value={form.lieu} onChange={ev => setForm(f => ({ ...f, lieu: ev.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
            </div>
            <input required type="date" value={form.date_debut} onChange={ev => setForm(f => ({ ...f, date_debut: ev.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
            <button type="submit" className="btn-primary w-full justify-center">Créer</button>
          </form>
        </div>
      )}
    </div>
  )
}
