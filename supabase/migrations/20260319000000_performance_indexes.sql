-- Performance optimization indexes for frequently queried columns
-- Generated: 2026-03-19

-- =====================================================
-- PART 1: VENDOR ACCOUNTS PERFORMANCE
-- =====================================================

-- Index for vendor access checks (used by useVendorCheck hook)
CREATE INDEX IF NOT EXISTS idx_vendor_accounts_user_active 
ON public.vendor_accounts(user_id, is_active) 
WHERE is_active = true;

-- Index for finding vendors by partner
CREATE INDEX IF NOT EXISTS idx_vendor_accounts_partner 
ON public.vendor_accounts(partner_id);

-- =====================================================
-- PART 2: USER & PROFILE QUERIES
-- =====================================================

-- Composite index for role checks (used by has_role function)
CREATE INDEX IF NOT EXISTS idx_users_role_lookup 
ON public.users(id, app_role) 
WHERE app_role IS NOT NULL;

-- Index for profile lookups by email
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON public.profiles(email) 
WHERE email IS NOT NULL;

-- =====================================================
-- PART 3: ACTIVITY & AUDIT LOGS
-- =====================================================

-- Index for recent activity logs (time-based queries)
CREATE INDEX IF NOT EXISTS idx_activity_logs_created 
ON public.activity_logs(created_at DESC);

-- Index for user-specific activity
CREATE INDEX IF NOT EXISTS idx_activity_logs_user 
ON public.activity_logs(user_id, created_at DESC);

-- Index for admin logs by admin
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin 
ON public.admin_logs(admin_id, created_at DESC);

-- =====================================================
-- PART 4: E-COMMERCE OPTIMIZATION
-- =====================================================

-- Index for order lookups by user
CREATE INDEX IF NOT EXISTS idx_orders_user_created 
ON public.orders(user_id, created_at DESC);

-- Index for pending payments
CREATE INDEX IF NOT EXISTS idx_orders_payment_status 
ON public.orders(payment_status) 
WHERE payment_status IN ('pending', 'processing');

-- Index for product searches
CREATE INDEX IF NOT EXISTS idx_products_category_instock 
ON public.partner_products(category, in_stock) 
WHERE in_stock = true;

-- =====================================================
-- PART 5: COMMUNITY CONTENT
-- =====================================================

-- Index for published diary entries
CREATE INDEX IF NOT EXISTS idx_diary_published 
ON public.diary_entries(user_id, published, created_at DESC) 
WHERE published = true;

-- Index for comments on posts
CREATE INDEX IF NOT EXISTS idx_comments_post 
ON public.comments(entry_id, created_at DESC);

-- =====================================================
-- PART 6: GEOGRAPHIC QUERIES
-- =====================================================

-- Spatial index for map locations (if using PostGIS)
-- Note: Only if you have many map_locations
-- CREATE INDEX IF NOT EXISTS idx_map_locations_geo 
-- ON public.map_locations USING GIST (latitude, longitude);

-- Index for active partners by location
CREATE INDEX IF NOT EXISTS idx_alpha_partners_location 
ON public.alpha_partners(city, country, featured);

-- =====================================================
-- PART 7: ANALYTICS & MONITORING
-- =====================================================

-- Index for platform metrics (time-series data)
CREATE INDEX IF NOT EXISTS idx_platform_metrics_timestamp 
ON public.platform_metrics(metric_timestamp DESC);

-- Index for maintenance logs
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_active 
ON public.maintenance_logs(is_resolved, created_at) 
WHERE is_resolved = false;

-- =====================================================
-- PART 8: CLEANUP & MAINTENANCE
-- =====================================================

-- Analyze tables to update query planner statistics
ANALYZE public.vendor_accounts;
ANALYZE public.users;
ANALYZE public.profiles;
ANALYZE public.activity_logs;
ANALYZE public.admin_logs;
ANALYZE public.orders;
ANALYZE public.partner_products;

COMMENT ON INDEX public.idx_vendor_accounts_user_active IS 'Optimizes vendor access checks for authentication';
COMMENT ON INDEX public.idx_users_role_lookup IS 'Speeds up has_role() function calls';
COMMENT ON INDEX public.idx_activity_logs_created IS 'Enables fast recent activity queries';
