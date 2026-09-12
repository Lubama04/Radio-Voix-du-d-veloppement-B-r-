-- Rôles admin (max 3 utilisateurs actifs)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  nom         text NOT NULL,
  role        text NOT NULL DEFAULT 'editeur'
              CHECK (role IN ('super_admin','admin','editeur')),
  actif       boolean DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Audit log — qui a fait quoi et quand
CREATE TABLE IF NOT EXISTS public.audit_log (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid REFERENCES auth.users(id),
  user_email  text,
  action      text NOT NULL,
  table_name  text,
  record_id   text,
  details     jsonb,
  created_at  timestamptz DEFAULT now()
);

-- Médiathèque centralisée
CREATE TABLE IF NOT EXISTS public.mediatheque (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom         text NOT NULL,
  url         text NOT NULL,
  type        text CHECK (type IN ('image','document','audio','video')),
  taille      bigint,
  bucket      text DEFAULT 'mediatheque',
  chemin      text,
  tags        text[],
  uploaded_by uuid REFERENCES auth.users(id),
  created_at  timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_table ON public.audit_log(table_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_type ON public.mediatheque(type);

-- RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mediatheque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_users_select" ON public.admin_users
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin_users_super_insert" ON public.admin_users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "admin_users_super_update" ON public.admin_users
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "audit_select" ON public.audit_log
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "audit_insert" ON public.audit_log
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "media_select" ON public.mediatheque
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "media_insert" ON public.mediatheque
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "media_update" ON public.mediatheque
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "media_delete_policy" ON public.mediatheque
  FOR DELETE USING (auth.role() = 'authenticated');

-- Fonction : vérifier limite 3 admins actifs
CREATE OR REPLACE FUNCTION public.check_admin_limit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.admin_users WHERE actif = true) >= 3 THEN
    RAISE EXCEPTION 'Limite de 3 administrateurs actifs atteinte.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_admin_limit ON public.admin_users;
CREATE TRIGGER trg_check_admin_limit
  BEFORE INSERT ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.check_admin_limit();

-- Premier admin (no-op tant que le compte Auth n'existe pas encore)
INSERT INTO public.admin_users (id, email, nom, role)
SELECT id, email, 'ETS FLANGUST BUSINESS', 'super_admin'
FROM auth.users
WHERE email = 'contact@flaugustbusiness.com'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Bucket Supabase Storage pour la médiathèque.
-- Public en lecture (comme lp-photos) : ce bucket alimente les images
-- d'articles, podcasts, etc. affichées sur le site public — un bucket
-- privé les rendrait invisibles pour les visiteurs. Écriture réservée
-- aux utilisateurs authentifiés (voir policies storage.objects ci-dessous).
INSERT INTO storage.buckets (id, name, public)
VALUES ('mediatheque', 'mediatheque', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy storage médiathèque (authentifiés seulement)
DROP POLICY IF EXISTS "media_upload" ON storage.objects;
CREATE POLICY "media_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'mediatheque' AND auth.role() = 'authenticated'
  );
DROP POLICY IF EXISTS "media_read" ON storage.objects;
CREATE POLICY "media_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'mediatheque' AND auth.role() = 'authenticated'
  );
DROP POLICY IF EXISTS "media_delete" ON storage.objects;
CREATE POLICY "media_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'mediatheque' AND auth.role() = 'authenticated'
  );
