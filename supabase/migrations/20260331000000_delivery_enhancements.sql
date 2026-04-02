-- Delivery system enhancements
-- Generated: 2026-03-31

-- =====================================================
-- PART 1: ERROR TRACKING TABLE
-- =====================================================

-- Table to track delivery-related errors for monitoring and debugging
CREATE TABLE IF NOT EXISTS public.delivery_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id),
  delivery_id UUID REFERENCES public.user_deliveries(id),
  shipday_order_id TEXT,
  error_type TEXT NOT NULL, -- webhook_update_failed, post_to_shipday_failed, retry_failed, etc.
  error_message TEXT,
  error_details JSONB,
  stack_trace TEXT,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  attempts INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_delivery_errors_type 
  ON public.delivery_errors(error_type);

CREATE INDEX IF NOT EXISTS idx_delivery_errors_occurred 
  ON public.delivery_errors(occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_delivery_errors_unresolved 
  ON public.delivery_errors(occurred_at) 
  WHERE resolved = FALSE;

CREATE INDEX IF NOT EXISTS idx_delivery_errors_shipday 
  ON public.delivery_errors(shipday_order_id) 
  WHERE shipday_order_id IS NOT NULL;

COMMENT ON TABLE public.delivery_errors IS 'Tracks delivery processing errors for monitoring and debugging';
COMMENT ON COLUMN public.delivery_errors.error_type IS 'Category of error: webhook_update_failed, post_to_shipday_failed, retry_failed, etc.';
COMMENT ON COLUMN public.delivery_errors.resolved IS 'Whether the error has been addressed';

-- =====================================================
-- PART 2: RETRY QUEUE FOR FAILED OPERATIONS
-- =====================================================

-- Queue for retrying failed delivery operations
CREATE TABLE IF NOT EXISTS public.delivery_retry_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  delivery_id UUID REFERENCES public.user_deliveries(id),
  operation_type TEXT NOT NULL, -- post_to_shipday, update_status, notify_customer
  error_type TEXT,
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  retry_after TIMESTAMPTZ DEFAULT NOW(),
  last_attempt_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  priority INTEGER DEFAULT 5, -- 1=highest, 10=lowest
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolution_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for pending retries (most critical query)
CREATE INDEX IF NOT EXISTS idx_delivery_retry_queue_pending 
  ON public.delivery_retry_queue(retry_after, resolved, priority) 
  WHERE resolved = FALSE;

-- Index for order lookups
CREATE INDEX IF NOT EXISTS idx_delivery_retry_queue_order 
  ON public.delivery_retry_queue(order_id) 
  WHERE resolved = FALSE;

-- Index for delivery lookups
CREATE INDEX IF NOT EXISTS idx_delivery_retry_queue_delivery 
  ON public.delivery_retry_queue(delivery_id) 
  WHERE delivery_id IS NOT NULL AND resolved = FALSE;

COMMENT ON TABLE public.delivery_retry_queue IS 'Queue for retrying failed delivery operations with exponential backoff';
COMMENT ON COLUMN public.delivery_retry_queue.priority IS 'Retry priority: 1=highest (rush orders), 10=lowest';
COMMENT ON COLUMN public.delivery_retry_queue.max_attempts IS 'Maximum retry attempts before giving up';

-- =====================================================
-- PART 3: DELIVERY NOTIFICATIONS LOG
-- =====================================================

-- Track all delivery notifications sent to customers
CREATE TABLE IF NOT EXISTS public.delivery_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  delivery_id UUID REFERENCES public.user_deliveries(id),
  notification_type TEXT NOT NULL, -- driver_assigned, out_for_delivery, delivered, failed
  channel TEXT NOT NULL, -- email, sms, push, in_app
  status TEXT DEFAULT 'pending', -- pending, sent, delivered, failed, bounced
  recipient_address TEXT, -- email or phone number
  subject TEXT,
  message_body TEXT,
  metadata JSONB,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notification tracking
CREATE INDEX IF NOT EXISTS idx_delivery_notifications_user 
  ON public.delivery_notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_delivery_notifications_delivery 
  ON public.delivery_notifications(delivery_id);

CREATE INDEX IF NOT EXISTS idx_delivery_notifications_status 
  ON public.delivery_notifications(status);

CREATE INDEX IF NOT EXISTS idx_delivery_notifications_type 
  ON public.delivery_notifications(notification_type);

COMMENT ON TABLE public.delivery_notifications IS 'Logs all delivery-related notifications sent to customers';
COMMENT ON COLUMN public.delivery_notifications.channel IS 'Notification channel: email, sms, push, in_app';
COMMENT ON COLUMN public.delivery_notifications.status IS 'Delivery status: pending, sent, delivered, failed, bounced';

-- =====================================================
-- PART 4: DELIVERY ANALYTICS VIEW
-- =====================================================

-- Materialized view for delivery performance metrics
CREATE OR REPLACE VIEW admin.delivery_metrics AS
SELECT 
  DATE(d.created_at) as metric_date,
  COUNT(*) FILTER (WHERE d.status = 'delivered') as completed_deliveries,
  COUNT(*) FILTER (WHERE d.status = 'failed') as failed_deliveries,
  COUNT(*) FILTER (WHERE d.status IN ('pending', 'assigned', 'in_transit')) as active_deliveries,
  COUNT(*) FILTER (WHERE d.priority = 'rush') as rush_deliveries,
  AVG(d.delivery_fee) FILTER (WHERE d.delivery_fee > 0) as avg_delivery_fee,
  AVG(d.distance_km) FILTER (WHERE d.distance_km > 0) as avg_distance_km,
  
  -- Timing metrics
  AVG(
    EXTRACT(EPOCH FROM (d.delivered_at - d.created_at)) / 60
  ) FILTER (WHERE d.status = 'delivered' AND d.delivered_at IS NOT NULL) as avg_total_time_minutes,
  
  AVG(
    EXTRACT(EPOCH FROM (d.delivered_at - COALESCE(d.geofence_arrived_at, d.created_at))) / 60
  ) FILTER (WHERE d.status = 'delivered' AND d.delivered_at IS NOT NULL) as avg_delivery_time_minutes,
  
  -- Success rate
  CASE 
    WHEN COUNT(*) > 0 THEN 
      COUNT(*) FILTER (WHERE d.status = 'delivered') * 100.0 / COUNT(*)
    ELSE 0 
  END as success_rate_percent,
  
  -- Error tracking
  COUNT(DISTINCT e.id) FILTER (WHERE e.occurred_at >= d.created_at) as error_count
  
FROM user_deliveries d
LEFT JOIN delivery_errors e ON d.id = e.delivery_id
GROUP BY DATE(d.created_at)
ORDER BY metric_date DESC;

COMMENT ON VIEW admin.delivery_metrics IS 'Daily delivery performance metrics including completion rates, timing, and errors';

-- =====================================================
-- PART 5: TRIGGERS FOR AUTOMATION
-- =====================================================

-- Function to automatically log errors when delivery updates fail
CREATE OR REPLACE FUNCTION log_delivery_error()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- If status changes to failed, log it
  IF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    INSERT INTO delivery_errors (
      delivery_id,
      order_id,
      shipday_order_id,
      error_type,
      error_message,
      occurred_at
    ) VALUES (
      NEW.id,
      NEW.order_id,
      NEW.shipday_order_id,
      'delivery_failed',
      'Delivery marked as failed',
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Attach trigger to user_deliveries
DROP TRIGGER IF EXISTS trg_delivery_error_logging ON public.user_deliveries;
CREATE TRIGGER trg_delivery_error_logging
  AFTER UPDATE OF status ON public.user_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION log_delivery_error();

-- Function to auto-schedule retries
CREATE OR REPLACE FUNCTION schedule_delivery_retry()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  retry_delay INTERVAL;
BEGIN
  -- Calculate exponential backoff delay (in minutes)
  retry_delay := (POWER(2, NEW.attempts) * 5) * INTERVAL '1 minute';
  
  -- Set next retry time
  NEW.next_retry_at := NOW() + retry_delay;
  
  -- Cap at 24 hours for high attempt counts
  IF NEW.next_retry_at > NOW() + INTERVAL '24 hours' THEN
    NEW.next_retry_at := NOW() + INTERVAL '24 hours';
  END IF;
  
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$;

-- Attach trigger to retry_queue
DROP TRIGGER IF EXISTS trg_retry_schedule ON public.delivery_retry_queue;
CREATE TRIGGER trg_retry_schedule
  BEFORE INSERT OR UPDATE OF attempts ON public.delivery_retry_queue
  FOR EACH ROW
  EXECUTE FUNCTION schedule_delivery_retry();

-- =====================================================
-- PART 6: GRANT PERMISSIONS
-- =====================================================

-- Service role has full access
GRANT ALL ON public.delivery_errors TO service_role;
GRANT ALL ON public.delivery_retry_queue TO service_role;
GRANT ALL ON public.delivery_notifications TO service_role;

-- Authenticated users can only view their own notifications
GRANT SELECT ON public.delivery_notifications TO authenticated;
CREATE POLICY "Users can view own notifications"
  ON public.delivery_notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can manage all tables
CREATE POLICY "Admins can manage delivery errors"
  ON public.delivery_errors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.app_role = 'admin'
    )
  );

CREATE POLICY "Admins can manage retry queue"
  ON public.delivery_retry_queue FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.app_role = 'admin'
    )
  );

CREATE POLICY "Admins can manage notifications"
  ON public.delivery_notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.app_role = 'admin'
    )
  );

-- =====================================================
-- PART 7: CLEANUP & MAINTENANCE
-- =====================================================

-- Analyze new tables for query planner
ANALYZE public.delivery_errors;
ANALYZE public.delivery_retry_queue;
ANALYZE public.delivery_notifications;

COMMENT ON INDEX public.idx_delivery_errors_unresolved IS 'Fast lookup of unresolved errors';
COMMENT ON INDEX public.idx_delivery_retry_queue_pending IS 'Critical index for retry processor';
