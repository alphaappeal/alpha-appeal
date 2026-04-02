-- Check RLS status and policies for delivery tables
-- Run this in Supabase SQL Editor

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'delivery_service_providers',
    'delivery_drivers',
    'delivery_assignments',
    'delivery_zones',
    'delivery_pricing',
    'user_deliveries'
  )
ORDER BY tablename;

-- Show all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'delivery_service_providers',
    'delivery_drivers',
    'delivery_assignments',
    'delivery_zones',
    'delivery_pricing',
    'user_deliveries'
  )
ORDER BY tablename, policyname;
