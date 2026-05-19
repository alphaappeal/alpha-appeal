-- Supabase Security Hardening Migration
-- Resolves multiple linter warnings regarding search paths, materialized views, RLS policies, and SECURITY DEFINER access levels.

-- ==========================================
-- 1. HARDEN FUNCTION SEARCH PATHS
-- ==========================================
-- Enforce a secure, explicit search_path on critical functions to prevent role-hijack search path mutability issues.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT 
            p.oid::regprocedure AS func_signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
          AND p.proname IN (
              'calculate_delivery_fee', 
              'apply_reward_to_wallet', 
              'find_optimal_delivery_provider', 
              'assign_driver_to_delivery', 
              'update_updated_at_column'
          )
    LOOP
        EXECUTE format('ALTER FUNCTION %s SET search_path = public', r.func_signature);
    END LOOP;
END $$;

-- ==========================================
-- 2. HARDEN MATERIALIZED VIEW VISIBILITY
-- ==========================================
-- Revoke public select permissions on the daily product views materialized view to prevent unrestricted API exposure.
REVOKE SELECT ON TABLE public.product_views_daily FROM anon, authenticated, PUBLIC;

-- ==========================================
-- 3. HARDEN OVERLY PERMISSIVE RLS POLICIES
-- ==========================================

-- Drop the unrestricted INSERT policy on public.users
DROP POLICY IF EXISTS "Unified Users Insert" ON public.users;

-- Restrict vendor application inserts to authenticated users whose auth.uid() matches the application's user_id
DROP POLICY IF EXISTS "Anyone can insert vendor applications" ON public.vendor_applications;
DROP POLICY IF EXISTS "Users can insert own vendor applications" ON public.vendor_applications;
CREATE POLICY "Users can insert own vendor applications"
  ON public.vendor_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 4. HARDEN SECURITY DEFINER EXECUTION PRIVILEGES
-- ==========================================
-- Revoke EXECUTE from PUBLIC (anon/authenticated roles) on internal trigger, maintenance, and utility functions.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT 
            p.oid::regprocedure AS func_signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
          AND p.proname IN (
              'auto_post_new_strain',
              'decrement_stock_on_order',
              'generate_culture_item_slug',
              'generate_order_number',
              'generate_strain_slug',
              'handle_application_decision',
              'handle_new_user',
              'handle_new_user_role',
              'initialize_user_ecosystem',
              'on_auth_user_created',
              'profiles_updated_at',
              'refresh_product_views_daily',
              'sync_public_users_from_auth',
              'update_comment_interaction_counts',
              'update_culture_item_interaction_counts',
              'update_culture_item_search_vector',
              'update_post_interaction_counts',
              'update_strain_interaction_counts'
          )
    LOOP
        EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', r.func_signature);
    END LOOP;
END $$;
