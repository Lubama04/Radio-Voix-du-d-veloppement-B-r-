-- Accès en écriture authentifié pour le back-office. Ces tables n'avaient
-- jusqu'ici que des policies publiques (lecture, ou insertion pour les
-- formulaires publics) : aucune policy n'autorisait un utilisateur
-- authentifié (le personnel de la radio) à créer/modifier/supprimer du
-- contenu — le back-office aurait échoué silencieusement sur chaque
-- mutation sans ces policies.

-- Actualités
DROP POLICY IF EXISTS "actualites_admin_insert" ON public.actualites;
CREATE POLICY "actualites_admin_insert" ON public.actualites
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "actualites_admin_update" ON public.actualites;
CREATE POLICY "actualites_admin_update" ON public.actualites
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "actualites_admin_delete" ON public.actualites;
CREATE POLICY "actualites_admin_delete" ON public.actualites
  FOR DELETE USING (auth.role() = 'authenticated');

-- Programmes
DROP POLICY IF EXISTS "programmes_admin_insert" ON public.programmes;
CREATE POLICY "programmes_admin_insert" ON public.programmes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "programmes_admin_update" ON public.programmes;
CREATE POLICY "programmes_admin_update" ON public.programmes
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "programmes_admin_delete" ON public.programmes;
CREATE POLICY "programmes_admin_delete" ON public.programmes
  FOR DELETE USING (auth.role() = 'authenticated');

-- Podcasts
DROP POLICY IF EXISTS "podcasts_admin_insert" ON public.podcasts;
CREATE POLICY "podcasts_admin_insert" ON public.podcasts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "podcasts_admin_update" ON public.podcasts;
CREATE POLICY "podcasts_admin_update" ON public.podcasts
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "podcasts_admin_delete" ON public.podcasts;
CREATE POLICY "podcasts_admin_delete" ON public.podcasts
  FOR DELETE USING (auth.role() = 'authenticated');

-- Agenda (validation d'événements soumis publiquement)
DROP POLICY IF EXISTS "agenda_admin_insert" ON public.agenda;
CREATE POLICY "agenda_admin_insert" ON public.agenda
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "agenda_admin_update" ON public.agenda;
CREATE POLICY "agenda_admin_update" ON public.agenda
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "agenda_admin_delete" ON public.agenda;
CREATE POLICY "agenda_admin_delete" ON public.agenda
  FOR DELETE USING (auth.role() = 'authenticated');

-- Ticker
DROP POLICY IF EXISTS "ticker_admin_insert" ON public.ticker_messages;
CREATE POLICY "ticker_admin_insert" ON public.ticker_messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "ticker_admin_update" ON public.ticker_messages;
CREATE POLICY "ticker_admin_update" ON public.ticker_messages
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "ticker_admin_delete" ON public.ticker_messages;
CREATE POLICY "ticker_admin_delete" ON public.ticker_messages
  FOR DELETE USING (auth.role() = 'authenticated');

-- Galerie
DROP POLICY IF EXISTS "galerie_admin_insert" ON public.galerie;
CREATE POLICY "galerie_admin_insert" ON public.galerie
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "galerie_admin_update" ON public.galerie;
CREATE POLICY "galerie_admin_update" ON public.galerie
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "galerie_admin_delete" ON public.galerie;
CREATE POLICY "galerie_admin_delete" ON public.galerie
  FOR DELETE USING (auth.role() = 'authenticated');

-- Config radio (lecture déjà publique — écriture réservée à l'admin)
DROP POLICY IF EXISTS "config_admin_update" ON public.config_radio;
CREATE POLICY "config_admin_update" ON public.config_radio
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Contacts : aucune lecture n'existait (formulaire public = INSERT only) —
-- l'admin doit pouvoir lire les messages et les marquer comme répondus.
DROP POLICY IF EXISTS "contacts_admin_select" ON public.contacts;
CREATE POLICY "contacts_admin_select" ON public.contacts
  FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "contacts_admin_update" ON public.contacts;
CREATE POLICY "contacts_admin_update" ON public.contacts
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
