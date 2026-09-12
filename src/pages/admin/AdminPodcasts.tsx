import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Upload } from 'lucide-react'
import { db, supabase } from '@/lib/supabase'
import { logAction } from '@/hooks/useAuditLog'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { PodcastView, Emission } from '@/types/database'

const emptyForm = {
  titre: '', description: '', audio_url: '', image_url: '',
  emission_id: '', date_diffusion: new Date().toISOString().slice(0, 10),
}

export default function AdminPodcasts() {
  useDocumentTitle('Podcasts | Administration')
  const [items, setItems] = useState<PodcastView[]>([])
  const [emissions, setEmissions] = useState<Emission[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<PodcastView | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: pods }, { data: ems }] = await Promise.all([
      db.vPodcasts().select('*').order('date_diffusion', { ascending: false }),
      db.emissions().select('*'),
    ])
    setItems((pods as PodcastView[]) ?? [])
    setEmissions((ems as Emission[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowForm(true) }
  const openEdit = (p: PodcastView) => {
    setEditing(p)
    setForm({
      titre: p.titre, description: p.description || '', audio_url: p.audio_url, image_url: p.image_url || '',
      emission_id: p.emission_id || '', date_diffusion: p.date_diffusion.slice(0, 10),
    })
    setShowForm(true)
  }

  const uploadAudio = async (file: File) => {
    setUploading(true)
    const path = `podcasts/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const { error } = await supabase.storage.from('mediatheque').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('mediatheque').getPublicUrl(path)
      setForm(f => ({ ...f, audio_url: data.publicUrl }))
      await db.mediatheque().insert({ nom: file.name, url: data.publicUrl, type: 'audio', taille: file.size, bucket: 'mediatheque', chemin: path })
      await logAction('upload_media', 'mediatheque', undefined, { nom: file.name })
    }
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      titre: form.titre, description: form.description || null, audio_url: form.audio_url,
      image_url: form.image_url || null, emission_id: form.emission_id || null,
      date_diffusion: form.date_diffusion,
    }
    if (editing) {
      await db.podcasts().update(payload).eq('id', editing.id)
      await logAction('update_podcast', 'podcasts', editing.id, { titre: form.titre })
    } else {
      const { data } = await db.podcasts().insert({ ...payload, langue: 'français', ecoutes: 0, featured: false, publie: true }).select('id').single()
      await logAction('create_podcast', 'podcasts', data?.id, { titre: form.titre })
    }
    setShowForm(false)
    load()
  }

  const togglePublie = async (p: PodcastView) => {
    await db.podcasts().update({ publie: !p.publie }).eq('id', p.id)
    await logAction(p.publie ? 'depublier_podcast' : 'publier_podcast', 'podcasts', p.id)
    load()
  }

  const remove = async (p: PodcastView) => {
    if (!confirm(`Supprimer « ${p.titre} » ?`)) return
    await db.podcasts().delete().eq('id', p.id)
    await logAction('delete_podcast', 'podcasts', p.id, { titre: p.titre })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-brand-primary)' }}>Podcasts</h1>
        <button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Nouveau podcast</button>
      </div>

      {loading ? <p className="text-gray-400 text-sm">Chargement…</p> : items.length === 0 ? (
        <p className="text-gray-400 text-sm">Aucun podcast.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(p => (
            <div key={p.id} className="bg-white rounded-2xl p-4" style={{ border: '1px solid var(--color-border)' }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-sm text-gray-900">{p.titre}</h3>
                <span className="badge text-xs flex-shrink-0" style={p.publie ? { background: '#E8F5EE', color: '#007A33' } : { background: '#F3F4F6', color: '#6B7280' }}>
                  {p.publie ? 'Publié' : 'Masqué'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{new Date(p.date_diffusion).toLocaleDateString('fr-FR')} · {p.ecoutes} écoutes</p>
              <audio controls src={p.audio_url} className="w-full mb-3" style={{ height: 32 }} />
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => togglePublie(p)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                  {p.publie ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => remove(p)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold" style={{ color: 'var(--color-brand-primary)' }}>{editing ? 'Modifier' : 'Nouveau podcast'}</h3>
              <button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Titre *</label>
              <input required value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm resize-none" style={{ borderColor: 'var(--color-border)' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Fichier audio *</label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer text-gray-500" style={{ borderColor: 'var(--color-border)' }}>
                  <Upload className="w-4 h-4" /> {uploading ? 'Envoi…' : 'Fichier'}
                  <input type="file" accept="audio/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadAudio(f) }} />
                </label>
                <input required value={form.audio_url} onChange={e => setForm(f => ({ ...f, audio_url: e.target.value }))}
                  placeholder="ou coller une URL" className="flex-1 px-3 py-2 rounded-lg border text-xs" style={{ borderColor: 'var(--color-border)' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Émission</label>
                <select value={form.emission_id} onChange={e => setForm(f => ({ ...f, emission_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }}>
                  <option value="">—</option>
                  {emissions.map(em => <option key={em.id} value={em.id}>{em.titre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Date de diffusion</label>
                <input type="date" value={form.date_diffusion} onChange={e => setForm(f => ({ ...f, date_diffusion: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full justify-center">{editing ? 'Enregistrer' : 'Créer'}</button>
          </form>
        </div>
      )}
    </div>
  )
}
