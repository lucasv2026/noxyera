-- Ajout du statut 'proposee' dans la contrainte interventions
ALTER TABLE interventions
DROP CONSTRAINT IF EXISTS interventions_statut_check;

ALTER TABLE interventions
ADD CONSTRAINT interventions_statut_check
CHECK (statut IN ('proposee', 'planifie', 'en_cours', 'realise', 'annule'));
