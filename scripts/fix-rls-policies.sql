-- Fix: Ensure RLS policies allow anon to read delivery tables
-- This creates permissive SELECT policies for anon users
-- Run this in Supabase SQL Editor

-- Enable RLS on all delivery tables (if not already enabled)
ALTER TABLE public.delivery_service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_deliveries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they conflict (optional - comment out if unsure)
-- DROP POLICY IF EXISTS "anon_read_delivery_providers" ON public.delivery_service_providers;
-- DROP POLICY IF EXISTS "anon_read_delivery_drivers" ON public.delivery_drivers;
-- DROP POLICY IF EXISTS "anon_read_delivery_assignments" ON public.delivery_assignments;
-- DROP POLICY IF EXISTS "anon_read_delivery_zones" ON public.delivery_zones;
-- DROP POLICY IF EXISTS "anon_read_delivery_pricing" ON public.delivery_pricing;
-- DROP POLICY IF EXISTS "anon_read_user_deliveries" ON public.user_deliveries;

-- Create new permissive SELECT policies for anon
CREATE POLICY "anon_read_delivery_providers"
ON public.delivery_service_providers
FOR SELECT
TO anon
USING (is_active = true);

CREATE POLICY "anon_read_delivery_drivers"
ON public.delivery_drivers
FOR SELECT
TO anon
USING (is_available = true OR user_id = auth.uid());

CREATE POLICY "anon_read_delivery_assignments"
ON public.delivery_assignments
FOR SELECT
TO anon
USING (true); -- Allow anon to see assignments (they can query via deliveries)

CREATE POLICY "anon_read_delivery_zones"
ON public.delivery_zones
FOR SELECT
TO anon
USING (is_active = true);

CREATE POLICY "anon_read_delivery_pricing"
ON public.delivery_pricing
FOR SELECT
TO anon
USING (is_active = true);

CREATE POLICY "anon_read_user_deliveries"
ON public.user_deliveries
FOR SELECT
TO anon
USING (user_id = auth.uid() OR status = 'delivered');

-- Also add policies for authenticated users (more permissive)
DROP POLICY IF EXISTS "authenticated_read_all_delivery" ON public.delivery_service_providers;
CREATE POLICY "authenticated_read_all_delivery"
ON public.delivery_service_providers
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "authenticated_read_all_drivers" ON public.delivery_drivers;
CREATE POLICY "authenticated_read_all_drivers"
ON public.delivery_drivers
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "authenticated_read_all_assignments" ON public.delivery_assignments;
CREATE POLICY "authenticated_read_all_assignments"
ON public.delivery_assignments
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "authenticated_read_all_zones" ON public.delivery_zones;
CREATE POLICY "authenticated_read_all_zones"
ON public.delivery_zones
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "authenticated_read_all_pricing" ON public.delivery_pricing;
CREATE POLICY "authenticated_read_all_pricing"
ON public.delivery_pricing
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "authenticated_read_all_deliveries" ON public.user_deliveries;
CREATE POLICY "authenticated_read_all_deliveries"
ON public.user_deliveries
FOR SELECT
TO authenticated
USING (true);

-- Notify PostgREST to reload schema again
NOTIFY pgrst, 'reload schema';
