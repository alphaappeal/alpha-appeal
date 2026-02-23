
-- Create unified culture_items table for fashion, wellness, artwork, cars
CREATE TABLE public.culture_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  category TEXT NOT NULL, -- 'fashion', 'wellness', 'artwork', 'cars'
  type TEXT,
  img_url TEXT,
  description TEXT,
  creator TEXT, -- designer, artist, manufacturer, or origin
  medium TEXT, -- material, engine, form, or medium
  year TEXT,
  feelings JSONB DEFAULT '{}'::jsonb,
  published BOOLEAN DEFAULT true,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  search_vector TSVECTOR
);

-- Generate slug trigger
CREATE OR REPLACE FUNCTION public.generate_culture_item_slug()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
  NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_culture_item_slug
BEFORE INSERT OR UPDATE OF name ON public.culture_items
FOR EACH ROW EXECUTE FUNCTION public.generate_culture_item_slug();

-- Search vector trigger
CREATE OR REPLACE FUNCTION public.update_culture_item_search_vector()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path TO 'public', 'pg_catalog', 'extensions'
AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.name,'') || ' ' ||
    coalesce(NEW.description,'') || ' ' ||
    coalesce(NEW.creator,'') || ' ' ||
    coalesce(NEW.category,'') || ' ' ||
    coalesce(NEW.type,'')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_culture_item_search
BEFORE INSERT OR UPDATE ON public.culture_items
FOR EACH ROW EXECUTE FUNCTION public.update_culture_item_search_vector();

-- Updated_at trigger
CREATE TRIGGER trg_culture_item_updated
BEFORE UPDATE ON public.culture_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.culture_items ENABLE ROW LEVEL SECURITY;

-- Public can read published items
CREATE POLICY "Anyone can view published culture items"
ON public.culture_items FOR SELECT
USING (published = true);

-- Admins can manage all
CREATE POLICY "Admins can manage culture items"
ON public.culture_items FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add culture_item_id to post_interactions
ALTER TABLE public.post_interactions
ADD COLUMN culture_item_id UUID REFERENCES public.culture_items(id) ON DELETE CASCADE;

-- Add culture_item_id to post_comments
ALTER TABLE public.post_comments
ADD COLUMN culture_item_id UUID REFERENCES public.culture_items(id) ON DELETE CASCADE;

-- Interaction count trigger for culture items
CREATE OR REPLACE FUNCTION public.update_culture_item_interaction_counts()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.culture_item_id IS NOT NULL THEN
      IF NEW.interaction_type = 'upvote' THEN
        UPDATE public.culture_items SET upvotes = upvotes + 1 WHERE id = NEW.culture_item_id;
      ELSIF NEW.interaction_type = 'downvote' THEN
        UPDATE public.culture_items SET downvotes = downvotes + 1 WHERE id = NEW.culture_item_id;
      ELSIF NEW.interaction_type = 'star' THEN
        UPDATE public.culture_items SET stars = stars + 1 WHERE id = NEW.culture_item_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.culture_item_id IS NOT NULL THEN
      IF OLD.interaction_type = 'upvote' THEN
        UPDATE public.culture_items SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.culture_item_id;
      ELSIF OLD.interaction_type = 'downvote' THEN
        UPDATE public.culture_items SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = OLD.culture_item_id;
      ELSIF OLD.interaction_type = 'star' THEN
        UPDATE public.culture_items SET stars = GREATEST(stars - 1, 0) WHERE id = OLD.culture_item_id;
      END IF;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_culture_item_interactions
AFTER INSERT OR DELETE ON public.post_interactions
FOR EACH ROW EXECUTE FUNCTION public.update_culture_item_interaction_counts();

-- Index for performance
CREATE INDEX idx_culture_items_category ON public.culture_items(category);
CREATE INDEX idx_culture_items_slug ON public.culture_items(slug);
CREATE INDEX idx_culture_items_search ON public.culture_items USING GIN(search_vector);
CREATE INDEX idx_post_interactions_culture ON public.post_interactions(culture_item_id);
CREATE INDEX idx_post_comments_culture ON public.post_comments(culture_item_id);
