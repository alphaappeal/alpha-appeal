-- Verify that permissions were granted correctly
-- Run this in Supabase SQL Editor

SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN (
  'delivery_service_providers',
  'delivery_drivers',
  'delivery_assignments',
  'delivery_zones',
  'delivery_pricing',
  'user_deliveries'
)
AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;
