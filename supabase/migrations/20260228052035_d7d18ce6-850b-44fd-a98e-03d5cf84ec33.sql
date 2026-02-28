
-- Drop old restrictive constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_tier_check;

-- Add updated constraint with all valid tiers
ALTER TABLE public.profiles ADD CONSTRAINT profiles_tier_check 
  CHECK (tier = ANY (ARRAY['free'::text, 'alpha'::text, 'elite'::text, 'essential'::text, 'private'::text, 'pending_private'::text]));

-- 1. Tier migration: set specific user to essential
UPDATE public.profiles 
SET subscription_tier = 'essential', tier = 'essential'
WHERE id = '0626fc62-f18d-467d-b342-a84a1a0a07f9';

UPDATE public.users
SET tier = 'essential'
WHERE id = '0626fc62-f18d-467d-b342-a84a1a0a07f9';

-- 2. Move all other promo/free users to private
UPDATE public.profiles 
SET subscription_tier = 'private', tier = 'private'
WHERE (subscription_tier IN ('promo', 'free') OR tier IN ('promo', 'free'))
AND id != '0626fc62-f18d-467d-b342-a84a1a0a07f9';

UPDATE public.users
SET tier = 'private'
WHERE (tier IN ('promo', 'free'))
AND id != '0626fc62-f18d-467d-b342-a84a1a0a07f9';

-- 3. Create site_settings CMS table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  section text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.site_settings (key, value, section) VALUES
  ('hero_title', 'Live with Intention. Move with Culture.', 'hero'),
  ('hero_subtitle', 'Art you can wear. Music you can live in. Culture you can feel.', 'hero'),
  ('hero_bg_image', '', 'hero'),
  ('philosophy_text', 'Alpha Appeal isn''t just about products. It''s about elevating every aspect of your daily ritual into something extraordinary.', 'philosophy'),
  ('logo_url', '', 'branding')
ON CONFLICT (key) DO NOTHING;
