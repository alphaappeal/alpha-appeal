-- Add Vendor Account for User ID: 142538f5-e489-4b48-a39d-ab5f5271156d
-- Run this in your Supabase SQL Editor

-- First, let's get a partner store ID (you can change this)
-- This selects the first available Alpha partner store
SELECT id, name, city 
FROM alpha_partners 
LIMIT 5;

-- Once you have a partner_id from above, run this INSERT:
-- Replace PARTNER_ID_HERE with an actual store ID from the query above

INSERT INTO vendor_accounts (user_id, partner_id, role, is_active)
VALUES (
  '142538f5-e489-4b48-a39d-ab5f5271156d',  -- Your user ID
  'REPLACE_WITH_PARTNER_ID',                 -- Store ID from query above
  'owner'                                    -- Role: owner, manager, or staff
)
ON CONFLICT (user_id, partner_id) 
DO UPDATE SET 
  is_active = TRUE,
  role = 'owner',
  updated_at = NOW();

-- Verify the insertion
SELECT 
  va.id,
  va.user_id,
  va.partner_id,
  va.role,
  va.is_active,
  ap.name as store_name,
  ap.city as store_city
FROM vendor_accounts va
JOIN alpha_partners ap ON va.partner_id = ap.id
WHERE va.user_id = '142538f5-e489-4b48-a39d-ab5f5271156d';
