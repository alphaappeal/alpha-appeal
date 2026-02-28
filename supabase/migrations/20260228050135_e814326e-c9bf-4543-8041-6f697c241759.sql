
-- Add new columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS referral_code_used text,
  ADD COLUMN IF NOT EXISTS application_status text DEFAULT 'none';

-- Create function to validate referral code
CREATE OR REPLACE FUNCTION public.validate_referral_code(code_input text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
DECLARE
  ref_record RECORD;
BEGIN
  SELECT rc.code, rc.user_id, u.full_name
  INTO ref_record
  FROM public.referral_codes rc
  JOIN public.users u ON u.id = rc.user_id
  WHERE rc.code = upper(code_input) AND rc.active = true
  LIMIT 1;

  IF ref_record IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Invalid referral code');
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'message', 'Code applied',
    'referrer_name', ref_record.full_name
  );
END;
$$;

-- Create function to handle private application approval/denial with tier sync
CREATE OR REPLACE FUNCTION public.handle_application_decision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
  IF NEW.application_status = 'approved' AND OLD.application_status = 'pending' THEN
    -- Upgrade to private tier
    UPDATE public.profiles
    SET subscription_tier = 'private',
        application_status = 'approved'
    WHERE id = NEW.user_id;
    
    UPDATE public.users
    SET tier = 'private'
    WHERE id = NEW.user_id;
    
  ELSIF NEW.application_status = 'rejected' AND OLD.application_status = 'pending' THEN
    -- Fallback to elite (since they paid R499 which covers elite)
    UPDATE public.profiles
    SET subscription_tier = 'elite',
        application_status = 'denied'
    WHERE id = NEW.user_id;
    
    UPDATE public.users
    SET tier = 'elite'
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Attach trigger to private_member_applications
DROP TRIGGER IF EXISTS trg_application_decision ON public.private_member_applications;
CREATE TRIGGER trg_application_decision
  AFTER UPDATE OF application_status ON public.private_member_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_application_decision();
