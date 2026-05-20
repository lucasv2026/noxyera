CREATE TABLE IF NOT EXISTS candidatures_techniciens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  prenom text NOT NULL,
  nom text NOT NULL,
  email text NOT NULL,
  telephone text NOT NULL,
  ville text NOT NULL,
  code_postal text NOT NULL,
  experience text NOT NULL, -- '0-1an', '1-3ans', '3-5ans', '5ans+'
  certifications text[], -- ['certiphyto', 'haccp', 'biocides', 'autre']
  vehicule boolean DEFAULT false,
  disponibilite text NOT NULL, -- 'temps-plein', 'temps-partiel', 'week-ends', 'flexible'
  motivation text,
  statut text DEFAULT 'nouveau' -- 'nouveau', 'contacté', 'entretien', 'accepté', 'refusé'
);

CREATE INDEX IF NOT EXISTS idx_candidatures_email ON candidatures_techniciens(email);
CREATE INDEX IF NOT EXISTS idx_candidatures_statut ON candidatures_techniciens(statut);
CREATE INDEX IF NOT EXISTS idx_candidatures_created ON candidatures_techniciens(created_at DESC);
