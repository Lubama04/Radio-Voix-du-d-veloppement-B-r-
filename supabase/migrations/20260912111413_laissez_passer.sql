-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table principale des laissez-passer
CREATE TABLE IF NOT EXISTS public.laissez_passer (
  id                      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Token cryptographique aléatoire — jamais l'ID en URL
  verification_token      text UNIQUE NOT NULL
                          DEFAULT encode(gen_random_bytes(32), 'hex'),
  -- Identité
  nom                     text NOT NULL,
  prenoms                 text NOT NULL,
  photo_url               text,
  fonction                text NOT NULL,
  matricule               text UNIQUE NOT NULL,
  categorie               text DEFAULT 'Journaliste',
  telephone_professionnel text,
  observations            text,
  -- Dates
  date_delivrance         date NOT NULL DEFAULT CURRENT_DATE,
  date_expiration         date NOT NULL,
  -- Statut (révocation prioritaire sur expiration)
  statut                  text NOT NULL DEFAULT 'valide'
                          CHECK (statut IN ('valide','expire','revoque')),
  date_revocation         timestamptz,
  motif_revocation        text,
  -- Métriques
  verifications_count     integer DEFAULT 0,
  derniere_verification   timestamptz,
  created_by              uuid,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

-- Journal des vérifications
CREATE TABLE IF NOT EXISTS public.verifications_lp (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lp_id         uuid REFERENCES public.laissez_passer(id) ON DELETE CASCADE,
  token_verifie text NOT NULL,
  resultat      text NOT NULL
                CHECK (resultat IN ('valide','expire','revoque','invalide')),
  ip_partielle  text,  -- 2 premiers octets seulement
  user_agent    text,
  verifie_le    timestamptz DEFAULT now()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_lp_token
  ON public.laissez_passer(verification_token);
CREATE INDEX IF NOT EXISTS idx_lp_statut
  ON public.laissez_passer(statut);
CREATE INDEX IF NOT EXISTS idx_lp_expiration
  ON public.laissez_passer(date_expiration);
CREATE INDEX IF NOT EXISTS idx_verif_lp_id
  ON public.verifications_lp(lp_id);

-- Fonction auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_lp_updated_at ON public.laissez_passer;
CREATE TRIGGER trg_lp_updated_at
  BEFORE UPDATE ON public.laissez_passer
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Fonction de vérification publique (appelée via Edge Function)
-- SECURITY DEFINER : s'exécute avec les droits du propriétaire, pas du public
CREATE OR REPLACE FUNCTION public.verifier_laissez_passer(p_token text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_lp public.laissez_passer%ROWTYPE;
  v_statut text;
BEGIN
  SELECT * INTO v_lp FROM public.laissez_passer
  WHERE verification_token = p_token;

  -- Token inexistant → réponse générique
  IF NOT FOUND THEN
    RETURN json_build_object(
      'authentifie', false, 'statut', 'invalide',
      'message', 'Ce document ne peut pas être authentifié par le système de Radio La Voix du Développement.'
    );
  END IF;

  -- Statut calculé (révocation prioritaire)
  IF v_lp.statut = 'revoque' THEN
    v_statut := 'revoque';
  ELSIF v_lp.date_expiration < CURRENT_DATE THEN
    v_statut := 'expire';
    UPDATE public.laissez_passer SET statut = 'expire'
    WHERE id = v_lp.id AND statut = 'valide';
  ELSE
    v_statut := 'valide';
  END IF;

  -- Incrémenter compteur
  UPDATE public.laissez_passer
  SET verifications_count = verifications_count + 1,
      derniere_verification = now()
  WHERE id = v_lp.id;

  -- Réponse selon statut
  IF v_statut = 'valide' THEN
    RETURN json_build_object(
      'authentifie', true, 'statut', 'valide',
      'nom', v_lp.nom, 'prenoms', v_lp.prenoms,
      'fonction', v_lp.fonction, 'matricule', v_lp.matricule,
      'categorie', v_lp.categorie, 'photo_url', v_lp.photo_url,
      'date_delivrance', v_lp.date_delivrance,
      'date_expiration', v_lp.date_expiration,
      'message', 'Ce laissez-passer a été délivré par Radio La Voix du Développement et est actuellement valide dans son système de vérification.'
    );
  ELSIF v_statut = 'expire' THEN
    RETURN json_build_object(
      'authentifie', false, 'statut', 'expire',
      'nom', v_lp.nom, 'prenoms', v_lp.prenoms,
      'fonction', v_lp.fonction,
      'date_expiration', v_lp.date_expiration,
      'message', 'Ce laissez-passer n''est plus valide en raison du dépassement de sa date d''expiration.'
    );
  ELSE
    RETURN json_build_object(
      'authentifie', false, 'statut', 'revoque',
      'date_revocation', v_lp.date_revocation,
      'message', 'Ce laissez-passer a été révoqué par Radio La Voix du Développement et ne doit plus être considéré comme valide.'
    );
  END IF;
END;
$$;

-- Durcissement : cette fonction ne doit être appelable QUE par l'Edge Function
-- (clé service_role), jamais directement par le client anon/authenticated via
-- PostgREST — sinon le rate-limiting de l'Edge Function serait contournable
-- et l'énumération de tokens ne serait plus limitée.
REVOKE ALL ON FUNCTION public.verifier_laissez_passer(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.verifier_laissez_passer(text) FROM anon;
REVOKE ALL ON FUNCTION public.verifier_laissez_passer(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.verifier_laissez_passer(text) TO service_role;

-- RLS — Table laissez_passer : lecture publique INTERDITE
ALTER TABLE public.laissez_passer ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lp_admin_select" ON public.laissez_passer
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "lp_admin_insert" ON public.laissez_passer
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "lp_admin_update" ON public.laissez_passer
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- RLS — Table vérifications
ALTER TABLE public.verifications_lp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "verif_admin_select" ON public.verifications_lp
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "verif_insert_public" ON public.verifications_lp
  FOR INSERT WITH CHECK (true);

-- Bucket de stockage pour les photos des titulaires
-- Public en lecture (la photo doit s'afficher sur la page de vérification
-- publique quand le laissez-passer est valide) ; écriture réservée aux
-- utilisateurs authentifiés (panneau d'administration).
INSERT INTO storage.buckets (id, name, public)
VALUES ('lp-photos', 'lp-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "lp_photos_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'lp-photos' AND auth.role() = 'authenticated');
CREATE POLICY "lp_photos_admin_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'lp-photos' AND auth.role() = 'authenticated');
CREATE POLICY "lp_photos_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'lp-photos' AND auth.role() = 'authenticated');

-- Premier laissez-passer
INSERT INTO public.laissez_passer
  (nom, prenoms, fonction, matricule, categorie,
   date_delivrance, date_expiration, statut)
VALUES
  ('MERAPENG SABOUR', 'SYLVAIN', 'Coordinateur Général',
   'RVD-2026-001', 'Personnel de direction',
   CURRENT_DATE, (CURRENT_DATE + INTERVAL '1 year')::date, 'valide')
ON CONFLICT (matricule) DO NOTHING;
