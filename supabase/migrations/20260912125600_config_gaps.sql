-- Gaps découverts en construisant le back-office :
-- 1) broadcast_config avait RLS activé sans aucune policy (créée dans une
--    migration précédente) — l'admin ne pouvait ni lire ni écrire dessus.
-- 2) config_radio ne connaissait pas encore les clés stream_primary /
--    stream_backup utilisées par la page Configuration.

DROP POLICY IF EXISTS "broadcast_config_admin_select" ON public.broadcast_config;
CREATE POLICY "broadcast_config_admin_select" ON public.broadcast_config
  FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "broadcast_config_admin_update" ON public.broadcast_config;
CREATE POLICY "broadcast_config_admin_update" ON public.broadcast_config
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

INSERT INTO public.config_radio (cle, valeur, description, type) VALUES
  ('stream_primary', '', 'URL du flux de streaming principal (référence — voir VITE_STREAM_PRIMARY)', 'text'),
  ('stream_backup', '', 'URL du flux de streaming de secours (référence — voir VITE_STREAM_BACKUP)', 'text')
ON CONFLICT (cle) DO NOTHING;
