-- Autoriser la suppression définitive d'un laissez-passer par un admin.
DROP POLICY IF EXISTS "lp_admin_delete" ON public.laissez_passer;
CREATE POLICY "lp_admin_delete"
  ON public.laissez_passer FOR DELETE
  USING (auth.role() = 'authenticated');

-- Lecture publique explicite des photos lp-photos. Le bucket est déjà
-- public (les URLs publiques contournent RLS), mais on rend la policy
-- explicite en défense en profondeur / documentation du comportement
-- attendu, comme demandé.
DROP POLICY IF EXISTS "lp_photos_public_read" ON storage.objects;
CREATE POLICY "lp_photos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lp-photos');
