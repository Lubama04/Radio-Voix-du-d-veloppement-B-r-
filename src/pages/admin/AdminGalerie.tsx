import { useEffect, useState, useCallback } from 'react'
import { Upload, Trash2, Pencil, X } from 'lucide-react'
import { db, supabase } from '@/lib/supabase'
import { logAction } from '@/hooks/useAuditLog'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import SafeImage from '@/components/shared/SafeImage'
import type { GalerieItem } from '@/types/database'

const CATEGORIES = ['studio', 'terrain', 'equipe', 'evenements']

export default function AdminGalerie() {
  useDocumentTitle('Galerie | Administration')
  const [items, setItems] = useState<GalerieItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState<GalerieItem | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await db.galerie().select('*').order('ordre')
    setItems((data as GalerieItem[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleUpload = async (files: FileList) => {
    setUploading(true)
    for (const file of Array.from(files)) {
      const path = `galerie/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
      const { error } = await supabase.storage.from('mediatheque').upload(path, file, { upsert: true })
      if (!error) {
        const { data } = supabase.storage.from('mediatheque').getPublicUrl(path)
        await db.galerie().insert({
          titre: file.name.replace(/\.[^.]+$/, ''), url: data.publicUrl, categorie: 'studio',
          ordre: items.length, publie: true,
        })
        await logAction('upload_media', 'galerie', undefined, { nom: file.name })
      }
    }
    setUploading(false)
    load()
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    await db.galerie().update({ titre: editing.titre, legende: editing.legende, categorie: editing.categorie }).eq('id', editing.id)
    await logAction('update_media', 'galerie', editing.id, { titre: editing.titre })
    setEditing(null)
    load()
  }

  const remove = async (item: GalerieItem) => {
    if (!confirm(`Supprimer « ${item.titre} » ?`)) return
    await db.galerie().delete().eq('id', item.id)
    await logAction('delete_media', 'galerie', item.id, { titre: item.titre })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-brand-primary)' }}>Galerie</h1>
        <label className="btn-primary cursor-pointer">
          <Upload className="w-4 h-4" /> {uploading ? 'Envoi…' : 'Ajouter des photos'}
          <input type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && handleUpload(e.target.files)} />
        </label>
      </div>

      {loading ? <p className="text-gray-400 text-sm">Chargement…</p> : items.length === 0 ? (
        <p className="text-gray-400 text-sm">Aucune photo.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden group relative" style={{ border: '1px solid var(--color-border)' }}>
              <SafeImage src={item.url} alt={item.titre} className="w-full aspect-square object-cover" />
              <div className="p-3">
                <p className="text-xs font-semibold text-gray-900 truncate">{item.titre}</p>
                <p className="text-xs text-gray-400">{item.categorie}</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(item)} className="p-1.5 rounded-full bg-white shadow text-gray-600"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => remove(item)} className="p-1.5 rounded-full bg-white shadow text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <form onSubmit={save} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold" style={{ color: 'var(--color-brand-primary)' }}>Modifier la photo</h3>
              <button type="button" onClick={() => setEditing(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Titre</label>
              <input value={editing.titre} onChange={e => setEditing({ ...editing, titre: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Légende</label>
              <textarea rows={2} value={editing.legende || ''} onChange={e => setEditing({ ...editing, legende: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm resize-none" style={{ borderColor: 'var(--color-border)' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Catégorie</label>
              <select value={editing.categorie || ''} onChange={e => setEditing({ ...editing, categorie: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full justify-center">Enregistrer</button>
          </form>
        </div>
      )}
    </div>
  )
}
