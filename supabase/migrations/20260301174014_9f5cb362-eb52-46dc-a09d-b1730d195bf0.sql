
-- Use IF NOT EXISTS for all policies to avoid conflicts

-- 1. Drop duplicate stock trigger and broken function (idempotent)
DROP TRIGGER IF EXISTS stock_update_trigger ON public.order_items;
DROP FUNCTION IF EXISTS public.reduce_stock_after_purchase();

-- 2. comment_interactions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comment_interactions' AND policyname = 'Users manage own comment interactions') THEN
    CREATE POLICY "Users manage own comment interactions"
      ON public.comment_interactions FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 3. navigation_permissions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'navigation_permissions' AND policyname = 'Anyone can read nav permissions') THEN
    CREATE POLICY "Anyone can read nav permissions"
      ON public.navigation_permissions FOR SELECT
      USING (true);
  END IF;
END $$;

-- 4. product_views
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_views' AND policyname = 'Users can insert own views') THEN
    CREATE POLICY "Users can insert own views"
      ON public.product_views FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_views' AND policyname = 'Admins can view product views') THEN
    CREATE POLICY "Admins can view product views"
      ON public.product_views FOR SELECT
      USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

-- 5. reward_claims
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reward_claims' AND policyname = 'Users can view own claims') THEN
    CREATE POLICY "Users can view own claims"
      ON public.reward_claims FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reward_claims' AND policyname = 'Users can create own claims') THEN
    CREATE POLICY "Users can create own claims"
      ON public.reward_claims FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reward_claims' AND policyname = 'Admins can manage all claims') THEN
    CREATE POLICY "Admins can manage all claims"
      ON public.reward_claims FOR ALL
      USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;
