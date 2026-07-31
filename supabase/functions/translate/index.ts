import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const LIBRETRANSLATE_URL = 'https://libretranslate.com/translate'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, source = 'fr', target } = await req.json()

    if (!text || !target) {
      return new Response(
        JSON.stringify({ error: 'text et target sont requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Clé API LibreTranslate optionnelle : libretranslate.com exige désormais une clé
    // (voir portal.libretranslate.com) pour son instance publique. Si LIBRETRANSLATE_API_KEY
    // est configurée comme secret de la fonction, elle est incluse automatiquement ;
    // sinon la requête part sans clé (échouera probablement, mais le fallback ci-dessous
    // garde le site fonctionnel dans tous les cas).
    const apiKey = Deno.env.get('LIBRETRANSLATE_API_KEY')

    // Appel LibreTranslate instance publique — sans clé API
    const response = await fetch(LIBRETRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: source,
        target: target,
        format: 'text',
        ...(apiKey ? { api_key: apiKey } : {}),
      })
    })

    if (!response.ok) {
      throw new Error(`LibreTranslate erreur: ${response.status}`)
    }

    const data = await response.json()

    return new Response(
      JSON.stringify({ translatedText: data.translatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    // En cas d'échec de LibreTranslate, retourner le texte original
    // Le site reste fonctionnel même si la traduction échoue
    console.error('Erreur traduction:', error)
    return new Response(
      JSON.stringify({ error: error.message, fallback: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
