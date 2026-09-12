import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, x-application-name',
}

// Rate limiting simple en mémoire
// Limite : suffisant pour dissuader l'énumération de tokens, mais purement
// best-effort — une instance Edge Function n'a pas de mémoire partagée
// garantie entre isolats/régions. Le vrai verrou est le REVOKE sur la
// fonction SQL sous-jacente (voir migration), qui empêche tout contournement
// direct de cette fonction via l'API PostgREST.
const attempts = new Map<string, { count: number; reset: number }>()
const LIMIT = 20     // max 20 requêtes
const WINDOW = 60000 // par minute par IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || now > entry.reset) {
    attempts.set(ip, { count: 1, reset: now + WINDOW })
    return true
  }
  if (entry.count >= LIMIT) return false
  entry.count++
  return true
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  // IP partielle pour rate limiting (2 premiers octets)
  const ip = req.headers.get('x-forwarded-for')?.split('.').slice(0,2).join('.') || 'unknown'

  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: 'Trop de requêtes. Réessayez dans une minute.' }),
      { status: 429, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { token } = await req.json()

    if (!token || typeof token !== 'string' || token.length < 32) {
      return new Response(
        JSON.stringify({
          authentifie: false, statut: 'invalide',
          message: 'Ce document ne peut pas être authentifié.'
        }),
        { headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Appeler la fonction sécurisée
    const { data, error } = await supabase
      .rpc('verifier_laissez_passer', { p_token: token })

    if (error) throw error

    // Journaliser la vérification
    const resultat = data?.statut || 'invalide'
    if (data?.statut !== undefined) {
      const lpQuery = await supabase
        .from('laissez_passer')
        .select('id')
        .eq('verification_token', token)
        .single()

      if (lpQuery.data) {
        await supabase.from('verifications_lp').insert({
          lp_id: lpQuery.data.id,
          token_verifie: token.substring(0, 8) + '...',
          resultat: resultat,
          ip_partielle: ip,
          user_agent: req.headers.get('user-agent')?.substring(0, 100) || ''
        })
      }
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('verify-pass error:', error)
    return new Response(
      JSON.stringify({
        authentifie: false, statut: 'invalide',
        message: 'Ce document ne peut pas être authentifié.'
      }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }
})
