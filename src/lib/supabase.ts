import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnon) {
  throw new Error('Variables Supabase manquantes dans .env')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnon, {
  auth: {
    persistSession:       false, // pas d'auth côté public
    autoRefreshToken:     false,
    detectSessionInUrl:   false,
  },
  global: {
    headers: { 'x-application-name': 'voix-bere-pwa' }
  }
})

// ─── HELPERS TYPÉS ───────────────────────────────────────────
export const db = {
  actualites:        () => supabase.from('actualites'),
  programmes:        () => supabase.from('programmes'),
  podcasts:          () => supabase.from('podcasts'),
  journauxParles:    () => supabase.from('journaux_parles'),
  agenda:            () => supabase.from('agenda'),
  partenaires:       () => supabase.from('partenaires'),
  contacts:          () => supabase.from('contacts'),
  newsletter:        () => supabase.from('newsletter_abonnes'),
  ticker:            () => supabase.from('ticker_messages'),
  galerie:           () => supabase.from('galerie'),
  config:            () => supabase.from('config_radio'),
  categoriesActu:    () => supabase.from('categories_actualites'),
  categoriesEmission:() => supabase.from('categories_emissions'),
  emissions:         () => supabase.from('emissions'),

  // Vues
  vActualites: () => supabase.from('v_actualites'),
  vPodcasts:   () => supabase.from('v_podcasts'),
  vProgrammes: () => supabase.from('v_programmes'),
  vAgenda:     () => supabase.from('v_agenda'),
  vTicker:     () => supabase.from('v_ticker'),

  // Fonctions RPC
  incrementerVues:    (id: string) => supabase.rpc('incrementer_vues', { article_id: id }),
  incrementerEcoutes: (id: string) => supabase.rpc('incrementer_ecoutes_podcast', { podcast_id: id }),
  rechercherActus:    (terme: string) => supabase.rpc('rechercher_actualites', { terme }),
  getConfig:          () => supabase.rpc('get_config_radio'),
}
