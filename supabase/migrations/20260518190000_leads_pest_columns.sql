-- Colonnes Pest Alert Network sur la table leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS nom_etablissement text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lat numeric;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lng numeric;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_rongeurs numeric;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_blattes numeric;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_punaises numeric;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_global numeric;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS niveau_risque text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS facteurs_principaux text[];
