-- Uber Eats-style Delivery System Enhancement
-- Generated: 2026-03-31
-- Purpose: Multi-role delivery management with real-time tracking

-- =====================================================
-- PART 1: DRIVER MANAGEMENT
-- =====================================================

-- Table for managing delivery drivers (independent contractors)
CREATE TABLE IF NOT EXISTS public.delivery_drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.alpha_partners(id) ON DELETE SET NULL,
  is_independent_contractor BOOLEAN DEFAULT TRUE,
  is_available BOOLEAN DEFAULT TRUE,
  current_latitude DECIMAL(9,6),
  current_longitude DECIMAL(9,6),
  rating DECIMAL(3,2) DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5),
  total_deliveries INTEGER DEFAULT 0,
  completed_deliveries INTEGER DEFAULT 0,
  cancelled_deliveries INTEGER DEFAULT 0,
  vehicle_type TEXT, -- car, motorbike, bicycle, scooter
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_color TEXT,
  vehicle_plate TEXT,
  license_number TEXT,
  insurance_expiry DATE,
  background_check_status TEXT DEFAULT 'pending', -- pending, in_progress, approved, failed
  background_check_date DATE,
  profile_photo_url TEXT,
  bank_account_details JSONB, -- Encrypted payment info
  earnings_total DECIMAL(10,2) DEFAULT 0,
  earnings_pending DECIMAL(10,2) DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for finding available drivers by location
CREATE INDEX IF NOT EXISTS idx_delivery_drivers_available_location 
  ON public.delivery_drivers(current_latitude, current_longitude) 
  WHERE is_available = TRUE AND background_check_status = 'approved';

-- Index for vendor-specific drivers
CREATE INDEX IF NOT EXISTS idx_delivery_drivers_vendor 
  ON public.delivery_drivers(vendor_id) 
  WHERE is_independent_contractor = FALSE;

-- Index for active drivers
CREATE INDEX IF NOT EXISTS idx_delivery_drivers_active 
  ON public.delivery_drivers(is_available, last_active_at) 
  WHERE is_available = TRUE;

COMMENT ON TABLE public.delivery_drivers IS 'Manages delivery drivers (independent contractors and employed drivers)';
COMMENT ON COLUMN public.delivery_drivers.is_independent_contractor IS 'TRUE = freelance driver, FALSE = employed by vendor';
COMMENT ON COLUMN public.delivery_drivers.background_check_status IS 'Must be approved before accepting deliveries';

-- =====================================================
-- PART 2: DELIVERY ASSIGNMENTS
-- =====================================================

