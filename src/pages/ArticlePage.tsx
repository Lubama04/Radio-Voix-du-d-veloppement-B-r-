import { useEffect, useState } from 'react'
import { getRouteApi, Link } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Clock, Eye, User, Facebook, MessageCircle, Link as LinkIcon, Check, ChevronRight } from 'lucide-react'
import { db } from '@/lib/supabase'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import ArticleCard from '@/components/shared/ArticleCard'
import SafeImage from '@/components/shared/SafeImage'
import type { ActualiteView } from '@/types/database'

const routeApi = getRouteApi('/actualites/$slug')

export default function ArticlePage() {
  const { slug } = routeApi.useParams()
  const [article, setArticle] = useState<ActualiteView | null>(null)
  const [similaires, setSimilaires] = useState<ActualiteView[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useDocumentTitle(article ? `${article.titre} | Radio Voix de Béré` : 'Article | Radio Voix de Béré')

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const { data } = await db.vActualites().select('*').eq('slug', slug).limit(1)
      const found = (data as ActualiteView[] | null)?.[0] ?? null
      if (!active) return
      setArticle(found)
      setLoading(false)
      if (found) {
        db.incrementerVues(found.id)
        if (found.categorie_slug) {
          const { data: rel } = await db.vActualites().select('*')
            .eq('categorie_slug', found.categorie_slug)
            .neq('id', found.id)
            .limit(3)
          if (active && rel) setSimilaires(rel as ActualiteView[])
        }
      }
    }
    load()
    return () => { active = false }
  }, [slug])

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Copie impossible (navigateur trop ancien) : rien à faire, le lien reste visible dans la barre d'adresse
    }
  }

  if (loading) {
    return (
      <main className="pt-16 max-w-3xl mx-auto px-4 py-16">
        <div className="h-8 w-2/3 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-64 bg-gray-200 rounded-2xl animate-pulse mb-6" />
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />)}
        </div>
      </main>
    )
  }

  if (!article) {
    return (
      <main className="pt-16 max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="font-display font-bold text-2xl mb-4">Article introuvable</h1>
        <p className="text-gray-600 mb-8">Cet article n'existe pas ou n'est plus disponible.</p>
        <Link to="/actualites" className="btn-primary inline-flex">Retour aux actualités</Link>
      </main>
    )
  }

  const timeAgo = formatDistanceToNow(new Date(article.date_publication), { addSuffix: true, locale: fr })

  return (
    <main className="pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-gray-700">Accueil</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/actualites" className="hover:text-gray-700">Actualités</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-800 font-medium truncate max-w-xs">{article.titre}</span>
        </nav>

        {article.categorie_nom && (
          <span className="badge text-xs font-semibold text-white mb-4 inline-flex"
            style={{ background: article.categorie_couleur || 'var(--color-brand-primary)' }}>
            {article.categorie_nom}
          </span>
        )}

        <h1 className="font-display font-bold text-3xl sm:text-4xl mb-4 leading-tight text-gray-900">
          {article.titre}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
          {article.auteur && (
            <span className="flex items-center gap-1"><User className="w-4 h-4" />{article.auteur}</span>
          )}
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{timeAgo}</span>
          <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{article.vues} vues</span>
        </div>

        {article.image_url && (
          <SafeImage src={article.image_url} alt={article.image_alt || article.titre} loading="eager"
            className="w-full rounded-2xl object-cover mb-8 max-h-96" />
        )}

        <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 whitespace-pre-line mb-10">
          {article.contenu}
        </div>

        {/* Partage */}
        <div className="flex items-center gap-3 pt-6 border-t mb-12" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-sm font-semibold text-gray-700">Partager :</span>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank" rel="noopener noreferrer" aria-label="Partager sur Facebook"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: '#1877F2' }}>
            <Facebook className="w-4 h-4" />
          </a>
          <a href={`https://wa.me/?text=${encodeURIComponent(`${article.titre} ${shareUrl}`)}`}
            target="_blank" rel="noopener noreferrer" aria-label="Partager sur WhatsApp"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-green-500">
            <MessageCircle className="w-4 h-4" />
          </a>
          <button onClick={copyLink} aria-label="Copier le lien"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white"
            style={{ background: copied ? '#16a34a' : 'var(--color-brand-primary)' }}>
            {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
          </button>
        </div>

        {/* Articles similaires */}
        {similaires.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-xl mb-4" style={{ color: 'var(--color-brand-primary)' }}>
              Articles similaires
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {similaires.map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
