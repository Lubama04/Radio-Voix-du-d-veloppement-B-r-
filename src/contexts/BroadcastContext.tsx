import {
  createContext, useContext, useState,
  useEffect, ReactNode, useCallback
} from 'react'
import { supabase } from '@/lib/supabase'
import { CONFIG } from '@/config'

interface BroadcastStatus {
  is_on_air:                 boolean
  statut:                    'auto'|'on_air'|'off'|'maintenance'
  tchad_hour:                number
  heure_debut:               number
  heure_fin:                 number
  minutes_avant_diffusion:   number
  message_off:               string
  message_maint:             string
  loading:                   boolean
  error:                     boolean
}

const DEFAULT: BroadcastStatus = {
  is_on_air:               false,
  statut:                  'auto',
  tchad_hour:              0,
  heure_debut:             CONFIG.BROADCAST_START_HOUR,
  heure_fin:               CONFIG.BROADCAST_END_HOUR,
  minutes_avant_diffusion: 0,
  message_off:             'La radio diffuse chaque jour de 17h à 21h (heure du Tchad).',
  message_maint:           'Maintenance en cours. Reprise prévue prochainement.',
  loading:                 true,
  error:                   false,
}

const BroadcastCtx = createContext<BroadcastStatus>(DEFAULT)

export function BroadcastProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<BroadcastStatus>(DEFAULT)

  const fetchStatus = useCallback(async () => {
    const controller = new AbortController()
    const timer = setTimeout(
      () => controller.abort(),
      CONFIG.EDGE_TIMEOUT_MS
    )
    try {
      const { data, error } = await supabase.functions.invoke(
        'broadcast-status'
      )
      clearTimeout(timer)
      if (error) throw error
      setStatus({ ...data, loading: false, error: false })
    } catch {
      clearTimeout(timer)
      // Fallback minimal — pas de logique métier côté client
      setStatus(s => ({ ...s, loading: false, error: true }))
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, CONFIG.BROADCAST_POLL_MS)
    return () => clearInterval(interval)
  }, [fetchStatus])

  return (
    <BroadcastCtx.Provider value={status}>
      {children}
    </BroadcastCtx.Provider>
  )
}

export function useBroadcast() {
  return useContext(BroadcastCtx)
}

export function getBroadcastMessage(
  tchad_hour: number,
  heure_debut: number,
  heure_fin: number,
  error: boolean
): string {
  if (error) return 'Statut temporairement indisponible.'
  if (tchad_hour < heure_debut)
    return `La diffusion commence à ${heure_debut}h (heure du Tchad).`
  if (tchad_hour >= heure_fin)
    return `Diffusion terminée. Rendez-vous demain à ${heure_debut}h (heure du Tchad).`
  return ''
}

export function formatCountdown(minutes: number): string {
  if (minutes <= 0) return 'maintenant'
  const h = Math.floor(minutes / 60)
  const m = Math.floor(minutes % 60)
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}min`
  return `${m}min`
}
