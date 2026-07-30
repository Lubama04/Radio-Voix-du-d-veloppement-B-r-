-- ============================================================
-- RADIO LA VOIX DU DÉVELOPPEMENT DE BÉRÉ — 96.7 FM
-- Migration 001 — Schéma complet initial
-- Standard : Africa Radio / RFI / RadiOCult
-- Auteur   : ETS FLANGUST BUSINESS
-- Date     : Juillet 2026
-- ============================================================

-- Extensions nécessaires
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- recherche full-text

-- ============================================================
-- 1. CONFIG RADIO — Paramètres globaux de la station
-- ============================================================
create table if not exists public.config_radio (
  id          uuid primary key default uuid_generate_v4(),
  cle         text unique not null,
  valeur      text,
  type        text default 'text' check (type in ('text','url','email','phone','boolean','json')),
  description text,
  updated_at  timestamptz default now()
);

-- Données initiales de configuration
insert into public.config_radio (cle, valeur, type, description) values
  ('nom_radio',       'La Voix du Développement de Béré',                           'text',    'Nom officiel de la radio'),
  ('nom_court',       'Voix de Béré',                                                'text',    'Nom court pour les widgets'),
  ('frequence',       '96.7 FM',                                                    'text',    'Fréquence de diffusion'),
  ('slogan',          'La voix qui porte le développement',                          'text',    'Slogan officiel'),
  ('description',     'Radio communautaire au service du développement local de Béré et de la province de la Tandjilé, au Tchad.', 'text', 'Description de la radio'),
  ('stream_url',      '',                                                            'url',     'URL flux streaming HLS/Icecast (à configurer)'),
  ('stream_format',   'icecast',                                                    'text',    'Format stream: icecast ou hls'),
  ('telephone',       '',                                                            'phone',   'Numéro de téléphone principal'),
  ('whatsapp',        '',                                                            'phone',   'Numéro WhatsApp'),
  ('email',           '',                                                            'email',   'Email de contact'),
  ('facebook',        '',                                                            'url',     'URL page Facebook'),
  ('youtube',         '',                                                            'url',     'URL chaîne YouTube'),
  ('tiktok',          '',                                                            'url',     'URL TikTok'),
  ('adresse',         'Béré, Département de la Tandjilé Centre, Province de la Tandjilé, Tchad', 'text', 'Adresse physique'),
  ('ville',           'Béré',                                                        'text',    'Ville'),
  ('province',        'Province de la Tandjilé',                                    'text',    'Province'),
  ('departement',     'Tandjilé Centre',                                            'text',    'Département'),
  ('pays',            'Tchad',                                                       'text',    'Pays'),
  ('latitude',        '9.3167',                                                     'text',    'Latitude GPS du studio'),
  ('longitude',       '16.0833',                                                    'text',    'Longitude GPS du studio'),
  ('annee_creation',  '2010',                                                       'text',    'Année de fondation'),
  ('couleur_primaire','#006400',                                                    'text',    'Couleur verte brand'),
  ('couleur_accent',  '#CC0000',                                                    'text',    'Couleur rouge brand'),
  ('maintenance',     'false',                                                      'boolean', 'Mode maintenance activé'),
  ('ticker_actif',    'true',                                                       'boolean', 'Afficher le ticker d actualités')
on conflict (cle) do nothing;

-- ============================================================
-- 2. CATÉGORIES ACTUALITÉS
-- ============================================================
create table if not exists public.categories_actualites (
  id          serial primary key,
  slug        text unique not null,
  nom_fr      text not null,
  nom_en      text,
  nom_ar      text,
  couleur     text default '#006400',
  icone       text,
  ordre       integer default 1,
  actif       boolean default true,
  created_at  timestamptz default now()
);

