CREATE TABLE IF NOT EXISTS audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),

  -- Établissement
  nom_etablissement text NOT NULL,
  adresse text NOT NULL,
  lat numeric,
  lng numeric,
  secteur text NOT NULL,
  superficie integer,
  annee_construction text,

  -- Situation
  historique_nuisibles text,
  prestataire_actuel boolean,
  rapports_a_jour text,
  zones_sensibles text[],

  -- Contact
  prenom text NOT NULL,
  nom text NOT NULL,
  email text NOT NULL,
  telephone text NOT NULL,
  creneaux text[],
  jours text[],

  -- Gestion interne
  statut text DEFAULT 'nouveau',
  technicien_id uuid REFERENCES profiles(id),
  date_audit_prevue timestamptz,
  notes_internes text
);

CREATE INDEX IF NOT EXISTS idx_audits_email   ON audits(email);
CREATE INDEX IF NOT EXISTS idx_audits_statut  ON audits(statut);
CREATE INDEX IF NOT EXISTS idx_audits_created ON audits(created_at DESC);
