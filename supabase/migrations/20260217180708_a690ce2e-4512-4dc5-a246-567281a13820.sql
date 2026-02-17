
-- Add a logo_url column to alpha_partners for partner branding
ALTER TABLE public.alpha_partners ADD COLUMN IF NOT EXISTS logo_url text;