insert into public.categories_actualites (slug, nom_fr, nom_en, nom_ar, couleur, icone, ordre) values
  ('local',          'Local',          'Local',           'محلي',         '#006400', 'MapPin',      1),
  ('national',       'National',       'National',        'وطني',         '#004d00', 'Flag',        2),
  ('international',  'International',  'International',   'دولي',         '#003300', 'Globe',       3),
  ('politique',      'Politique',      'Politics',        'سياسة',        '#8B0000', 'Scale',       4),
  ('sante',          'Santé',          'Health',          'صحة',          '#CC0000', 'Heart',       5),
  ('agriculture',    'Agriculture',    'Agriculture',     'زراعة',        '#228B22', 'Sprout',      6),
  ('culture',        'Culture',        'Culture',         'ثقافة',        '#8B4513', 'Music',       7),
  ('sport',          'Sport',          'Sport',           'رياضة',        '#FF8C00', 'Trophy',      8),
  ('education',      'Éducation',      'Education',       'تعليم',        '#4169E1', 'GraduationCap', 9),
  ('religion',       'Religion',       'Religion',        'دين',          '#9400D3', 'BookOpen',   10),
  ('securite',       'Sécurité',       'Security',        'أمن',          '#DC143C', 'Shield',     11),
  ('economie',       'Économie',       'Economy',         'اقتصاد',       '#B8860B', 'TrendingUp', 12),
  ('environnement',  'Environnement',  'Environment',     'بيئة',         '#2E8B57', 'Leaf',       13),
  ('societe',        'Société',        'Society',         'مجتمع',        '#708090', 'Users',      14),
  ('autre',          'Autre',          'Other',           'أخرى',         '#808080', 'MoreHorizontal', 15)
on conflict (slug) do nothing;

