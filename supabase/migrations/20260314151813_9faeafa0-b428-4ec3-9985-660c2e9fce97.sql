-- Vendor applications table for signup requests
CREATE TABLE public.vendor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  store_id uuid REFERENCES public.alpha_partners(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  role_requested text NOT NULL DEFAULT 'manager',
  message text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application
CREATE POLICY "Anyone can insert vendor applications"
  ON public.vendor_applications FOR INSERT
  WITH CHECK (true);

-- Admins can read all applications
CREATE POLICY "Admins read all vendor applications"
  ON public.vendor_applications FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can read their own applications
CREATE POLICY "Users read own vendor applications"
  ON public.vendor_applications FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can update applications (approve/reject)
CREATE POLICY "Admins update vendor applications"
  ON public.vendor_applications FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Vendor RLS: vendors can update their own store's alpha_partners record
CREATE POLICY "Vendors can update own store"
  ON public.alpha_partners FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.vendor_accounts
      WHERE vendor_accounts.partner_id = alpha_partners.id
        AND vendor_accounts.user_id = auth.uid()
        AND vendor_accounts.is_active = true
        AND vendor_accounts.role IN ('owner', 'manager')
    )
  );

-- Vendor RLS on partner_hours: vendors manage own store hours
CREATE POLICY "Vendors manage own store hours"
  ON public.partner_hours FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.vendor_accounts
      WHERE vendor_accounts.partner_id = partner_hours.partner_id
        AND vendor_accounts.user_id = auth.uid()
        AND vendor_accounts.is_active = true
    )
  );

-- Ensure partner_hours has RLS enabled
ALTER TABLE public.partner_hours ENABLE ROW LEVEL SECURITY;

-- Admins can manage all partner_hours
CREATE POLICY "Admins manage all partner hours"
  ON public.partner_hours FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));