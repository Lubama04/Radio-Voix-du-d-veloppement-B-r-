import { useState, useEffect } from 'react'
import { Search, Newspaper, Clock, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useLang } from '@/contexts/LanguageContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { db } from '@/lib/supabase'
import SectionHeader from '@/components/shared/SectionHeader'
import ArticleCard from '@/components/shared/ArticleCard'
import type { ActualiteView, CategorieActu } from '@/types/database'

export default function ActualitesPage() {
  useDocumentTitle('Actualités | Radio Voix de Béré 96.7 FM')
  const { t } = useLang()
  const [articles, setArticles] = useState<ActualiteView[]>([])
  const [categories, setCategories] = useState<CategorieActu[]>([])
  const [selectedCat, setSelectedCat] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [featured, setFeatured] = useState<ActualiteView | null>(null)

  useEffect(() => {
    Promise.all([
      db.vActualites().select('*').order('date_publication', { ascending: false }).limit(30),
      db.categoriesActu().select('*').eq('actif', true).order('ordre'),
    ]).then(([a, c]) => {
      if (a.data) {
        const all = a.data as ActualiteView[]
        setFeatured(all.find(x => x.a_la_une) || all[0] || null)
        setArticles(all)
      }
      if (c.data) setCategories(c.data as CategorieActu[])
      setLoading(false)
    })
  }, [])

  const filtered = articles.filter(a => {
    const matchCat = selectedCat === 'all' || a.categorie_slug === selectedCat
    const matchSearch = !search || a.titre.toLowerCase().includes(search.toLowerCase()) || (a.extrait || '').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <main className="pt-16">
      {/* Hero compact */}
      <div className="py-12 px-4 text-center text-white"
        style={{ background: 'linear-gradient(135deg, var(--color-brand-dark), var(--color-brand-primary))' }}>
        <h1 className="font-display font-bold text-4xl mb-2">{t.pages.news}</h1>
        <p className="text-white/70">Toutes les actualités de Béré, de la Tandjilé et du Tchad</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Barre recherche + filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t.misc.search}
              className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-border)', '--tw-ring-color': 'var(--color-brand-primary)' } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Chips catégories */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button onClick={() => setSelectedCat('all')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
              selectedCat === 'all' ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-700 hover:border-green-500'
            }`}
            style={selectedCat === 'all' ? { background: 'var(--color-brand-primary)' } : {}}>
            Toutes
          </button>
          {categories.map(c => (
            <button key={c.slug} onClick={() => setSelectedCat(c.slug)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                selectedCat === c.slug ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-700 hover:border-green-500'
              }`}
              style={selectedCat === c.slug ? { background: c.couleur } : {}}>
              {c.nom_fr}
            </button>
          ))}
        </div>

        <div className="flex gap-8">
          {/* Grille principale */}
          <div className="flex-1 min-w-0">
            {/* Article à la une */}
            {featured && selectedCat === 'all' && !search && (
              <div className="mb-8">
                <ArticleCard article={featured} variant="featured" />
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse" />)}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.filter((a, i) => !(i === 0 && a.a_la_une && selectedCat === 'all' && !search)).map(a => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="font-medium">Aucun article trouvé</p>
              </div>
            )}
          </div>

          {/* Sidebar "Les plus lus" — Desktop uniquement */}
          {articles.length > 0 && (
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl p-5 sticky top-20" style={{ border: '1px solid var(--color-border)' }}>
                <h3 className="font-display font-bold text-base mb-4" style={{ color: 'var(--color-brand-primary)' }}>
                  Les plus lus
                </h3>
                <div className="space-y-4">
                  {[...articles].sort((a, b) => b.vues - a.vues).slice(0, 5).map((a, i) => (
                    <div key={a.id} className="flex items-start gap-3">
                      <span className="font-display font-bold text-2xl leading-none"
                        style={{ color: 'var(--color-brand-light)', WebkitTextStroke: '1px var(--color-brand-primary)' }}>
                        {i+1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{a.titre}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <Eye className="w-3 h-3" />{a.vues}
                          <Clock className="w-3 h-3 ml-1" />
                          {formatDistanceToNow(new Date(a.date_publication), { addSuffix: true, locale: fr })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </main>
  )
}
