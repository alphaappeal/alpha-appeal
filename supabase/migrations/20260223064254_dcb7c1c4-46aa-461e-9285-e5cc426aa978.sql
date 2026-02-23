
-- Fix search_path on new functions
CREATE OR REPLACE FUNCTION public.generate_culture_item_slug()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
  NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_culture_item_search_vector()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
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