-- Table for tracking driver assignments to deliveries
CREATE TABLE IF NOT EXISTS public.delivery_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id UUID REFERENCES public.user_deliveries(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.delivery_drivers(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- pending, accepted, declined, en_route_to_pickup, at_pickup, en_route_to_customer, delivered, cancelled
  rejection_reason TEXT,
  cancellation_reason TEXT,
  route_geometry JSONB, -- GeoJSON LineString of route
  distance_km DECIMAL(8,2),
  duration_minutes INTEGER,
  earnings_amount DECIMAL(10,2),
  tip_amount DECIMAL(10,2) DEFAULT 0,
  total_earnings DECIMAL(10,2),
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_feedback TEXT,
  driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
  driver_feedback TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active assignments
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_active 
  ON public.delivery_assignments(delivery_id, status) 
  WHERE status NOT IN ('delivered', 'cancelled');

-- Index for driver assignments
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_driver 
  ON public.delivery_assignments(driver_id, created_at DESC);

-- Index for pending assignments
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_pending 
  ON public.delivery_assignments(status, assigned_at) 
  WHERE status = 'pending';

COMMENT ON TABLE public.delivery_assignments IS 'Tracks which driver is assigned to which delivery';
COMMENT ON COLUMN public.delivery_assignments.status IS 'Workflow: pending → accepted → en_route_to_pickup → at_pickup → en_route_to_customer → delivered';

-- =====================================================
-- PART 3: ENHANCED DELIVERY FEATURES
-- =====================================================

-- Add vendor-specific columns to user_deliveries
ALTER TABLE public.user_deliveries 
ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.alpha_partners(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS vendor_ready BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS vendor_ready_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES public.delivery_drivers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
ADD COLUMN IF NOT EXISTS driver_feedback TEXT,
ADD COLUMN IF NOT EXISTS customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
ADD COLUMN IF NOT EXISTS customer_feedback TEXT,
ADD COLUMN IF NOT EXISTS delivery_route JSONB, -- GeoJSON LineString
ADD COLUMN IF NOT EXISTS estimated_arrival TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS actual_arrival TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
ADD COLUMN IF NOT EXISTS contactless_delivery BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS signature_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS id_verification_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS age_verification_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tip_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS surge_pricing_multiplier DECIMAL(4,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS promised_by TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_deliveries_vendor_status 
  ON public.user_deliveries(vendor_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_deliveries_driver 
  ON public.user_deliveries(driver_id) 
  WHERE driver_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_deliveries_scheduled 
  ON public.user_deliveries(scheduled_for) 
  WHERE scheduled_for IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_deliveries_promised 
  ON public.user_deliveries(promised_by) 
  WHERE promised_by IS NOT NULL;

COMMENT ON COLUMN public.user_deliveries.vendor_ready IS 'TRUE when order is ready for driver pickup';
COMMENT ON COLUMN public.user_deliveries.contactless_delivery IS 'Leave at door, no contact';
COMMENT ON COLUMN public.user_deliveries.surge_pricing_multiplier IS 'Dynamic pricing multiplier (1.5x = 50% surge)';

-- =====================================================
-- PART 4: DELIVERY ZONES & PRICING
-- =====================================================

-- Define delivery zones for vendors
CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES public.alpha_partners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  geometry JSONB NOT NULL, -- GeoJSON Polygon
  base_fee DECIMAL(10,2) DEFAULT 5.00,
  per_km_fee DECIMAL(10,2) DEFAULT 2.00,
  minimum_order DECIMAL(10,2) DEFAULT 15.00,
  maximum_distance_km DECIMAL(6,2) DEFAULT 20.00,
  estimated_time_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index for zone lookups (if using PostGIS)
-- CREATE INDEX IF NOT EXISTS idx_delivery_zones_geometry 
--   ON public.delivery_zones USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_delivery_zones_vendor 
  ON public.delivery_zones(vendor_id, is_active) 
  WHERE is_active = TRUE;

COMMENT ON TABLE public.delivery_zones IS 'Defines delivery areas and pricing for each vendor';
COMMENT ON COLUMN public.delivery_zones.geometry IS 'GeoJSON Polygon defining delivery boundary';

-- Dynamic pricing configuration
CREATE TABLE IF NOT EXISTS public.delivery_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES public.alpha_partners(id) ON DELETE CASCADE,
  day_of_week INTEGER, -- 0-6 (NULL = all days)
  start_time TIME, -- NULL = all day
  end_time TIME, -- NULL = all day
  multiplier DECIMAL(4,2) DEFAULT 1.00,
  minimum_fee DECIMAL(10,2),
  reason TEXT, -- "rush hour", "weekend", "holiday", etc.
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_pricing_vendor 
  ON public.delivery_pricing(vendor_id, is_active) 
  WHERE is_active = TRUE;

COMMENT ON TABLE public.delivery_pricing IS 'Time-based dynamic pricing rules';

-- =====================================================
-- PART 5: DRIVER DOCUMENTS & COMPLIANCE
-- =====================================================

-- Driver document uploads
CREATE TABLE IF NOT EXISTS public.driver_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES public.delivery_drivers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- license, insurance, registration, background_check
  document_url TEXT NOT NULL,
  expiry_date DATE,
  verification_status TEXT DEFAULT 'pending', -- pending, verified, rejected
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_driver_documents_driver 
  ON public.driver_documents(driver_id, verification_status);

CREATE INDEX IF NOT EXISTS idx_driver_documents_expiry 
  ON public.driver_documents(expiry_date) 
  WHERE expiry_date IS NOT NULL;

COMMENT ON TABLE public.driver_documents IS 'Stores driver licenses, insurance, and other required documents';

-- =====================================================
-- PART 6: EARNINGS & PAYOUTS
-- =====================================================

-- Driver earnings tracking
CREATE TABLE IF NOT EXISTS public.driver_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES public.delivery_drivers(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.delivery_assignments(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL, -- delivery_fee, tip, bonus, promotion, adjustment
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, paid, disputed, reversed
  payout_id UUID,
  paid_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_driver_earnings_driver 
  ON public.driver_earnings(driver_id, status);

CREATE INDEX IF NOT EXISTS idx_driver_earnings_paid 
  ON public.driver_earnings(driver_id, paid_at DESC) 
  WHERE status = 'paid';

COMMENT ON TABLE public.driver_earnings IS 'Tracks all driver earnings and payouts';

-- Payout batches
CREATE TABLE IF NOT EXISTS public.driver_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES public.delivery_drivers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, paid, failed
  payment_method TEXT, -- bank_transfer, paypal, cash_app, etc.
  payment_reference TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_driver_payouts_driver 
  ON public.driver_payouts(driver_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_driver_payouts_status 
  ON public.driver_payouts(status);

COMMENT ON TABLE public.driver_payouts IS 'Batched payouts to drivers (weekly/bi-weekly)';

-- =====================================================
-- PART 7: TRIGGERS & FUNCTIONS
-- =====================================================

-- Function to update driver stats after delivery
CREATE OR REPLACE FUNCTION update_driver_stats()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'delivered' THEN
    UPDATE delivery_drivers
    SET 
      total_deliveries = total_deliveries + 1,
      completed_deliveries = completed_deliveries + 1,
      last_active_at = NOW(),
      updated_at = NOW()
    WHERE id = NEW.driver_id;
    
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'delivered' AND NEW.status = 'delivered' THEN
    UPDATE delivery_drivers
    SET 
      total_deliveries = total_deliveries + 1,
      completed_deliveries = completed_deliveries + 1,
      last_active_at = NOW(),
      updated_at = NOW()
    WHERE id = NEW.driver_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to update driver stats
DROP TRIGGER IF EXISTS trg_update_driver_stats ON public.delivery_assignments;
CREATE TRIGGER trg_update_driver_stats
  AFTER INSERT OR UPDATE OF status ON public.delivery_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_driver_stats();

-- Function to calculate delivery fee based on zone and distance
CREATE OR REPLACE FUNCTION calculate_delivery_fee(
  _vendor_id UUID,
  _distance_km DECIMAL,
  _order_amount DECIMAL
) RETURNS DECIMAL LANGUAGE plpgsql AS $$
DECLARE
  base_fee DECIMAL := 5.00;
  per_km_fee DECIMAL := 2.00;
  min_order DECIMAL := 15.00;
  multiplier DECIMAL := 1.00;
BEGIN
  -- Get zone pricing
  SELECT dz.base_fee, dz.per_km_fee, dz.minimum_order
  INTO base_fee, per_km_fee, min_order
  FROM delivery_zones dz
  WHERE dz.vendor_id = _vendor_id AND dz.is_active = TRUE
  LIMIT 1;
  
  -- Check time-based pricing
  SELECT dzp.multiplier
  INTO multiplier
  FROM delivery_pricing dzp
  WHERE dzp.vendor_id = _vendor_id
    AND dzp.is_active = TRUE
    AND (dzp.day_of_week IS NULL OR dzp.day_of_week = EXTRACT(DOW FROM CURRENT_TIMESTAMP))
    AND (dzp.start_time IS NULL OR CURRENT_TIME >= dzp.start_time)
    AND (dzp.end_time IS NULL OR CURRENT_TIME <= dzp.end_time)
  ORDER BY dzp.multiplier DESC
  LIMIT 1;
  
  -- Calculate final fee
  RETURN (base_fee + (_distance_km * per_km_fee)) * multiplier;
END;
$$;

-- Function to find nearest available drivers
CREATE OR REPLACE FUNCTION find_nearby_drivers(
  _latitude DECIMAL,
  _longitude DECIMAL,
  _radius_km DECIMAL DEFAULT 10.0,
  _limit INTEGER DEFAULT 10
) RETURNS TABLE (
  driver_id UUID,
  distance_km DECIMAL,
  rating DECIMAL,
  total_deliveries INTEGER,
  vehicle_type TEXT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dd.id,
    (6371 * acos(
      cos(radians(_latitude)) *
      cos(radians(dd.current_latitude::float)) *
      cos(radians(dd.current_longitude::float) - radians(_longitude)) +
      sin(radians(_latitude)) *
      sin(radians(dd.current_latitude::float))
    ))::DECIMAL(8,2) as distance_km,
    dd.rating,
    dd.total_deliveries,
    dd.vehicle_type
  FROM delivery_drivers dd
  WHERE dd.is_available = TRUE
    AND dd.background_check_status = 'approved'
    AND dd.current_latitude IS NOT NULL
    AND dd.current_longitude IS NOT NULL
  ORDER BY distance_km ASC
  LIMIT _limit;
END;
$$;

-- =====================================================
-- PART 8: RLS POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE public.delivery_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_pricing ENABLE ROW LEVEL SECURITY;

-- Drivers can view their own data
CREATE POLICY "Drivers can view own profile"
  ON public.delivery_drivers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Drivers can update own profile"
  ON public.delivery_drivers FOR UPDATE
  USING (auth.uid() = user_id);

-- Vendors can view their drivers
CREATE POLICY "Vendors can view their drivers"
  ON public.delivery_drivers FOR SELECT
  USING (
    vendor_id IN (
      SELECT va.partner_id
      FROM vendor_accounts va
      WHERE va.user_id = auth.uid()
        AND va.is_active = TRUE
        AND va.role IN ('owner', 'manager')
    )
  );

-- Customers can view their assigned driver
CREATE POLICY "Customers can view assigned driver"
  ON public.delivery_drivers FOR SELECT
  USING (
    id IN (
      SELECT ud.driver_id
      FROM user_deliveries ud
      WHERE ud.user_id = auth.uid()
    )
  );

-- Assignments: drivers see their own, customers see theirs, vendors/admins see all
CREATE POLICY "Drivers can view own assignments"
  ON public.delivery_assignments FOR SELECT
  USING (driver_id IN (SELECT id FROM delivery_drivers WHERE user_id = auth.uid()));

CREATE POLICY "Customers can view own assignments"
  ON public.delivery_assignments FOR SELECT
  USING (delivery_id IN (SELECT id FROM user_deliveries WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can view assignments for their store"
  ON public.delivery_assignments FOR SELECT
  USING (
    delivery_id IN (
      SELECT ud.id
      FROM user_deliveries ud
      WHERE ud.vendor_id IN (
        SELECT va.partner_id
        FROM vendor_accounts va
        WHERE va.user_id = auth.uid()
          AND va.is_active = TRUE
      )
    )
  );

-- Admins have full access
CREATE POLICY "Admins can manage all drivers"
  ON public.delivery_drivers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.app_role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all assignments"
  ON public.delivery_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.app_role = 'admin'
    )
  );

-- =====================================================
-- PART 9: GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON public.delivery_drivers TO service_role;
GRANT ALL ON public.delivery_assignments TO service_role;
GRANT ALL ON public.driver_documents TO service_role;
GRANT ALL ON public.driver_earnings TO service_role;
GRANT ALL ON public.driver_payouts TO service_role;
GRANT ALL ON public.delivery_zones TO service_role;
GRANT ALL ON public.delivery_pricing TO service_role;

-- Authenticated users can view drivers (for customer-facing features)
GRANT SELECT ON public.delivery_drivers TO authenticated;
GRANT SELECT ON public.delivery_assignments TO authenticated;

-- =====================================================
-- PART 10: CLEANUP & MAINTENANCE
-- =====================================================

-- Analyze tables for query planner
ANALYZE public.delivery_drivers;
ANALYZE public.delivery_assignments;
ANALYZE public.driver_documents;
ANALYZE public.driver_earnings;
ANALYZE public.driver_payouts;
ANALYZE public.delivery_zones;
ANALYZE public.delivery_pricing;

-- Add comments for documentation
COMMENT ON SCHEMA public IS 'Alpha Appeal delivery system with Uber Eats-style multi-role management';
