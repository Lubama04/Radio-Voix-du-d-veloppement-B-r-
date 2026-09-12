import { useEffect, useState, useCallback } from 'react'
import { Upload, Trash2, Copy, FileText, Music, Video, Image as ImageIcon } from 'lucide-react'
import { db, supabase } from '@/lib/supabase'
import { logAction } from '@/hooks/useAuditLog'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { MediaItem } from '@/types/database'

const FILTRES = ['Tous', 'image', 'document', 'audio', 'video'] as const

function detectType(mime: string): MediaItem['type'] {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('audio/')) return 'audio'
  if (mime.startsWith('video/')) return 'video'
  return 'document'
}

export default function AdminMediatheque() {
  useDocumentTitle('Médiathèque | Administration')
  const [items, setItems] = useState<MediaItem[]>([])
  const [filtre, setFiltre] = useState<typeof FILTRES[number]>('Tous')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await db.mediatheque().select('*').order('created_at', { ascending: false })
    setItems((data as MediaItem[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleUpload = async (files: FileList) => {
    setUploading(true)
    for (const file of Array.from(files)) {
      const path = `mediatheque/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
      const { error } = await supabase.storage.from('mediatheque').upload(path, file, { upsert: true })
      if (!error) {
        const { data } = supabase.storage.from('mediatheque').getPublicUrl(path)
        await db.mediatheque().insert({
          nom: file.name, url: data.publicUrl, type: detectType(file.type), taille: file.size, bucket: 'mediatheque', chemin: path,
        })
        await logAction('upload_media', 'mediatheque', undefined, { nom: file.name })
      }
    }
    setUploading(false)
    load()
  }

  const copyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url)
    setCopiedId(item.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const remove = async (item: MediaItem) => {
    if (!confirm(`Supprimer « ${item.nom} » ?`)) return
    if (item.chemin) await supabase.storage.from('mediatheque').remove([item.chemin])
    await db.mediatheque().delete().eq('id', item.id)
    await logAction('delete_media', 'mediatheque', item.id, { nom: item.nom })
    load()
  }

  const filtered = items.filter(i => filtre === 'Tous' || i.type === filtre)
  const iconFor = (t: MediaItem['type']) => t === 'audio' ? Music : t === 'video' ? Video : t === 'document' ? FileText : ImageIcon

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-brand-primary)' }}>Médiathèque</h1>
        <label className="btn-primary cursor-pointer">
          <Upload className="w-4 h-4" /> {uploading ? 'Envoi…' : 'Ajouter des fichiers'}
          <input type="file" multiple className="hidden" onChange={e => e.target.files && handleUpload(e.target.files)} />
        </label>
      </div>

      <div className="flex gap-2 mb-4">
        {FILTRES.map(f => (
          <button key={f} onClick={() => setFiltre(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border capitalize ${filtre === f ? 'text-white border-transparent' : 'bg-white text-gray-700'}`}
            style={filtre === f ? { background: 'var(--color-brand-primary)' } : { borderColor: 'var(--color-border)' }}>
            {f === 'Tous' ? 'Tous' : `${f}s`}
          </button>
        ))}
      </div>

      {loading ? <p className="text-gray-400 text-sm">Chargement…</p> : filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">Aucun fichier.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map(item => {
            const Icon = iconFor(item.type)
            return (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                {item.type === 'image' ? (
                  <img src={item.url} alt={item.nom} className="w-full aspect-video object-cover" />
                ) : (
                  <div className="w-full aspect-video flex items-center justify-center" style={{ background: 'var(--color-surface-alt)' }}>
                    <Icon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-900 truncate">{item.nom}</p>
                  <p className="text-xs text-gray-400 mb-2">{item.taille ? `${(item.taille / 1024).toFixed(0)} Ko` : ''}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => copyUrl(item)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="Copier l'URL">
                      <Copy className="w-4 h-4" />
                    </button>
                    {copiedId === item.id && <span className="text-xs" style={{ color: '#007A33' }}>Copié !</span>}
                    <button onClick={() => remove(item)} className="p-1.5 rounded hover:bg-red-50 text-red-600 ml-auto" title="Supprimer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
