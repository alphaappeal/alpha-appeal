
-- Admin alerts table
CREATE TABLE IF NOT EXISTS public.admin_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text,
  alert_type text DEFAULT 'info',
  target_tier text[] DEFAULT ARRAY['private','essential','elite'],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view alerts"
  ON public.admin_alerts FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage alerts"
  ON public.admin_alerts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Track which alerts users have seen
CREATE TABLE IF NOT EXISTS public.user_alert_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  alert_id uuid NOT NULL REFERENCES public.admin_alerts(id) ON DELETE CASCADE,
  read_at timestamptz DEFAULT now(),
  UNIQUE(user_id, alert_id)
);

ALTER TABLE public.user_alert_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own alert reads"
  ON public.user_alert_reads FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add last_visit_at to users for streak tracking
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_visit_at timestamptz;

-- Add unique constraint on username if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_username_unique'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);
  END IF;
END $$;
