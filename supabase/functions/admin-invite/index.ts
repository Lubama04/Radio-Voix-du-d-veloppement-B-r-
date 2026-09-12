import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
}

// Invite un nouvel administrateur. Doit tourner côté serveur : inviter un
// utilisateur exige la clé service_role (auth.admin.*), qui ne doit jamais
// être exposée au navigateur. verify_jwt=true côté déploiement garantit
// qu'un JWT valide est présent ; on vérifie en plus explicitement que
// l'appelant est un super_admin actif avant d'agir.
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  try {
    const authHeader = req.headers.get('authorization') || ''
    const jwt = authHeader.replace('Bearer ', '')
    if (!jwt) {
      return new Response(JSON.stringify({ error: 'Non authentifié.' }),
        { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: { user: caller }, error: callerErr } = await admin.auth.getUser(jwt)
    if (callerErr || !caller) {
      return new Response(JSON.stringify({ error: 'Session invalide.' }),
        { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const { data: callerRow } = await admin.from('admin_users').select('role, actif').eq('id', caller.id).single()
    if (!callerRow?.actif || callerRow.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Seul un super administrateur peut inviter.' }),
        { status: 403, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const { email, nom, role } = await req.json()
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email requis.' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const { count } = await admin.from('admin_users').select('id', { count: 'exact', head: true }).eq('actif', true)
    if ((count ?? 0) >= 3) {
      return new Response(JSON.stringify({ error: 'Limite de 3 administrateurs actifs atteinte.' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email)
    if (inviteErr || !invited?.user) {
      return new Response(JSON.stringify({ error: inviteErr?.message || "Échec de l'invitation." }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const { error: insertErr } = await admin.from('admin_users').insert({
      id: invited.user.id, email, nom: nom || email, role: role || 'editeur', actif: true,
    })
    if (insertErr) {
      return new Response(JSON.stringify({ error: insertErr.message }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ success: true }),
      { headers: { ...cors, 'Content-Type': 'application/json' } })

  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
