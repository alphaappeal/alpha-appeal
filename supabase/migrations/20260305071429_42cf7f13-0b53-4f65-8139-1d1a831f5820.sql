
-- Platform metrics table for daily analytics snapshots
CREATE TABLE public.platform_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  total_users integer NOT NULL DEFAULT 0,
  active_subscriptions integer NOT NULL DEFAULT 0,
  revenue_total numeric NOT NULL DEFAULT 0,
  new_signups_today integer NOT NULL DEFAULT 0,
  pending_applications integer NOT NULL DEFAULT 0,
  total_orders integer NOT NULL DEFAULT 0,
  total_products integer NOT NULL DEFAULT 0,
  total_strains integer NOT NULL DEFAULT 0,
  total_culture_items integer NOT NULL DEFAULT 0,
  total_diary_entries integer NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(snapshot_date)
);

-- Maintenance logs table to track cron job runs
CREATE TABLE public.maintenance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL,
  status text NOT NULL DEFAULT 'running',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  records_affected integer DEFAULT 0,
  details jsonb DEFAULT '{}'::jsonb,
  error_message text
);

-- Enable RLS
ALTER TABLE public.platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Admins only
CREATE POLICY "Admins can manage platform metrics"
  ON public.platform_metrics FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage maintenance logs"
  ON public.maintenance_logs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow service role (edge functions) to insert without auth
CREATE POLICY "Service can insert metrics"
  ON public.platform_metrics FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service can insert maintenance logs"
  ON public.maintenance_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service can update maintenance logs"
  ON public.maintenance_logs FOR UPDATE
  TO service_role
  USING (true);
