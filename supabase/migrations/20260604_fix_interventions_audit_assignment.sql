-- Fix Blocage B — les interventions assignées par l'admin n'apparaissaient pas
-- côté technicien car l'INSERT échouait en silence (site_id NOT NULL pour un
-- audit qui concerne un prospect sans site client encore créé).

BEGIN;

-- 1. site_id nullable : un audit précède la création du compte/site client.
--    Les vues technicien tolèrent déjà un site null.
ALTER TABLE public.interventions
  ALTER COLUMN site_id DROP NOT NULL;

-- 2. prix_technicien : rémunération proposée, lue par
--    /api/admin/missions/[id]/offrir et /api/technicien/profil
--    (référencée dans le code mais absente du schéma).
ALTER TABLE public.interventions
  ADD COLUMN IF NOT EXISTS prix_technicien numeric(10, 2);

-- 3. audit_id : lien stable audit → intervention pour rendre l'assignation
--    idempotente (évite les doublons entre /audits PATCH et /audits/[id]/proposer).
ALTER TABLE public.interventions
  ADD COLUMN IF NOT EXISTS audit_id uuid REFERENCES public.audits(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_interventions_audit_id
  ON public.interventions(audit_id);

COMMIT;
