-- ============================================================
-- Migration 005 — Durcissement sécurité RLS (audit OWASP A01)
-- ============================================================
-- Constat : les policies UPDATE "using (true) with check (true)"
-- ajoutées en 002 pour permettre l'incrément public des compteurs
-- (vues, écoutes) autorisaient en réalité N'IMPORTE QUEL client
-- muni de la clé anon à réécrire N'IMPORTE QUELLE colonne des
-- tables actualites / podcasts / journaux_parles (titre, contenu,
-- statut publié...), puisque RLS ne restreint pas les colonnes.
-- Les fonctions RPC security definer (incrementer_vues, etc.)
-- s'exécutent déjà avec les droits du propriétaire de la table et
-- n'ont donc pas besoin de ces policies pour fonctionner : on peut
-- les supprimer sans rien casser côté frontend.
-- ============================================================

drop policy if exists "actualites_increment_vues"     on public.actualites;
drop policy if exists "podcasts_increment_ecoutes"    on public.podcasts;
drop policy if exists "journaux_increment_ecoutes"    on public.journaux_parles;

-- ─── push_subscriptions : lecture publique retirée ──────────
-- push_lecture_propre exposait les endpoints + clés p256dh/auth
-- de TOUS les abonnés aux notifications à quiconque possède la
-- clé anon (fuite de secrets Web Push, usurpation possible).
-- Le front n'a besoin que d'INSERT (souscription) ; toute lecture
-- doit passer par le rôle service, jamais par l'anon key.
drop policy if exists "push_lecture_propre" on public.push_subscriptions;

-- ─── newsletter : désabonnement par jeton, pas en clair ─────
-- newsletter_desabonnement ("using (true) with check (true)")
-- permettait de modifier N'IMPORTE QUEL abonné (email, statut...)
-- sans connaître son token. Remplacé par une fonction dédiée qui
-- vérifie le token_confirm avant toute modification.
drop policy if exists "newsletter_desabonnement" on public.newsletter_abonnes;

create or replace function public.desabonner_newsletter(p_token text)
returns boolean language plpgsql security definer as $$
declare
  v_updated int;
begin
  update public.newsletter_abonnes
  set desabonne = true
  where token_confirm = p_token;
  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$$;

revoke all on function public.desabonner_newsletter(text) from public;
grant execute on function public.desabonner_newsletter(text) to anon, authenticated;

-- ─── contacts : garde-fous anti-abus sur les insertions ─────
alter table public.contacts
  add constraint contacts_nom_longueur     check (char_length(nom) between 1 and 200),
  add constraint contacts_message_longueur check (char_length(message) between 1 and 5000);

alter table public.newsletter_abonnes
  add constraint newsletter_email_longueur check (char_length(email) <= 320);
