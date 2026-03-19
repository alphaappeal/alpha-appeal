-- Fix duplicate vendor account approval issue
-- Run this in Supabase SQL Editor

-- Step 1: Check current vendor accounts for the problematic user
SELECT 
  va.id,
  va.user_id,
  va.partner_id,
  va.role,
  va.is_active,
  va.created_at,
  ap.name as store_name
FROM vendor_accounts va
JOIN alpha_partners ap ON va.partner_id = ap.id
WHERE va.user_id = '142538f5-e489-4b48-a39d-ab5f5271156d';

-- Step 2: If no vendor account exists, create one (choose a store)
-- First, get available stores
SELECT id, name FROM alpha_partners LIMIT 5;

-- Then insert vendor account (replace STORE_ID with an actual ID from above)
INSERT INTO vendor_accounts (user_id, partner_id, role, is_active)
VALUES (
  '142538f5-e489-4b48-a39d-ab5f5271156d',  -- Your user ID
  'REPLACE_WITH_STORE_ID',                  -- Store ID from query above
  'owner'
)
ON CONFLICT (user_id, partner_id) 
DO UPDATE SET 
  is_active = TRUE,
  role = 'owner',
  updated_at = NOW();

-- Step 3: Verify the account was created/updated
SELECT 
  va.user_id::text,
  va.role,
  va.is_active,
  ap.name as store_name,
  va.updated_at
FROM vendor_accounts va
JOIN alpha_partners ap ON va.partner_id = ap.id
WHERE va.user_id = '142538f5-e489-4b48-a39d-ab5f5271156d';

-- Step 4: Test that useVendorCheck will work by querying the same way the hook does
SELECT 
  va.id,
  va.partner_id,
  va.role,
  ap.name as store_name
FROM vendor_accounts va
INNER JOIN alpha_partners ap ON va.partner_id = ap.id
WHERE va.user_id = '142538f5-e489-4b48-a39d-ab5f5271156d'
  AND va.is_active = true;

-- If this returns results, the FAB and header link should appear!
