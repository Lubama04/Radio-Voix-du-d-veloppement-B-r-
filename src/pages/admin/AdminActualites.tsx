import { useEffect, useState, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { Pencil, Trash2, Eye, EyeOff, Plus } from 'lucide-react'
import { db } from '@/lib/supabase'
import { logAction } from '@/hooks/useAuditLog'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import SafeImage from '@/components/shared/SafeImage'
import type { ActualiteView, CategorieActu } from '@/types/database'

const FILTRES = ['Tous', 'Publiés', 'Brouillons'] as const

export default function AdminActualites() {
  useDocumentTitle('Actualités | Administration')
  const [items, setItems] = useState<ActualiteView[]>([])
  const [categories, setCategories] = useState<CategorieActu[]>([])
  const [filtre, setFiltre] = useState<typeof FILTRES[number]>('Tous')
  const [catFiltre, setCatFiltre] = useState<string>('Toutes')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: articles }, { data: cats }] = await Promise.all([
      db.vActualites().select('*').order('date_publication', { ascending: false }),
      db.categoriesActu().select('*').order('ordre'),
    ])
    setItems((articles as ActualiteView[]) ?? [])
    setCategories((cats as CategorieActu[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = items.filter(a => {
    if (filtre === 'Publiés' && !a.publie) return false
    if (filtre === 'Brouillons' && a.publie) return false
    if (catFiltre !== 'Toutes' && a.categorie_slug !== catFiltre) return false
    return true
  })

  const togglePublie = async (a: ActualiteView) => {
    await db.actualites().update({ publie: !a.publie }).eq('id', a.id)
    await logAction(a.publie ? 'depublier_article' : 'publier_article', 'actualites', a.id)
    load()
  }

  const remove = async (a: ActualiteView) => {
    if (!confirm(`Supprimer définitivement « ${a.titre} » ?`)) return
    await db.actualites().delete().eq('id', a.id)
    await logAction('delete_article', 'actualites', a.id, { titre: a.titre })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-brand-primary)' }}>Actualités</h1>
        <Link to="/admin/actualites/nouveau" className="btn-primary"><Plus className="w-4 h-4" /> Nouvel article</Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTRES.map(f => (
          <button key={f} onClick={() => setFiltre(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${filtre === f ? 'text-white border-transparent' : 'bg-white text-gray-700'}`}
            style={filtre === f ? { background: 'var(--color-brand-primary)' } : { borderColor: 'var(--color-border)' }}>
            {f}
          </button>
        ))}
        <select value={catFiltre} onChange={e => setCatFiltre(e.target.value)}
          className="px-3 py-1.5 rounded-full text-sm border bg-white" style={{ borderColor: 'var(--color-border)' }}>
          <option value="Toutes">Toutes catégories</option>
          {categories.map(c => <option key={c.id} value={c.slug}>{c.nom_fr}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase" style={{ background: 'var(--color-surface-alt)' }}>
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Auteur</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Chargement…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Aucun article.</td></tr>
              ) : filtered.map(a => (
                <tr key={a.id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <td className="px-4 py-3">
                    <SafeImage src={a.image_url || ''} alt={a.titre} className="w-12 h-9 rounded-lg object-cover" />
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900 max-w-xs truncate">{a.titre}</td>
                  <td className="px-4 py-3 text-gray-600">{a.categorie_nom || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{a.auteur || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(a.date_publication).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <span className="badge text-xs" style={a.publie ? { background: '#E8F5EE', color: '#007A33' } : { background: '#F3F4F6', color: '#6B7280' }}>
                      {a.publie ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to="/admin/actualites/$id" params={{ id: a.id }} title="Modifier" className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button title={a.publie ? 'Dépublier' : 'Publier'} onClick={() => togglePublie(a)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                        {a.publie ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button title="Supprimer" onClick={() => remove(a)} className="p-1.5 rounded hover:bg-red-50 text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
