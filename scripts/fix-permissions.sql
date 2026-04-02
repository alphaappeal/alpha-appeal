-- Fix RLS and permissions for delivery tables
-- Run this in Supabase SQL Editor to ensure anon user can see the schema

-- Grant USAGE on schema public to anon
GRANT USAGE ON SCHEMA public TO anon;

-- Grant SELECT on all delivery tables to anon (for type generation)
GRANT SELECT ON TABLE public.delivery_service_providers TO anon;
GRANT SELECT ON TABLE public.delivery_drivers TO anon;
GRANT SELECT ON TABLE public.delivery_assignments TO anon;
GRANT SELECT ON TABLE public.delivery_zones TO anon;
GRANT SELECT ON TABLE public.delivery_pricing TO anon;
GRANT SELECT ON TABLE public.user_deliveries TO anon;

-- Also grant to authenticated users
GRANT SELECT ON TABLE public.delivery_service_providers TO authenticated;
GRANT SELECT ON TABLE public.delivery_drivers TO authenticated;
GRANT SELECT ON TABLE public.delivery_assignments TO authenticated;
GRANT SELECT ON TABLE public.delivery_zones TO authenticated;
GRANT SELECT ON TABLE public.delivery_pricing TO authenticated;
GRANT SELECT ON TABLE public.user_deliveries TO authenticated;

-- Refresh the database metadata
NOTIFY pgrst, 'reload schema';
