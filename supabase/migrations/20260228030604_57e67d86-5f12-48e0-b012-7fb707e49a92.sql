
-- Notifications table
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT NOT NULL DEFAULT 'general',
  seen BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.user_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications" ON public.user_notifications
  FOR INSERT WITH CHECK (true);

-- Event bookings table
CREATE TABLE public.event_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID NOT NULL REFERENCES public.member_events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

ALTER TABLE public.event_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bookings" ON public.event_bookings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON public.event_bookings
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Reward claims table
CREATE TABLE public.reward_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES public.member_rewards(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reward_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own claims" ON public.reward_claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own claims" ON public.reward_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all claims" ON public.reward_claims
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
