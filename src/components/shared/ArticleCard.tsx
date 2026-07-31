import { Link } from '@tanstack/react-router'
import { Clock, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import SafeImage from '@/components/shared/SafeImage'
import type { ActualiteView } from '@/types/database'

interface Props {
  article: ActualiteView
  variant?: 'default' | 'compact' | 'featured'
}

export default function ArticleCard({ article, variant = 'default' }: Props) {
  const timeAgo = formatDistanceToNow(new Date(article.date_publication), { addSuffix: true, locale: fr })
  const href = `/actualites/${article.slug || article.id}`

  if (variant === 'compact') return (
    <Link to={href} className="flex items-start gap-3 group py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
      {article.image_url && (
        <SafeImage src={article.image_url} alt={article.titre} loading="lazy"
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold mb-1" style={{ color: article.categorie_couleur || 'var(--color-brand-primary)' }}>
          {article.categorie_nom}
        </div>
        <h4 className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2 leading-snug">
          {article.titre}
        </h4>
        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />{timeAgo}
        </div>
      </div>
    </Link>
  )

  if (variant === 'featured') return (
    <Link to={href} className="group block rounded-2xl overflow-hidden relative h-80"
      style={{ border: '1px solid var(--color-border)' }}>
      <SafeImage
        src={article.image_url || `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80`}
        alt={article.titre} loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        {article.categorie_nom && (
          <span className="badge-red text-xs mb-2 inline-flex">{article.categorie_nom}</span>
        )}
        <h3 className="font-display font-bold text-xl text-white leading-tight mb-2">{article.titre}</h3>
        <div className="flex items-center gap-3 text-white/60 text-xs">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo}</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.vues} vues</span>
        </div>
      </div>
    </Link>
  )

  return (
    <Link to={href} className="card group flex flex-col h-full">
      <div className="relative h-44 overflow-hidden">
        <SafeImage
          src={article.image_url || `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=70`}
          alt={article.titre} loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {article.a_la_une && (
          <span className="absolute top-2 left-2 badge-red">À la une</span>
        )}
        {article.categorie_nom && (
          <span className="absolute top-2 right-2 badge text-xs font-semibold text-white"
            style={{ background: article.categorie_couleur || 'var(--color-brand-primary)' }}>
            {article.categorie_nom}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-bold text-base text-gray-900 group-hover:text-green-700 transition-colors mb-2 line-clamp-2 leading-snug">
          {article.titre}
        </h3>
        {article.extrait && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">{article.extrait}</p>
        )}
        <div className="flex items-center justify-between text-xs pt-3 border-t mt-auto"
          style={{ borderColor: '#DEDBD3', color: '#6B6B6B' }}>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo}</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.vues} vue{article.vues !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </Link>
  )
}
