-- ============================================================
-- Migration 004 — Fonctions utilitaires et vues
-- ============================================================

-- Vue : dernières actualités avec catégorie
create or replace view public.v_actualites as
select
  a.id, a.titre, a.slug, a.extrait, a.image_url, a.auteur,
  a.vues, a.partages, a.a_la_une, a.ticker,
  a.date_publication, a.created_at,
  c.slug as categorie_slug,
  c.nom_fr as categorie_nom,
  c.couleur as categorie_couleur,
  c.icone as categorie_icone
from public.actualites a
left join public.categories_actualites c on a.categorie_id = c.id
where a.publie = true
order by a.date_publication desc;

-- Vue : podcasts avec info émission
create or replace view public.v_podcasts as
select
  p.id, p.titre, p.slug, p.description, p.audio_url,
  p.image_url, p.duree_secondes, p.ecoutes, p.featured,
  p.date_diffusion, p.animateur, p.langue,
  e.titre as emission_titre,
  e.image_url as emission_image,
  c.nom_fr as categorie_nom,
  c.couleur as categorie_couleur,
  c.icone as categorie_icone
from public.podcasts p
left join public.emissions e on p.emission_id = e.id
left join public.categories_emissions c on p.categorie_id = c.id
where p.publie = true
order by p.date_diffusion desc;

-- Vue : grille complète avec info émission
create or replace view public.v_programmes as
select
  p.id, p.titre, p.animateur, p.jour_semaine,
  p.heure_debut, p.heure_fin, p.langue, p.recurrent,
  e.id as emission_id,
  e.titre as emission_titre,
  e.description as emission_description,
  e.image_url as emission_image,
  e.phare,
  c.slug as categorie_slug,
  c.nom_fr as categorie_nom,
  c.couleur as categorie_couleur,
  c.icone as categorie_icone
from public.programmes p
left join public.emissions e on p.emission_id = e.id
left join public.categories_emissions c on p.categorie_id = c.id
where p.actif = true
order by p.jour_semaine, p.heure_debut;

-- Vue : agenda à venir
create or replace view public.v_agenda as
select *
from public.agenda
where publie = true
  and valide = true
  and (date_fin is null or date_fin >= now())
order by date_debut asc;

-- Vue : ticker actif
create or replace view public.v_ticker as
select texte, lien_url, priorite
from public.ticker_messages
where actif = true
  and (date_fin is null or date_fin >= now())
order by priorite desc, created_at desc;

-- Fonction : incrémenter les vues d'un article
create or replace function public.incrementer_vues(article_id uuid)
returns void language sql security definer as $$
  update public.actualites set vues = vues + 1 where id = article_id;
$$;

-- Fonction : incrémenter les écoutes d'un podcast
create or replace function public.incrementer_ecoutes_podcast(podcast_id uuid)
returns void language sql security definer as $$
  update public.podcasts set ecoutes = ecoutes + 1 where id = podcast_id;
$$;

-- Fonction : incrémenter les écoutes d'un journal
create or replace function public.incrementer_ecoutes_journal(journal_id uuid)
returns void language sql security definer as $$
  update public.journaux_parles set ecoutes = ecoutes + 1 where id = journal_id;
$$;

-- Fonction : recherche full-text articles
create or replace function public.rechercher_actualites(terme text)
returns table (
  id uuid, titre text, slug text, extrait text,
  image_url text, categorie_nom text, categorie_couleur text,
  date_publication timestamptz, rang float4
) language sql as $$
  select
    a.id, a.titre, a.slug, a.extrait,
    a.image_url, c.nom_fr, c.couleur,
    a.date_publication,
    ts_rank(to_tsvector('french', a.titre || ' ' || coalesce(a.extrait,'') || ' ' || a.contenu),
            plainto_tsquery('french', terme)) as rang
  from public.actualites a
  left join public.categories_actualites c on a.categorie_id = c.id
  where a.publie = true
    and to_tsvector('french', a.titre || ' ' || coalesce(a.extrait,'') || ' ' || a.contenu)
        @@ plainto_tsquery('french', terme)
  order by rang desc, a.date_publication desc
  limit 20;
$$;

-- Fonction : config radio comme objet JSON
create or replace function public.get_config_radio()
returns json language sql as $$
  select json_object_agg(cle, valeur)
  from public.config_radio;
$$;

