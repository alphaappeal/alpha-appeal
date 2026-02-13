-- Add strain_id column to post_comments for strain-level comments
ALTER TABLE public.post_comments ADD COLUMN IF NOT EXISTS strain_id uuid REFERENCES public.strains(id) ON DELETE CASCADE;

-- Allow null post_id (so comments can be strain-only)
ALTER TABLE public.post_comments ALTER COLUMN post_id DROP NOT NULL;

-- Create index for strain comments
CREATE INDEX IF NOT EXISTS idx_post_comments_strain_id ON public.post_comments(strain_id);
