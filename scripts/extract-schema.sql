-- This SQL query extracts the schema for delivery tables
-- Run this in Supabase SQL Editor to verify schema

SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'delivery_service_providers',
    'delivery_drivers', 
    'delivery_assignments',
    'delivery_zones',
    'delivery_pricing'
  )
ORDER BY table_name, ordinal_position;
