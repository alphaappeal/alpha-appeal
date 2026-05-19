-- Grant EXECUTE permissions on public RPC functions called by the client
-- This resolves the issue where the frontend was blocked from checking user roles and validating referral codes.

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_referral_code(text) TO anon, authenticated;
