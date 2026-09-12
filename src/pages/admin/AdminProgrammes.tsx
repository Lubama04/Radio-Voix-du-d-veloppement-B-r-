import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { db } from '@/lib/supabase'
import { logAction } from '@/hooks/useAuditLog'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { ProgrammeView, CategorieEmission } from '@/types/database'

const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const LANGUES = ['français', 'arabe', 'local']

const emptyForm = {
  jour_semaine: '1', heure_debut: '08:00', heure_fin: '09:00',
  titre: '', animateur: '', categorie_id: '', langue: 'français', actif: true,
}

export default function AdminProgrammes() {
  useDocumentTitle('Programmes | Administration')
  const [items, setItems] = useState<ProgrammeView[]>([])
  const [categories, setCategories] = useState<CategorieEmission[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ProgrammeView | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: progs }, { data: cats }] = await Promise.all([
      db.vProgrammes().select('*').order('heure_debut'),
      db.categoriesEmission().select('*').order('ordre'),
    ])
    setItems((progs as ProgrammeView[]) ?? [])
    setCategories((cats as CategorieEmission[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openNew = (jour?: number) => {
    setEditing(null)
    setForm({ ...emptyForm, jour_semaine: String(jour ?? 1) })
    setShowForm(true)
  }
  const openEdit = (p: ProgrammeView) => {
    setEditing(p)
    setForm({
      jour_semaine: String(p.jour_semaine), heure_debut: p.heure_debut.slice(0, 5), heure_fin: p.heure_fin.slice(0, 5),
      titre: p.titre, animateur: p.animateur || '', categorie_id: p.categorie_id ? String(p.categorie_id) : '',
      langue: p.langue, actif: p.actif,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      jour_semaine: Number(form.jour_semaine), heure_debut: form.heure_debut, heure_fin: form.heure_fin,
      titre: form.titre, animateur: form.animateur || null,
      categorie_id: form.categorie_id ? Number(form.categorie_id) : null,
      langue: form.langue, actif: form.actif,
    }
    if (editing) {
      await db.programmes().update(payload).eq('id', editing.id)
      await logAction('update_programme', 'programmes', editing.id, { titre: form.titre })
    } else {
      const { data } = await db.programmes().insert(payload).select('id').single()
      await logAction('create_programme', 'programmes', data?.id, { titre: form.titre })
    }
    setShowForm(false)
    load()
  }

  const remove = async (p: ProgrammeView) => {
    if (!confirm(`Supprimer « ${p.titre} » ?`)) return
    await db.programmes().delete().eq('id', p.id)
    await logAction('delete_programme', 'programmes', p.id, { titre: p.titre })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-brand-primary)' }}>Programmes</h1>
        <button onClick={() => openNew()} className="btn-primary"><Plus className="w-4 h-4" /> Ajouter un programme</button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Chargement…</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {JOURS.map((jour, i) => (
            <div key={i} className="bg-white rounded-2xl p-4" style={{ border: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm" style={{ color: 'var(--color-brand-primary)' }}>{jour}</h3>
                <button onClick={() => openNew(i)} className="text-gray-400 hover:text-gray-700"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="space-y-2">
                {items.filter(p => p.jour_semaine === i).length === 0 ? (
                  <p className="text-xs text-gray-300">Aucun programme</p>
                ) : items.filter(p => p.jour_semaine === i).map(p => (
                  <div key={p.id} className="p-2 rounded-lg text-xs group" style={{ background: 'var(--color-surface-alt)' }}>
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <div className="font-mono text-gray-500">{p.heure_debut.slice(0,5)}–{p.heure_fin.slice(0,5)}</div>
                        <div className="font-semibold text-gray-900">{p.titre}</div>
                        {p.animateur && <div className="text-gray-500">{p.animateur}</div>}
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-gray-700"><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => remove(p)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-full max-w-md space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold" style={{ color: 'var(--color-brand-primary)' }}>
                {editing ? 'Modifier le programme' : 'Nouveau programme'}
              </h3>
              <button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Jour</label>
                <select value={form.jour_semaine} onChange={e => setForm(f => ({ ...f, jour_semaine: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }}>
                  {JOURS.map((j, i) => <option key={i} value={i}>{j}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Langue</label>
                <select value={form.langue} onChange={e => setForm(f => ({ ...f, langue: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }}>
                  {LANGUES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Heure début</label>
                <input required type="time" value={form.heure_debut} onChange={e => setForm(f => ({ ...f, heure_debut: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Heure fin</label>
                <input required type="time" value={form.heure_fin} onChange={e => setForm(f => ({ ...f, heure_fin: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Titre de l'émission *</label>
              <input required value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Animateur</label>
              <input value={form.animateur} onChange={e => setForm(f => ({ ...f, animateur: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Catégorie</label>
              <select value={form.categorie_id} onChange={e => setForm(f => ({ ...f, categorie_id: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }}>
                <option value="">—</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nom_fr}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full justify-center">
              {editing ? 'Enregistrer' : 'Ajouter'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
