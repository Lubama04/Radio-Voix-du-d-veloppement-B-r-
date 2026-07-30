import { useEffect, useState } from 'react'
import { Rss } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { db } from '@/lib/supabase'
import type { TickerMsg } from '@/types/database'

const FALLBACK: TickerMsg[] = [
  { id:'1', texte:'LA VOIX DU DÉVELOPPEMENT DE BÉRÉ  ·  96.7 FM  ·  En direct de Béré, province de la Tandjilé, Tchad', lien_url:'/radio', priorite:5, actif:true, date_debut:'', created_at:'' },
  { id:'2', texte:'Retrouvez notre grille de programmes et nos émissions en ligne', lien_url:'/radio', priorite:4, actif:true, date_debut:'', created_at:'' },
  { id:'3', texte:'Contactez-nous pour participer à nos émissions ou proposer un événement local', lien_url:'/contact', priorite:3, actif:true, date_debut:'', created_at:'' },
  { id:'4', texte:'Radio Voix de Développement  ·  Autorisation HAMA N° 016/2023  ·  Service public communautaire', lien_url:'/frequences', priorite:2, actif:true, date_debut:'', created_at:'' },
]

export default function Ticker() {
  const { t } = useLang()
  const [messages, setMessages] = useState<TickerMsg[]>(FALLBACK)

  useEffect(() => {
    db.vTicker().select('*').then(({ data }) => {
      if (data && data.length > 0) setMessages(data as TickerMsg[])
    })
  }, [])

  const text = messages.map(m => m.texte).join('     ·     ')

  return (
    <div className="ticker-wrapper h-9 flex items-center" style={{ background: '#1B4332' }}>
      <div className="flex-shrink-0 flex items-center gap-2 px-4 h-full" style={{ background: '#9B2226', zIndex: 1 }}>
        <Rss className="w-4 h-4 text-white" />
        <span className="text-white uppercase hidden sm:inline"
          style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.03em' }}>
          {t.ticker.label}
        </span>
      </div>
      <div className="ticker-wrapper flex-1">
        <div className="ticker-content text-white py-2 px-4" style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.03em' }}>
          {text} &nbsp;&nbsp;&nbsp; {text}
        </div>
      </div>
    </div>
  )
}
