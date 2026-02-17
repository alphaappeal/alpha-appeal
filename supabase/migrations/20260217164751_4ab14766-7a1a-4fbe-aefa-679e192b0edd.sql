
-- Fix: Drop the recursive "Admin full access" policy on users table
DROP POLICY IF EXISTS "Admin full access" ON public.users;

-- Replace with non-recursive policies using has_role() function
-- 1. Users can view their own row
CREATE POLICY "Users can view own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- 2. Admins can view all users (uses user_roles table, no recursion)
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Users can update their own row
CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- 4. Admins can manage all users
CREATE POLICY "Admins can manage all users"
  ON public.users FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Allow inserts for new user creation (triggers)
CREATE POLICY "System can insert users"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Fix admin_logs: add RLS and policies
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Add a details column if missing for richer logging
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'admin_logs' AND column_name = 'details'
  ) THEN
    ALTER TABLE public.admin_logs ADD COLUMN details jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Admins can view all admin logs
CREATE POLICY "Admins can view admin logs"
  ON public.admin_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert admin logs
CREATE POLICY "Admins can insert admin logs"
  ON public.admin_logs FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Also fix subscriptions RLS for admin access if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polrelid = 'public.subscriptions'::regclass AND polname = 'Admins can view all subscriptions'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions FOR SELECT USING (public.has_role(auth.uid(), ''admin''))';
  END IF;
END $$;
