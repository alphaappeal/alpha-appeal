-- =====================================================
-- PART 1: STRAINS TABLE (Leafly-based structure)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.strains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  type TEXT CHECK (type IN ('indica', 'sativa', 'hybrid', 'Indica', 'Sativa', 'Hybrid')),
  
  -- Cannabinoid Profile
  thc_level TEXT,
  most_common_terpene TEXT,
  
  -- Description
  description TEXT,
  
  -- Image
  img_url TEXT,
  
  -- Effects (stored as JSONB for flexibility)
  effects JSONB DEFAULT '{}'::jsonb,
  
  -- Ratings & Popularity
  overall_rating NUMERIC(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  
  -- Meta
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on name
CREATE UNIQUE INDEX IF NOT EXISTS idx_strains_name_unique ON public.strains(name);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_strains_type ON public.strains(type);
CREATE INDEX IF NOT EXISTS idx_strains_rating ON public.strains(overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_strains_slug ON public.strains(slug);

-- Enable RLS
ALTER TABLE public.strains ENABLE ROW LEVEL SECURITY;

-- RLS Policies for strains
CREATE POLICY "Anyone can view strains" ON public.strains
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage strains" ON public.strains
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- PART 2: POST INTERACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.post_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID,
  strain_id UUID REFERENCES public.strains(id) ON DELETE CASCADE,
  interaction_type TEXT CHECK (interaction_type IN ('upvote', 'downvote', 'star')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id, interaction_type),
  UNIQUE(user_id, strain_id, interaction_type)
);

CREATE INDEX IF NOT EXISTS idx_interactions_post ON public.post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_interactions_strain ON public.post_interactions(strain_id);
CREATE INDEX IF NOT EXISTS idx_interactions_user ON public.post_interactions(user_id);

-- Enable RLS
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for interactions
CREATE POLICY "Users can view all interactions" ON public.post_interactions
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can manage own interactions" ON public.post_interactions
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- PART 3: COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID REFERENCES public.diary_entries(id) ON DELETE CASCADE,
  strain_id UUID REFERENCES public.strains(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_strain ON public.comments(strain_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.comments(user_id);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments
CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments" ON public.comments
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- PART 4: ADMIN ACTIONS LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON public.admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created ON public.admin_actions(created_at DESC);

-- Enable RLS
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin actions
CREATE POLICY "Admins can view action logs" ON public.admin_actions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create logs" ON public.admin_actions
  FOR INSERT WITH CHECK (TRUE);

-- =====================================================
-- PART 5: ADD INTERACTION COLUMNS TO DIARY_ENTRIES
-- =====================================================
ALTER TABLE public.diary_entries 
  ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stars INTEGER DEFAULT 0;

-- =====================================================
-- PART 6: FUNCTION TO UPDATE INTERACTION COUNTS
-- =====================================================
CREATE OR REPLACE FUNCTION update_strain_interaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.strain_id IS NOT NULL THEN
      IF NEW.interaction_type = 'upvote' THEN
        UPDATE public.strains SET upvotes = upvotes + 1 WHERE id = NEW.strain_id;
      ELSIF NEW.interaction_type = 'downvote' THEN
        UPDATE public.strains SET downvotes = downvotes + 1 WHERE id = NEW.strain_id;
      ELSIF NEW.interaction_type = 'star' THEN
        UPDATE public.strains SET stars = stars + 1 WHERE id = NEW.strain_id;
      END IF;
    ELSIF NEW.post_id IS NOT NULL THEN
      IF NEW.interaction_type = 'upvote' THEN
        UPDATE public.diary_entries SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
      ELSIF NEW.interaction_type = 'downvote' THEN
        UPDATE public.diary_entries SET downvotes = downvotes + 1 WHERE id = NEW.post_id;
      ELSIF NEW.interaction_type = 'star' THEN
        UPDATE public.diary_entries SET stars = stars + 1 WHERE id = NEW.post_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.strain_id IS NOT NULL THEN
      IF OLD.interaction_type = 'upvote' THEN
        UPDATE public.strains SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.strain_id;
      ELSIF OLD.interaction_type = 'downvote' THEN
        UPDATE public.strains SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = OLD.strain_id;
      ELSIF OLD.interaction_type = 'star' THEN
        UPDATE public.strains SET stars = GREATEST(stars - 1, 0) WHERE id = OLD.strain_id;
      END IF;
    ELSIF OLD.post_id IS NOT NULL THEN
      IF OLD.interaction_type = 'upvote' THEN
        UPDATE public.diary_entries SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.post_id;
      ELSIF OLD.interaction_type = 'downvote' THEN
        UPDATE public.diary_entries SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = OLD.post_id;
      ELSIF OLD.interaction_type = 'star' THEN
        UPDATE public.diary_entries SET stars = GREATEST(stars - 1, 0) WHERE id = OLD.post_id;
      END IF;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS post_interaction_counter ON public.post_interactions;
CREATE TRIGGER post_interaction_counter
AFTER INSERT OR DELETE ON public.post_interactions
FOR EACH ROW EXECUTE FUNCTION update_strain_interaction_counts();

-- =====================================================
-- PART 7: FUNCTION TO GENERATE STRAIN SLUG
-- =====================================================
CREATE OR REPLACE FUNCTION generate_strain_slug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS strain_slug_generator ON public.strains;
CREATE TRIGGER strain_slug_generator
BEFORE INSERT OR UPDATE ON public.strains
FOR EACH ROW EXECUTE FUNCTION generate_strain_slug();