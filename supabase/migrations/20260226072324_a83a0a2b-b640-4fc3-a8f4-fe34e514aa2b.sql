-- Fix initialize_user_ecosystem: wallet column is credit_balance, not balance
CREATE OR REPLACE FUNCTION public.initialize_user_ecosystem()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog', 'extensions'
AS $function$
BEGIN
  -- Create profile row
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New Member'), 
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  
  -- Initialize wallet with correct column name
  INSERT INTO public.user_wallet (user_id, credit_balance, token_balance) 
  VALUES (new.id, 0, 0) 
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Initialize preferences
  INSERT INTO public.user_preferences (user_id) 
  VALUES (new.id) 
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$function$;

-- Fix sync_public_users_from_auth to also read 'name' metadata key (used by SignupWizard)
CREATE OR REPLACE FUNCTION public.sync_public_users_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'pg_catalog'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.users (id, username, full_name, email, avatar_url)
    VALUES (
      NEW.id, 
      NEW.raw_user_meta_data->>'username', 
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
      NEW.email, 
      NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.users
    SET username = COALESCE(NEW.raw_user_meta_data->>'username', public.users.username),
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', public.users.full_name),
        email = NEW.email,
        avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', public.users.avatar_url)
    WHERE id = NEW.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.users WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Ensure user_wallet has unique constraint on user_id for upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_wallet_user_id_key'
  ) THEN
    ALTER TABLE public.user_wallet ADD CONSTRAINT user_wallet_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Add INSERT policy on user_wallet so the trigger (SECURITY DEFINER) works,
-- and also allow users to view their wallet (already exists as SELECT)
-- Add UPDATE policy for wallet modifications
CREATE POLICY "Users can update own wallet"
ON public.user_wallet FOR UPDATE
USING (( SELECT auth.uid() AS uid) = user_id)
WITH CHECK (( SELECT auth.uid() AS uid) = user_id);
