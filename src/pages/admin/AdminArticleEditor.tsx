import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { Upload } from 'lucide-react'
import { db, supabase } from '@/lib/supabase'
import { logAction } from '@/hooks/useAuditLog'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { Actualite, CategorieActu } from '@/types/database'

function slugify(s: string) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const emptyForm = {
  titre: '', slug: '', categorie_id: '', image_url: '', extrait: '', contenu: '',
  auteur: '', a_la_une: false, ticker: false, publie: false,
}

export default function AdminArticleEditor() {
  const location = useLocation()
  const navigate = useNavigate()
  const isNew = location.pathname.endsWith('/nouveau')
  const id = isNew ? null : location.pathname.split('/').pop()

  useDocumentTitle(isNew ? 'Nouvel article | Administration' : 'Modifier l\'article | Administration')

  const [form, setForm] = useState(emptyForm)
  const [categories, setCategories] = useState<CategorieActu[]>([])
  const [slugTouched, setSlugTouched] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    db.categoriesActu().select('*').order('ordre').then(({ data }) => setCategories((data as CategorieActu[]) ?? []))
  }, [])

  useEffect(() => {
    if (isNew || !id) return
    db.actualites().select('*').eq('id', id).single().then(({ data }) => {
      const a = data as Actualite | null
      if (a) {
        setForm({
          titre: a.titre, slug: a.slug || '', categorie_id: a.categorie_id ? String(a.categorie_id) : '',
          image_url: a.image_url || '', extrait: a.extrait || '', contenu: a.contenu,
          auteur: a.auteur || '', a_la_une: a.a_la_une, ticker: a.ticker, publie: a.publie,
        })
        setSlugTouched(true)
      }
      setLoading(false)
    })
  }, [isNew, id])

  const handleTitreChange = (v: string) => {
    setForm(f => ({ ...f, titre: v, slug: slugTouched ? f.slug : slugify(v) }))
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    const path = `articles/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const { error } = await supabase.storage.from('mediatheque').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('mediatheque').getPublicUrl(path)
      setForm(f => ({ ...f, image_url: data.publicUrl }))
      await db.mediatheque().insert({
        nom: file.name, url: data.publicUrl, type: 'image', taille: file.size, bucket: 'mediatheque', chemin: path,
      })
      await logAction('upload_media', 'mediatheque', undefined, { nom: file.name })
    }
    setUploading(false)
  }

  const handleSubmit = (statutPublie: boolean) => async () => {
    setSaving(true)
    const payload = {
      titre: form.titre,
      slug: form.slug || slugify(form.titre),
      categorie_id: form.categorie_id ? Number(form.categorie_id) : null,
      image_url: form.image_url || null,
      extrait: form.extrait || null,
      contenu: form.contenu,
      auteur: form.auteur || null,
      a_la_une: form.a_la_une,
      ticker: form.ticker,
      publie: statutPublie,
    }

    if (isNew) {
      const { data, error } = await db.actualites().insert({
        ...payload, vues: 0, date_publication: new Date().toISOString(),
      }).select('id').single()
      if (!error && data) await logAction('create_article', 'actualites', data.id, { titre: form.titre })
    } else if (id) {
      const { error } = await db.actualites().update(payload).eq('id', id)
      if (!error) await logAction('update_article', 'actualites', id, { titre: form.titre })
    }
    setSaving(false)
    navigate({ to: '/admin/actualites' })
  }

  if (loading) return <p className="text-gray-400 text-sm">Chargement…</p>

  return (
    <div className="max-w-3xl">
      <h1 className="font-display font-bold text-2xl mb-6" style={{ color: 'var(--color-brand-primary)' }}>
        {isNew ? 'Nouvel article' : 'Modifier l\'article'}
      </h1>

      <form onSubmit={e => e.preventDefault()} className="bg-white rounded-2xl p-6 space-y-4" style={{ border: '1px solid var(--color-border)' }}>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Titre *</label>
          <input required value={form.titre} onChange={e => handleTitreChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Slug</label>
          <input value={form.slug} onChange={e => { setSlugTouched(true); setForm(f => ({ ...f, slug: e.target.value })) }}
            className="w-full px-3 py-2 rounded-lg border text-sm font-mono" style={{ borderColor: 'var(--color-border)' }} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Catégorie</label>
            <select value={form.categorie_id} onChange={e => setForm(f => ({ ...f, categorie_id: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }}>
              <option value="">—</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nom_fr}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Auteur</label>
            <input value={form.auteur} onChange={e => setForm(f => ({ ...f, auteur: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--color-border)' }} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Image à la une</label>
          <div className="flex items-center gap-3">
            {form.image_url && <img src={form.image_url} alt="" className="w-16 h-12 object-cover rounded-lg" />}
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer text-gray-500"
              style={{ borderColor: 'var(--color-border)' }}>
              <Upload className="w-4 h-4" /> {uploading ? 'Envoi…' : 'Choisir un fichier'}
              <input type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f) }} />
            </label>
            <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
              placeholder="ou coller une URL" className="flex-1 px-3 py-2 rounded-lg border text-xs"
              style={{ borderColor: 'var(--color-border)' }} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Extrait (200 caractères max)</label>
          <textarea value={form.extrait} maxLength={200} rows={2}
            onChange={e => setForm(f => ({ ...f, extrait: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border text-sm resize-none" style={{ borderColor: 'var(--color-border)' }} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Contenu *</label>
          <textarea required value={form.contenu} rows={10}
            onChange={e => setForm(f => ({ ...f, contenu: e.target.value }))}
            placeholder="Markdown simple accepté (# titres, **gras**, listes -)"
            className="w-full px-3 py-2 rounded-lg border text-sm font-mono resize-y" style={{ borderColor: 'var(--color-border)' }} />
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.a_la_une} onChange={e => setForm(f => ({ ...f, a_la_une: e.target.checked }))} />
            À la une
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.ticker} onChange={e => setForm(f => ({ ...f, ticker: e.target.checked }))} />
            Afficher dans le ticker
          </label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" disabled={saving} onClick={() => handleSubmit(false)()}
            className="px-5 py-2.5 rounded-full border text-sm font-semibold disabled:opacity-60" style={{ borderColor: 'var(--color-border)' }}>
            Enregistrer en brouillon
          </button>
          <button type="button" disabled={saving} onClick={() => handleSubmit(true)()}
            className="btn-primary disabled:opacity-60">
            {saving ? 'Enregistrement…' : 'Publier'}
          </button>
        </div>
      </form>
    </div>
  )
}
