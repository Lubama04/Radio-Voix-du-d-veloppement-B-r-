import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Rss } from 'lucide-react'
import { db } from '@/lib/supabase'
import type { TickerMsg } from '@/types/database'

const FALLBACK: TickerMsg[] = [
  { id:'1', texte:'🔴 EN DIRECT — Écoutez La Voix du Développement de Béré sur 96.7 FM', lien_url:'/radio', priorite:5, actif:true, date_debut:'', created_at:'' },
  { id:'2', texte:'📻 Suivez notre grille de programmes en ligne', lien_url:'/radio', priorite:4, actif:true, date_debut:'', created_at:'' },
  { id:'3', texte:'📞 Contactez-nous sur WhatsApp pour participer à nos émissions', lien_url:'/contact', priorite:3, actif:true, date_debut:'', created_at:'' },
]

export default function Ticker() {
  const [messages, setMessages] = useState<TickerMsg[]>(FALLBACK)

  useEffect(() => {
    db.vTicker().select('*').then(({ data }) => {
      if (data && data.length > 0) setMessages(data as TickerMsg[])
    })
  }, [])

  const text = messages.map(m => m.texte).join('     ·     ')

  return (
    <div className="ticker-wrapper h-9 flex items-center"
      style={{ background: 'var(--color-brand-primary)' }}>
      <div className="flex-shrink-0 flex items-center gap-2 px-4 h-full"
        style={{ background: 'var(--color-brand-dark)', zIndex: 1 }}>
        <Rss className="w-4 h-4 text-white" />
        <span className="text-white text-xs font-bold uppercase tracking-wide hidden sm:inline">Fil d'info</span>
      </div>
      <div className="ticker-wrapper flex-1">
        <div className="ticker-content text-white text-sm py-2 px-4">
          {text} &nbsp;&nbsp;&nbsp; {text}
        </div>
      </div>
    </div>
  )
}
