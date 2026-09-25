import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
}

// Cache en mémoire Deno — dure le temps de vie de l'isolat (pas garanti
// partagé entre instances/régions, mais réduit la charge sur la base pour
// la grande majorité des appels puisque le statut ne change qu'à l'heure).
let cache: { data: unknown; expiry: number } | null = null

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const now = Date.now()

  // Retourner le cache si encore valide (30 secondes)
  if (cache && now < cache.expiry) {
    return new Response(JSON.stringify(cache.data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30',
        'X-Cache': 'HIT',
      }
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data, error } = await supabase
      .from('v_broadcast_status')
      .select('*')
      .single()

    if (error) throw error

    const responseData = {
      is_on_air: data.is_on_air,
      statut: data.statut,
      tchad_now: data.tchad_now,
      tchad_hour: data.tchad_hour,
      heure_debut: data.heure_debut,
      heure_fin: data.heure_fin,
      minutes_avant_diffusion: data.minutes_avant_diffusion,
      message_off: data.message_off,
      message_maint: data.message_maint,
    }

    cache = { data: responseData, expiry: now + 30_000 }

    return new Response(
      JSON.stringify(responseData),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30',
          'X-Cache': 'MISS',
        }
      }
    )

  } catch (error) {
    // Fallback : calcul local si Supabase indisponible
    const nowDate = new Date()
    const tchadTime = new Date(
      nowDate.toLocaleString('en-US', { timeZone: 'Africa/Ndjamena' })
    )
    const hour = tchadTime.getHours()
    const min = tchadTime.getMinutes()
    const isOnAir = hour >= 17 && hour < 21

    let minutesAvant = 0
    if (!isOnAir) {
      if (hour >= 21) {
        minutesAvant = (24 - hour + 17) * 60 - min
      } else {
        minutesAvant = (17 - hour) * 60 - min
      }
    }

    return new Response(
      JSON.stringify({
        is_on_air: isOnAir,
        statut: 'auto',
        tchad_hour: hour,
        heure_debut: 17,
        heure_fin: 21,
        minutes_avant_diffusion: minutesAvant,
        message_off: 'La radio diffuse chaque jour de 17h à 21h (heure du Tchad).',
        fallback: true,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        }
      }
    )
  }
})
