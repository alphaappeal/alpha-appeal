
-- Add Shipday tracking columns to user_deliveries
ALTER TABLE public.user_deliveries
  ADD COLUMN IF NOT EXISTS shipday_order_id text,
  ADD COLUMN IF NOT EXISTS driver_name text,
  ADD COLUMN IF NOT EXISTS driver_phone text,
  ADD COLUMN IF NOT EXISTS driver_latitude numeric,
  ADD COLUMN IF NOT EXISTS driver_longitude numeric,
  ADD COLUMN IF NOT EXISTS eta_minutes integer,
  ADD COLUMN IF NOT EXISTS tracking_url text,
  ADD COLUMN IF NOT EXISTS pickup_address text,
  ADD COLUMN IF NOT EXISTS delivery_address text,
  ADD COLUMN IF NOT EXISTS delivery_fee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_fee_original numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS distance_km numeric,
  ADD COLUMN IF NOT EXISTS pod_photo_url text,
  ADD COLUMN IF NOT EXISTS pod_signature_url text,
  ADD COLUMN IF NOT EXISTS geofence_arrived_at timestamptz,
  ADD COLUMN IF NOT EXISTS geofence_left_at timestamptz,
  ADD COLUMN IF NOT EXISTS shipday_status text,
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add Elite free delivery counter to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS free_deliveries_used integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS free_deliveries_reset_month text;

-- RLS: Allow webhook (anon) to update deliveries by shipday_order_id
CREATE POLICY "Webhook can update deliveries" ON public.user_deliveries
  FOR UPDATE USING (true) WITH CHECK (true);

-- RLS: Allow authenticated users to view own deliveries  
CREATE POLICY "Users view own deliveries" ON public.user_deliveries
  FOR SELECT USING (auth.uid() = user_id);

-- RLS: Admins can manage all deliveries
CREATE POLICY "Admins manage all deliveries" ON public.user_deliveries
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS: System can insert deliveries
CREATE POLICY "System can insert deliveries" ON public.user_deliveries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable RLS on user_deliveries if not already
ALTER TABLE public.user_deliveries ENABLE ROW LEVEL SECURITY;

-- Enable realtime for user_deliveries
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_deliveries;
