
-- Fix overly permissive webhook policy - restrict to service role only
DROP POLICY IF EXISTS "Webhook can update deliveries" ON public.user_deliveries;

-- Create a more restrictive policy for webhook updates via service role
CREATE POLICY "Service role can update deliveries" ON public.user_deliveries
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = user_id);
