export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// Les types métier (Actualite, Programme, ...) sont des interfaces "propres" sans
// index signature. Le client supabase-js exige que Row/Insert/Update soient
// structurellement assignables à Record<string, unknown> (voir GenericTable dans
// @supabase/postgrest-js) : l'intersection avec Record<string, unknown> le garantit
// sans avoir à ajouter une index signature à chaque interface.
type Row<T>    = T & Record<string, unknown>
type Ins<T, K extends keyof T = never> = Omit<T, 'id'|'created_at'|K> & Record<string, unknown>
type Upd<T>    = Partial<T> & Record<string, unknown>

export interface Database {
  public: {
    Tables: {
      actualites: { Row: Row<Actualite>; Insert: Ins<Actualite>; Update: Upd<Actualite>; Relationships: [] }
      programmes: { Row: Row<Programme>; Insert: Ins<Programme>; Update: Upd<Programme>; Relationships: [] }
      podcasts:   { Row: Row<Podcast>;   Insert: Ins<Podcast>;   Update: Upd<Podcast>; Relationships: [] }
      journaux_parles: { Row: Row<Journal>; Insert: Ins<Journal>; Update: Upd<Journal>; Relationships: [] }
      agenda:     { Row: Row<Evenement>; Insert: Ins<Evenement>; Update: Upd<Evenement>; Relationships: [] }
      contacts:   { Row: Row<Contact>;   Insert: Ins<Contact>;   Update: Upd<Contact>; Relationships: [] }
      partenaires:{ Row: Row<Partenaire>; Insert: Ins<Partenaire>; Update: Upd<Partenaire>; Relationships: [] }
      config_radio:{ Row: Row<ConfigRadio>; Insert: Omit<ConfigRadio,'id'> & Record<string, unknown>; Update: Upd<ConfigRadio>; Relationships: [] }
      ticker_messages: { Row: Row<TickerMsg>; Insert: Ins<TickerMsg>; Update: Upd<TickerMsg>; Relationships: [] }
      galerie:    { Row: Row<GalerieItem>; Insert: Ins<GalerieItem>; Update: Upd<GalerieItem>; Relationships: [] }
      newsletter_abonnes: { Row: Row<NewsletterAbonne>; Insert: Ins<NewsletterAbonne>; Update: Upd<NewsletterAbonne>; Relationships: [] }
      categories_actualites: { Row: Row<CategorieActu>; Insert: Omit<CategorieActu,'id'> & Record<string, unknown>; Update: Upd<CategorieActu>; Relationships: [] }
      categories_emissions: { Row: Row<CategorieEmission>; Insert: Omit<CategorieEmission,'id'> & Record<string, unknown>; Update: Upd<CategorieEmission>; Relationships: [] }
      emissions:  { Row: Row<Emission>; Insert: Ins<Emission>; Update: Upd<Emission>; Relationships: [] }
    }
    Views: {
      v_actualites: { Row: Row<ActualiteView>; Relationships: [] }
      v_podcasts:   { Row: Row<PodcastView>; Relationships: [] }
      v_programmes: { Row: Row<ProgrammeView>; Relationships: [] }
      v_agenda:     { Row: Row<Evenement>; Relationships: [] }
      v_ticker:     { Row: Row<TickerMsg>; Relationships: [] }
    }
    Functions: {
      incrementer_vues: { Args: { article_id: string }; Returns: undefined }
      incrementer_ecoutes_podcast: { Args: { podcast_id: string }; Returns: undefined }
      incrementer_ecoutes_journal: { Args: { journal_id: string }; Returns: undefined }
      rechercher_actualites: { Args: { terme: string }; Returns: ActualiteView[] }
      get_config_radio: { Args: Record<string, never>; Returns: Record<string, string> }
      desabonner_newsletter: { Args: { p_token: string }; Returns: boolean }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export interface Actualite {
  id: string; titre: string; titre_en?: string; titre_ar?: string
  slug?: string; contenu: string; extrait?: string
  categorie_id?: number; auteur?: string; image_url?: string; image_alt?: string
  vues: number; a_la_une: boolean; ticker: boolean; publie: boolean
  date_publication: string; created_at: string; updated_at: string
}

export interface ActualiteView extends Actualite {
  categorie_slug?: string; categorie_nom?: string
  categorie_couleur?: string; categorie_icone?: string
}

export interface CategorieActu {
  id: number; slug: string; nom_fr: string; nom_en?: string; nom_ar?: string
  couleur: string; icone?: string; ordre: number; actif: boolean; created_at: string
}

export interface CategorieEmission {
  id: number; slug: string; nom_fr: string; nom_en?: string; nom_ar?: string
  couleur: string; icone?: string; ordre: number; actif: boolean
}

export interface Emission {
  id: string; titre: string; description?: string
  categorie_id?: number; animateur?: string; langue: string
  image_url?: string; phare: boolean; actif: boolean
  created_at: string; updated_at: string
}

export interface Programme {
  id: string; emission_id?: string; titre: string
  animateur?: string; jour_semaine: number
  heure_debut: string; heure_fin: string
  categorie_id?: number; langue: string; actif: boolean
  created_at: string; updated_at: string
}

export interface ProgrammeView extends Programme {
  emission_titre?: string; emission_image?: string
  categorie_slug?: string; categorie_nom?: string
  categorie_couleur?: string; categorie_icone?: string; phare?: boolean
}

export interface Podcast {
  id: string; emission_id?: string; titre: string; slug?: string
  description?: string; audio_url: string; image_url?: string
  duree_secondes?: number; categorie_id?: number; animateur?: string
  langue: string; ecoutes: number; featured: boolean; publie: boolean
  date_diffusion: string; created_at: string
}

export interface PodcastView extends Podcast {
  emission_titre?: string; emission_image?: string
  categorie_nom?: string; categorie_couleur?: string; categorie_icone?: string
}

export interface Journal {
  id: string; titre: string; horaire: 'matin'|'midi'|'soir'|'nuit'|'special'
  heure_diffusion?: string; audio_url?: string; duree_secondes?: number
  presentateur?: string; langue: string; resume?: string
  ecoutes: number; publie: boolean; date_diffusion: string; created_at: string
}

export interface Evenement {
  id: string; titre: string; description?: string
  categorie?: string; organisateur?: string; lieu?: string; ville: string
  image_url?: string; lien_url?: string; date_debut: string; date_fin?: string
  toute_la_journee: boolean; gratuit: boolean; prix?: string; contact?: string
  valide: boolean; publie: boolean; created_at: string
}

export interface Partenaire {
  id: string; nom: string; nom_court?: string; logo_url?: string
  site_web?: string; email?: string; telephone?: string; description?: string
  type_partenariat?: string; categorie?: string; pays: string
  actif: boolean; ordre_affichage: number; created_at: string
}

export interface Contact {
  id: string; nom: string; telephone?: string; email?: string
  objet?: string; message: string; lu: boolean; repondu: boolean
  created_at: string
}

export interface NewsletterAbonne {
  id: string; email: string; nom?: string; langue_pref: string
  confirme: boolean; desabonne: boolean; created_at: string
}

export interface ConfigRadio {
  id: string; cle: string; valeur?: string; type?: string; description?: string
}

export interface TickerMsg {
  id: string; texte: string; lien_url?: string
  priorite: number; actif: boolean; date_debut: string; date_fin?: string; created_at: string
}

export interface GalerieItem {
  id: string; titre: string; description?: string; url: string
  thumbnail?: string; categorie?: string; legende?: string
  auteur?: string; date_prise?: string; ordre: number; publie: boolean; created_at: string
}
