
-- Add stock_quantity column to existing products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 0;

-- Allow admins to manage products (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage all products"
ON public.products
FOR ALL
USING (has_role(( SELECT auth.uid() AS uid), 'admin'::app_role))
WITH CHECK (has_role(( SELECT auth.uid() AS uid), 'admin'::app_role));
