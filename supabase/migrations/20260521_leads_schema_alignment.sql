-- Alignement schéma table leads avec les colonnes envoyées par l'API estimateur
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS secteur text,
  ADD COLUMN IF NOT EXISTS superficie integer,
  ADD COLUMN IF NOT EXISTS frequence integer,
  ADD COLUMN IF NOT EXISTS curatives boolean,
  ADD COLUMN IF NOT EXISTS prix_estime numeric,
  ADD COLUMN IF NOT EXISTS formule_suggeree text,
  ADD COLUMN IF NOT EXISTS nom_etablissement text,
  ADD COLUMN IF NOT EXISTS score_global numeric,
  ADD COLUMN IF NOT EXISTS type text DEFAULT 'estimateur',
  ADD COLUMN IF NOT EXISTS photos_url text[],
  ADD COLUMN IF NOT EXISTS disponibilites text,
  ADD COLUMN IF NOT EXISTS situation_actuelle jsonb;

-- Vérification (optionnel)
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'leads';
