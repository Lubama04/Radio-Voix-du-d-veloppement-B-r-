import { useState, useEffect } from 'react'
import { db } from '@/lib/supabase'

const CONFIG_DEFAULTS: Record<string, string> = {
  nom_radio:    'La Voix du Développement de Béré',
  frequence:    '96.7 FM',
  slogan:       'La voix qui porte le développement',
  ville:        'Béré',
  province:     'Province de la Tandjilé',
  pays:         'Tchad',
  stream_url:   '',
  telephone:    '',
  whatsapp:     '',
  email:        '',
  facebook:     '',
  latitude:     '9.3167',
  longitude:    '16.0833',
}

export function useConfig() {
  const [config, setConfig] = useState<Record<string, string>>(CONFIG_DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await db.getConfig()
        if (data) setConfig({ ...CONFIG_DEFAULTS, ...data })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { config, loading }
}
