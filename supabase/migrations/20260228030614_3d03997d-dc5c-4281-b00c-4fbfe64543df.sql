
-- Fix the overly permissive insert policy on user_notifications
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.user_notifications;
CREATE POLICY "Authenticated can insert notifications" ON public.user_notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
