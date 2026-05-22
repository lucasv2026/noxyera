BEGIN;

-- ─────────────────────────────────────────────────────────
-- 1. TRIGGER profiles — ajouter prenom/nom depuis metadata
--    et ON CONFLICT pour éviter les doublons
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, email, prenom, nom)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'role', 'client'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'prenom', ''),
    COALESCE(new.raw_user_meta_data->>'nom', '')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email  = EXCLUDED.email,
    prenom = CASE WHEN EXCLUDED.prenom <> '' THEN EXCLUDED.prenom ELSE public.profiles.prenom END,
    nom    = CASE WHEN EXCLUDED.nom    <> '' THEN EXCLUDED.nom    ELSE public.profiles.nom    END;
  RETURN new;
END;
$$;

-- Recréer le trigger (DROP IF EXISTS + CREATE pour être idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─────────────────────────────────────────────────────────
-- 2. TABLE interventions — colonnes manquantes
-- ─────────────────────────────────────────────────────────
ALTER TABLE public.interventions
  ADD COLUMN IF NOT EXISTS offered_at     timestamptz,
  ADD COLUMN IF NOT EXISTS accepted_at    timestamptz,
  ADD COLUMN IF NOT EXISTS refused_at     timestamptz,
  ADD COLUMN IF NOT EXISTS expires_at     timestamptz,
  ADD COLUMN IF NOT EXISTS notes_client   text,
  ADD COLUMN IF NOT EXISTS device_id      text,
  ADD COLUMN IF NOT EXISTS heure_arrivee  timestamptz;

-- ─────────────────────────────────────────────────────────
-- 3. TABLE interventions — contrainte statut complète
-- ─────────────────────────────────────────────────────────
ALTER TABLE public.interventions
  DROP CONSTRAINT IF EXISTS interventions_statut_check;
ALTER TABLE public.interventions
  ADD CONSTRAINT interventions_statut_check
  CHECK (statut IN ('proposee','planifie','en_cours','realise','annule','expire'));

-- ─────────────────────────────────────────────────────────
-- 4. TABLE sites — device_id pour IoT Y3
-- ─────────────────────────────────────────────────────────
ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS device_id text;

-- ─────────────────────────────────────────────────────────
-- 5. TABLE contracts — client_id direct
-- ─────────────────────────────────────────────────────────
ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────
-- 6. TABLE profiles — colonne push_subscription pour PWA
-- ─────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS push_subscription jsonb,
  ADD COLUMN IF NOT EXISTS numero_certibiocide text;

-- ─────────────────────────────────────────────────────────
-- 7. INDEX manquants
-- ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_interventions_expires_at
  ON public.interventions(expires_at);
CREATE INDEX IF NOT EXISTS idx_interventions_offered
  ON public.interventions(statut) WHERE statut = 'proposee';
CREATE INDEX IF NOT EXISTS idx_interventions_technicien_statut
  ON public.interventions(technicien_id, statut);
CREATE INDEX IF NOT EXISTS idx_sites_device_id
  ON public.sites(device_id) WHERE device_id IS NOT NULL;

COMMIT;