-- ============================================================
-- 3. ACTUALITÉS — Articles de presse
-- ============================================================
create table if not exists public.actualites (
  id                uuid primary key default uuid_generate_v4(),
  titre             text not null,
  titre_en          text,
  titre_ar          text,
  slug              text unique,
  contenu           text not null,
  contenu_en        text,
  contenu_ar        text,
  extrait           text,
  categorie_id      integer references public.categories_actualites(id) on delete set null,
  auteur            text default 'Rédaction Voix de Béré',
  source            text,
  image_url         text,
  image_alt         text,
  tags              text[],
  vues              integer default 0,
  partages          integer default 0,
  a_la_une          boolean default false,
  ticker            boolean default false, -- apparaît dans le ticker défilant
  publie            boolean default true,
  date_publication  timestamptz default now(),
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Index pour la recherche full-text
create index if not exists idx_actualites_search
  on public.actualites using gin(to_tsvector('french', titre || ' ' || coalesce(extrait, '') || ' ' || contenu));
create index if not exists idx_actualites_date
  on public.actualites(date_publication desc);
create index if not exists idx_actualites_categorie
  on public.actualites(categorie_id);
create index if not exists idx_actualites_une
  on public.actualites(a_la_une, publie);

-- Fonction auto-génération du slug
create or replace function public.generate_slug(title text)
returns text language plpgsql as $$
begin
  return lower(
    regexp_replace(
      translate(title, 'àâäéèêëîïôöùûüç ÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ', 'aaaeeeeiioouuuc aaaeeeeiiooouuuc'),
      '[^a-z0-9]+', '-', 'g'
    )
  );
end;
$$;

-- Trigger auto-slug sur actualites
create or replace function public.set_actualite_slug()
returns trigger language plpgsql as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := public.generate_slug(new.titre) || '-' || extract(epoch from now())::bigint;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_actualite_slug on public.actualites;
create trigger trg_actualite_slug
  before insert or update on public.actualites
  for each row execute function public.set_actualite_slug();

-- ============================================================
-- 4. CATÉGORIES ÉMISSIONS
-- ============================================================
create table if not exists public.categories_emissions (
  id         serial primary key,
  slug       text unique not null,
  nom_fr     text not null,
  nom_en     text,
  nom_ar     text,
  couleur    text default '#006400',
  icone      text,
  ordre      integer default 1,
  actif      boolean default true
);

insert into public.categories_emissions (slug, nom_fr, nom_en, nom_ar, couleur, icone, ordre) values
  ('information',   'Information',    'News',          'معلومات',    '#CC0000', 'Newspaper',    1),
  ('sante',         'Santé',          'Health',        'صحة',        '#DC143C', 'Heart',        2),
  ('agriculture',   'Agriculture',    'Agriculture',   'زراعة',      '#228B22', 'Sprout',       3),
  ('culture',       'Culture',        'Culture',       'ثقافة',      '#8B4513', 'Music',        4),
  ('jeunesse',      'Jeunesse',       'Youth',         'شباب',       '#4169E1', 'Star',         5),
  ('femme',         'Femme & Famille','Women',         'مرأة',       '#FF69B4', 'Users',        6),
  ('religion',      'Religion',       'Religion',      'دين',        '#9400D3', 'BookOpen',     7),
  ('sport',         'Sport',          'Sport',         'رياضة',      '#FF8C00', 'Trophy',       8),
  ('debat',         'Débat & Tribune','Debate',        'نقاش',       '#006400', 'MessageSquare',9),
  ('education',     'Éducation',      'Education',     'تعليم',      '#4682B4', 'GraduationCap',10),
  ('musique',       'Musique',        'Music',         'موسيقى',     '#8B008B', 'Headphones',  11),
  ('journal',       'Journal parlé',  'News Bulletin', 'نشرة إخبارية','#B22222','Mic',         12),
  ('autre',         'Autre',          'Other',         'أخرى',       '#808080', 'Radio',       13)
on conflict (slug) do nothing;

-- ============================================================
-- 5. ÉMISSIONS — Catalogue des émissions radio
-- ============================================================
create table if not exists public.emissions (
  id              uuid primary key default uuid_generate_v4(),
  titre           text not null,
  titre_en        text,
  titre_ar        text,
  slug            text unique,
  description     text,
  description_en  text,
  description_ar  text,
  categorie_id    integer references public.categories_emissions(id) on delete set null,
  animateur       text,
  co_animateur    text,
  langue          text default 'français' check (langue in ('français','arabe','sara','ngambay','mixte','autre')),
  image_url       text,
  audio_demo_url  text,  -- extrait audio de présentation
  duree_minutes   integer,
  phare           boolean default false, -- émission phare mise en avant
  actif           boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_emissions_categorie on public.emissions(categorie_id);
create index if not exists idx_emissions_phare on public.emissions(phare, actif);

-- ============================================================
-- 6. PROGRAMMES — Grille hebdomadaire
-- ============================================================
create table if not exists public.programmes (
  id            uuid primary key default uuid_generate_v4(),
  emission_id   uuid references public.emissions(id) on delete cascade,
  titre         text not null, -- peut différer du titre émission (spéciale, invité...)
  description   text,
  animateur     text,
  jour_semaine  integer not null check (jour_semaine between 0 and 6), -- 0=Dim, 1=Lun...6=Sam
  heure_debut   time not null,
  heure_fin     time not null,
  categorie_id  integer references public.categories_emissions(id) on delete set null,
  langue        text default 'français',
  recurrent     boolean default true, -- émission régulière ou ponctuelle
  actif         boolean default true,
  saison        text default '2026',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_programmes_jour on public.programmes(jour_semaine, heure_debut);
create index if not exists idx_programmes_actif on public.programmes(actif, jour_semaine);

-- Vue : programme en cours (UTC+1 Tchad)
create or replace view public.programme_en_cours as
select
  p.*,
  e.titre as emission_titre,
  e.image_url as emission_image,
  ce.nom_fr as categorie_nom,
  ce.couleur as categorie_couleur
from public.programmes p
left join public.emissions e on p.emission_id = e.id
left join public.categories_emissions ce on p.categorie_id = ce.id
where p.actif = true
  and p.jour_semaine = extract(dow from now() at time zone 'Africa/Ndjamena')::integer
  and p.heure_debut <= (now() at time zone 'Africa/Ndjamena')::time
  and p.heure_fin > (now() at time zone 'Africa/Ndjamena')::time;

-- ============================================================
-- 7. PODCASTS — Épisodes audio à la demande
-- ============================================================
create table if not exists public.podcasts (
  id              uuid primary key default uuid_generate_v4(),
  emission_id     uuid references public.emissions(id) on delete set null,
  titre           text not null,
  titre_en        text,
  titre_ar        text,
  slug            text unique,
  description     text,
  audio_url       text not null,
  image_url       text,
  duree_secondes  integer,
  taille_octets   bigint,
  format_audio    text default 'mp3' check (format_audio in ('mp3','aac','ogg','wav')),
  categorie_id    integer references public.categories_emissions(id) on delete set null,
  animateur       text,
  langue          text default 'français',
  transcription   text,
  ecoutes         integer default 0,
  telechargements integer default 0,
  featured        boolean default false,
  publie          boolean default true,
  date_diffusion  timestamptz default now(),
  created_at      timestamptz default now()
);

create index if not exists idx_podcasts_date on public.podcasts(date_diffusion desc);
create index if not exists idx_podcasts_emission on public.podcasts(emission_id);
create index if not exists idx_podcasts_featured on public.podcasts(featured, publie);

-- ============================================================
-- 8. JOURNAUX PARLÉS — Bulletins d'information
-- ============================================================
create table if not exists public.journaux_parles (
  id              uuid primary key default uuid_generate_v4(),
  titre           text not null, -- ex: "Journal du matin — 15 juillet 2026"
  horaire         text not null check (horaire in ('matin','midi','soir','nuit','special')),
  heure_diffusion time,
  audio_url       text,
  duree_secondes  integer,
  presentateur    text,
  langue          text default 'français',
  resume          text,
  ecoutes         integer default 0,
  publie          boolean default true,
  date_diffusion  timestamptz default now(),
  created_at      timestamptz default now()
);

create index if not exists idx_journaux_date on public.journaux_parles(date_diffusion desc);
create index if not exists idx_journaux_horaire on public.journaux_parles(horaire, date_diffusion desc);

-- ============================================================
-- 9. AGENDA — Événements locaux Béré / Tandjilé
-- ============================================================
create table if not exists public.agenda (
  id              uuid primary key default uuid_generate_v4(),
  titre           text not null,
  description     text,
  categorie       text check (categorie in (
                    'culturel','sportif','religieux','politique',
                    'commercial','educatif','sante','autre')),
  organisateur    text,
  lieu            text,
  ville           text default 'Béré',
  image_url       text,
  lien_url        text,
  date_debut      timestamptz not null,
  date_fin        timestamptz,
  toute_la_journee boolean default true,
  gratuit         boolean default true,
  prix            text,
  contact         text,
  valide          boolean default false, -- validé par l'admin avant publication
  publie          boolean default true,
  created_at      timestamptz default now()
);

create index if not exists idx_agenda_date on public.agenda(date_debut);
create index if not exists idx_agenda_publie on public.agenda(publie, valide, date_debut);

-- ============================================================
-- 10. PARTENAIRES — Partenaires institutionnels
-- ============================================================
create table if not exists public.partenaires (
  id               uuid primary key default uuid_generate_v4(),
  nom              text not null,
  nom_court        text,
  logo_url         text,
  site_web         text,
  email            text,
  telephone        text,
  description      text,
  type_partenariat text check (type_partenariat in (
                     'financier','technique','editorial','formation',
                     'diffusion','associatif','institutionnel','autre')),
  categorie        text check (categorie in (
                     'onu','ue','gouvernemental','ong','media',
                     'local','prive','autre')),
  pays             text default 'Tchad',
  date_debut       date,
  date_fin         date,
  actif            boolean default true,
  ordre_affichage  integer default 1,
  created_at       timestamptz default now()
);

create index if not exists idx_partenaires_actif on public.partenaires(actif, ordre_affichage);

-- ============================================================
-- 11. PUBLICITÉS — Espaces publicitaires
-- ============================================================
create table if not exists public.publicites (
  id               uuid primary key default uuid_generate_v4(),
  nom_annonceur    text not null,
  titre            text not null,
  description      text,
  type             text check (type in ('banniere','spot_audio','popup','ticker','sponsor')),
  image_url        text,
  audio_url        text,
  lien_url         text,
  position         text check (position in (
                     'header','sidebar','footer','inline',
                     'pre_roll','mid_roll','post_roll')),
  pages_cibles     text[],  -- null = toutes les pages
  date_debut       date not null,
  date_fin         date not null,
  impressions      integer default 0,
  clics            integer default 0,
  budget_fcfa      integer,
  actif            boolean default true,
  ordre_affichage  integer default 1,
  created_at       timestamptz default now()
);

create index if not exists idx_pub_dates on public.publicites(actif, date_debut, date_fin);

-- ============================================================
-- 12. CONTACTS — Formulaire de contact
-- ============================================================
create table if not exists public.contacts (
  id          uuid primary key default uuid_generate_v4(),
  nom         text not null,
  telephone   text,
  email       text,
  objet       text check (objet in (
                'information','partenariat','publicite',
                'programme','plainte','autre')),
  message     text not null,
  ip_address  text,
  user_agent  text,
  lu          boolean default false,
  repondu     boolean default false,
  notes_admin text,
  created_at  timestamptz default now()
);

create index if not exists idx_contacts_lu on public.contacts(lu, created_at desc);

-- ============================================================
-- 13. NEWSLETTER — Abonnés
-- ============================================================
create table if not exists public.newsletter_abonnes (
  id              uuid primary key default uuid_generate_v4(),
  email           text unique not null,
  nom             text,
  langue_pref     text default 'fr' check (langue_pref in ('fr','en','ar')),
  categories      text[],  -- catégories d'intérêt
  confirme        boolean default false,
  token_confirm   text unique default encode(gen_random_bytes(32), 'hex'),
  desabonne       boolean default false,
  date_abonnement timestamptz default now(),
  date_confirmation timestamptz,
  created_at      timestamptz default now()
);

create index if not exists idx_newsletter_email on public.newsletter_abonnes(email);
create index if not exists idx_newsletter_actif on public.newsletter_abonnes(confirme, desabonne);

-- ============================================================
-- 14. PUSH SUBSCRIPTIONS — Notifications PWA
-- ============================================================
create table if not exists public.push_subscriptions (
  id          uuid primary key default uuid_generate_v4(),
  endpoint    text unique not null,
  p256dh      text not null,
  auth        text not null,
  user_agent  text,
  langue      text default 'fr',
  actif       boolean default true,
  created_at  timestamptz default now(),
  last_used   timestamptz
);

-- ============================================================
-- 15. TICKER — Messages du fil défilant
-- ============================================================
create table if not exists public.ticker_messages (
  id          uuid primary key default uuid_generate_v4(),
  texte       text not null,
  lien_url    text,
  priorite    integer default 1 check (priorite between 1 and 5),
  actif       boolean default true,
  date_debut  timestamptz default now(),
  date_fin    timestamptz,
  created_at  timestamptz default now()
);

-- ============================================================
-- 16. GALERIE — Photos et médias
-- ============================================================
create table if not exists public.galerie (
  id          uuid primary key default uuid_generate_v4(),
  titre       text not null,
  description text,
  url         text not null,
  thumbnail   text,
  categorie   text check (categorie in (
                'studio','terrain','evenements','equipe','archive','autre')),
  legende     text,
  auteur      text,
  date_prise  date,
  ordre       integer default 1,
  publie      boolean default true,
  created_at  timestamptz default now()
);

create index if not exists idx_galerie_categorie on public.galerie(categorie, publie);

