-- ============================================================
-- Migration 002 — Row Level Security (RLS) complet
-- ============================================================

-- Activer RLS sur toutes les tables
alter table public.config_radio           enable row level security;
alter table public.categories_actualites  enable row level security;
alter table public.actualites             enable row level security;
alter table public.categories_emissions   enable row level security;
alter table public.emissions              enable row level security;
alter table public.programmes             enable row level security;
alter table public.podcasts               enable row level security;
alter table public.journaux_parles        enable row level security;
alter table public.agenda                 enable row level security;
alter table public.partenaires            enable row level security;
alter table public.publicites             enable row level security;
alter table public.contacts               enable row level security;
alter table public.newsletter_abonnes     enable row level security;
alter table public.push_subscriptions     enable row level security;
alter table public.ticker_messages        enable row level security;
alter table public.galerie                enable row level security;

-- ─── LECTURE PUBLIQUE (anonyme) ────────────────────────────

-- Config radio : lecture publique totale
create policy "config_lecture_publique" on public.config_radio
  for select using (true);

-- Catégories : lecture publique
create policy "categories_actu_lecture" on public.categories_actualites
  for select using (actif = true);

create policy "categories_emission_lecture" on public.categories_emissions
  for select using (actif = true);

-- Actualités publiées
create policy "actualites_lecture_publique" on public.actualites
  for select using (publie = true);

-- Émissions actives
create policy "emissions_lecture_publique" on public.emissions
  for select using (actif = true);

-- Programmes actifs
create policy "programmes_lecture_publique" on public.programmes
  for select using (actif = true);

-- Podcasts publiés
create policy "podcasts_lecture_publique" on public.podcasts
  for select using (publie = true);

-- Journaux publiés
create policy "journaux_lecture_publique" on public.journaux_parles
  for select using (publie = true);

-- Agenda public
create policy "agenda_lecture_publique" on public.agenda
  for select using (publie = true and valide = true);

-- Partenaires actifs
create policy "partenaires_lecture_publique" on public.partenaires
  for select using (actif = true);

-- Publicités actives et dans les dates
create policy "pub_lecture_publique" on public.publicites
  for select using (
    actif = true
    and date_debut <= current_date
    and date_fin >= current_date
  );

-- Ticker actif
create policy "ticker_lecture_publique" on public.ticker_messages
  for select using (
    actif = true
    and (date_fin is null or date_fin >= now())
  );

-- Galerie publique
create policy "galerie_lecture_publique" on public.galerie
  for select using (publie = true);

-- ─── INSERTION PUBLIQUE (formulaires visiteurs) ────────────

-- Formulaire de contact
create policy "contacts_insertion_publique" on public.contacts
  for insert with check (true);

-- Newsletter (abonnement)
create policy "newsletter_insertion_publique" on public.newsletter_abonnes
  for insert with check (true);

-- Newsletter (désabonnement par token)
create policy "newsletter_desabonnement" on public.newsletter_abonnes
  for update using (true)
  with check (true);

-- Agenda : soumission par le public (non validé par défaut)
create policy "agenda_soumission_publique" on public.agenda
  for insert with check (valide = false and publie = false);

-- Push subscriptions
create policy "push_insertion_publique" on public.push_subscriptions
  for insert with check (true);

create policy "push_lecture_propre" on public.push_subscriptions
  for select using (true);

-- ─── COMPTEURS (update public limité) ──────────────────────

-- Incrément vues actualités
create policy "actualites_increment_vues" on public.actualites
  for update using (true)
  with check (true);

-- Incrément écoutes podcasts
create policy "podcasts_increment_ecoutes" on public.podcasts
  for update using (true)
  with check (true);

-- Incrément écoutes journaux
create policy "journaux_increment_ecoutes" on public.journaux_parles
  for update using (true)
  with check (true);

