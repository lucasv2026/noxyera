ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS type text DEFAULT 'estimateur',
  ADD COLUMN IF NOT EXISTS photos_url text[],
  ADD COLUMN IF NOT EXISTS disponibilites text,
  ADD COLUMN IF NOT EXISTS situation_actuelle jsonb,
  ADD COLUMN IF NOT EXISTS superficie_m2 integer,
  ADD COLUMN IF NOT EXISTS employes integer,
  ADD COLUMN IF NOT EXISTS prestataire_actuel boolean;
