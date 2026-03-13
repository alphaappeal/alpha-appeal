-- 1. Admin UPDATE policy for alpha_partners (currently only vendors can update)
CREATE POLICY "Admins can update alpha partners"
ON public.alpha_partners
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. Enable RLS on navigation_permissions (already has SELECT policy but RLS might be off)
ALTER TABLE public.navigation_permissions ENABLE ROW LEVEL SECURITY;

-- 3. Admin manage policy for navigation_permissions
CREATE POLICY "Admins can manage nav permissions"
ON public.navigation_permissions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4. Enable RLS on product_views
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

-- 5. Users can insert own product views
CREATE POLICY "Users can insert own product views"
ON public.product_views
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 6. Users can view own product views
CREATE POLICY "Users can view own product views"
ON public.product_views
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 7. Admins can view all product views
CREATE POLICY "Admins can view all product views"
ON public.product_views
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));