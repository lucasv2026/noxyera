-- Add onboarding_done flag to profiles
-- Tracks whether a technicien has completed their first login and set their password
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_done boolean NOT NULL DEFAULT false;

-- Techniciens created before this migration who have already logged in
-- are considered to have completed onboarding
UPDATE public.profiles
SET onboarding_done = true
WHERE role = 'technicien'
  AND actif = true;
