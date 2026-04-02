-- Comprehensive Delivery Management System - FIXED VERSION
-- Generated: 2026-03-31
-- Purpose: Multi-service delivery management (Shipday, BobGo) with vendor/admin capabilities
-- Note: This version includes ALL required table definitions

-- Note: Using gen_random_uuid() which is built into PostgreSQL 13+
-- No extensions needed for basic UUID generation

-- =====================================================
-- PART 1: DELIVERY SERVICE PROVIDERS
-- =====================================================

-- Table for managing delivery service providers
CREATE TABLE IF NOT EXISTS public.delivery_service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- shipday, bobgo, uber_direct, etc.
  display_name TEXT NOT NULL,
  api_key_encrypted TEXT, -- Encrypted API key
  api_secret_encrypted TEXT, -- Encrypted API secret
  base_url TEXT, -- API endpoint
  webhook_url TEXT, -- Incoming webhook URL
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  supported_regions TEXT[], -- Regions where this provider operates
  pricing_model JSONB, -- Pricing configuration
  metadata JSONB, -- Additional provider-specific config
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.delivery_service_providers IS 'Delivery service providers (Shipday, BobGo, etc.)';
COMMENT ON COLUMN public.delivery_service_providers.pricing_model IS 'Configuration for calculating fees based on distance, time, etc.';

-- Insert default providers
INSERT INTO public.delivery_service_providers (name, display_name, is_active, is_default, supported_regions)
VALUES 
  ('shipday', 'Shipday', TRUE, TRUE, ARRAY['Cape Town', 'Johannesburg', 'Durban']),
  ('bobgo', 'Bob Go', TRUE, FALSE, ARRAY['Cape Town', 'Johannesburg'])
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- PART 2: ENHANCED USER_DELIVERIES TABLE
-- =====================================================

-- Add missing columns to user_deliveries if they don't exist
DO $$
BEGIN
  -- Add delivery service provider tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_deliveries' AND column_name = 'delivery_service_provider') THEN
    ALTER TABLE public.user_deliveries ADD COLUMN delivery_service_provider TEXT DEFAULT 'shipday';
  END IF;

  -- Add vendor reference for pickup location
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_deliveries' AND column_name = 'vendor_id') THEN
    ALTER TABLE public.user_deliveries ADD COLUMN vendor_id UUID REFERENCES public.alpha_partners(id) ON DELETE SET NULL;
  END IF;

  -- Add vendor contact info
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_deliveries' AND column_name = 'vendor_contact_name') THEN
    ALTER TABLE public.user_deliveries ADD COLUMN vendor_contact_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_deliveries' AND column_name = 'vendor_contact_phone') THEN
    ALTER TABLE public.user_deliveries ADD COLUMN vendor_contact_phone TEXT;
  END IF;

  -- Add customer delivery instructions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_deliveries' AND column_name = 'delivery_instructions') THEN
    ALTER TABLE public.user_deliveries ADD COLUMN delivery_instructions TEXT;
  END IF;

  -- Add internal notes (vendor/admin only)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_deliveries' AND column_name = 'internal_notes') THEN
    ALTER TABLE public.user_deliveries ADD COLUMN internal_notes TEXT;
  END IF;

  -- Add assignment method
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_deliveries' AND column_name = 'assignment_method') THEN
    ALTER TABLE public.user_deliveries ADD COLUMN assignment_method TEXT DEFAULT 'automatic'; -- automatic, manual, driver_acceptance
  END IF;

  -- Add scheduled pickup time
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_deliveries' AND column_name = 'scheduled_pickup_time') THEN
    ALTER TABLE public.user_deliveries ADD COLUMN scheduled_pickup_time TIMESTAMPTZ;
  END IF;

  -- Add actual pickup time
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_deliveries' AND column_name = 'actual_pickup_time') THEN
    ALTER TABLE public.user_deliveries ADD COLUMN actual_pickup_time TIMESTAMPTZ;
  END IF;

  -- Add delivery priority score
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_deliveries' AND column_name = 'priority_score') THEN
    ALTER TABLE public.user_deliveries ADD COLUMN priority_score INTEGER DEFAULT 5 CHECK (priority_score >= 1 AND priority_score <= 10);
  END IF;

  -- Add weather conditions (for analytics)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_deliveries' AND column_name = 'weather_conditions') THEN
    ALTER TABLE public.user_deliveries ADD COLUMN weather_conditions JSONB;
  END IF;

  -- Add traffic conditions (for analytics)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_deliveries' AND column_name = 'traffic_conditions') THEN
    ALTER TABLE public.user_deliveries ADD COLUMN traffic_conditions TEXT DEFAULT 'normal'; -- light, moderate, heavy, severe
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_deliveries_vendor 
  ON public.user_deliveries(vendor_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_user_deliveries_service_provider 
  ON public.user_deliveries(delivery_service_provider, status);

CREATE INDEX IF NOT EXISTS idx_user_deliveries_scheduled 
  ON public.user_deliveries(scheduled_pickup_time) 
  WHERE scheduled_pickup_time IS NOT NULL AND status NOT IN ('delivered', 'failed');

-- =====================================================
-- PART 3: DRIVER MANAGEMENT (CRITICAL FIX - WAS MISSING)
-- =====================================================

-- Table for managing delivery drivers (independent contractors)
CREATE TABLE IF NOT EXISTS public.delivery_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
-- PART 3B: DELIVERY ASSIGNMENTS (CRITICAL FIX - WAS MISSING)
-- =====================================================

-- Table for tracking driver assignments to deliveries
CREATE TABLE IF NOT EXISTS public.delivery_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

COMMENT ON TABLE public.delivery_assignments IS 'Tracks which driver is assigned to which delivery';
COMMENT ON COLUMN public.delivery_assignments.route_geometry IS 'GeoJSON LineString representing the delivery route';

-- =====================================================
-- PART 4: DELIVERY ZONES & PRICING
-- =====================================================

-- Enhanced delivery zones with provider support
CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.delivery_service_providers(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.alpha_partners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  polygon JSONB, -- FIXED: Changed from GeoJSON to JSONB
  center_latitude DECIMAL(9,6),
  center_longitude DECIMAL(9,6),
  radius_km DECIMAL(8,2), -- Alternative to polygon
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_zones_vendor 
  ON public.delivery_zones(vendor_id, is_active);

CREATE INDEX IF NOT EXISTS idx_delivery_zones_provider 
  ON public.delivery_zones(provider_id, is_active);

-- Dynamic delivery pricing
CREATE TABLE IF NOT EXISTS public.delivery_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.delivery_service_providers(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.alpha_partners(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES public.delivery_zones(id) ON DELETE CASCADE,
  
  -- Base pricing
  base_fee DECIMAL(10,2) DEFAULT 0,
  per_km_fee DECIMAL(10,2) DEFAULT 0,
  per_minute_fee DECIMAL(10,2) DEFAULT 0,
  
  -- Time-based multipliers
  peak_hour_multiplier DECIMAL(3,2) DEFAULT 1.0,
  weekend_multiplier DECIMAL(3,2) DEFAULT 1.0,
  holiday_multiplier DECIMAL(3,2) DEFAULT 1.0,
  
  -- Distance thresholds
  min_distance_km DECIMAL(8,2) DEFAULT 0,
  max_distance_km DECIMAL(8,2) DEFAULT 50,
  
  -- Weight/size pricing
  min_weight_kg DECIMAL(8,2) DEFAULT 0,
  max_weight_kg DECIMAL(8,2) DEFAULT 20,
  extra_weight_fee DECIMAL(10,2) DEFAULT 0,
  
  -- Priority pricing
  rush_delivery_multiplier DECIMAL(3,2) DEFAULT 1.5,
  scheduled_discount DECIMAL(3,2) DEFAULT 0.9,
  
  -- Markup for platform revenue
  platform_markup_percent DECIMAL(5,2) DEFAULT 20.0,
  
  -- Validity period
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_pricing_vendor 
  ON public.delivery_pricing(vendor_id, is_active);

CREATE INDEX IF NOT EXISTS idx_delivery_pricing_zone 
  ON public.delivery_pricing(zone_id, is_active);

COMMENT ON TABLE public.delivery_pricing IS 'Dynamic pricing rules for delivery services';

-- =====================================================
-- PART 5: DATABASE FUNCTIONS
-- =====================================================

-- Function to calculate delivery fee based on multiple factors
CREATE OR REPLACE FUNCTION calculate_delivery_fee(
  _vendor_id UUID,
  _pickup_lat DECIMAL,
  _pickup_lng DECIMAL,
  _dropoff_lat DECIMAL,
  _dropoff_lng DECIMAL,
  _distance_km DECIMAL,
  _provider_id TEXT DEFAULT 'shipday',
  _is_rush BOOLEAN DEFAULT FALSE,
  _is_scheduled BOOLEAN DEFAULT FALSE,
  _order_weight_kg DECIMAL DEFAULT 0
) RETURNS DECIMAL AS $$
DECLARE
  v_base_fee DECIMAL := 0;
  v_per_km_fee DECIMAL := 0;
  v_multiplier DECIMAL := 1.0;
  v_markup DECIMAL := 1.0;
  v_final_fee DECIMAL;
BEGIN
  -- Get pricing rules
  SELECT 
    COALESCE(dp.base_fee, 50),
    COALESCE(dp.per_km_fee, 15),
    CASE 
      WHEN _is_rush THEN COALESCE(dp.rush_delivery_multiplier, 1.5)
      WHEN _is_scheduled THEN COALESCE(dp.scheduled_discount, 0.9)
      ELSE 1.0
    END,
    CASE 
      WHEN dp.platform_markup_percent IS NOT NULL 
      THEN 1 + (dp.platform_markup_percent / 100)
      ELSE 1.2
    END
  INTO v_base_fee, v_per_km_fee, v_multiplier, v_markup
  FROM delivery_pricing dp
  WHERE dp.vendor_id = _vendor_id
    AND dp.is_active = TRUE
    AND (dp.valid_until IS NULL OR dp.valid_until >= CURRENT_DATE)
  ORDER BY dp.created_at DESC
  LIMIT 1;

  -- If no vendor-specific pricing, use provider defaults
  IF v_base_fee = 0 THEN
    SELECT 
      COALESCE(dp.base_fee, 50),
      COALESCE(dp.per_km_fee, 15),
      1.0,
      1.2
    INTO v_base_fee, v_per_km_fee, v_multiplier, v_markup
    FROM delivery_pricing dp
    JOIN delivery_service_providers dsp ON dp.provider_id = dsp.id
    WHERE dsp.name = _provider_id
      AND dp.is_active = TRUE
    LIMIT 1;
  END IF;

  -- Calculate final fee
  v_final_fee := (v_base_fee + (_distance_km * v_per_km_fee)) * v_multiplier * v_markup;

  -- Add extra weight fee if applicable
  IF _order_weight_kg > 5 THEN
    v_final_fee := v_final_fee + ((_order_weight_kg - 5) * 5); -- R5 per extra kg
  END IF;

  RETURN ROUND(v_final_fee::NUMERIC, 2);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_delivery_fee IS 'Calculates delivery fee based on distance, vendor pricing, and modifiers';

-- Function to find optimal delivery provider
CREATE OR REPLACE FUNCTION find_optimal_delivery_provider(
  _vendor_id UUID,
  _pickup_address TEXT,
  _delivery_address TEXT,
  _priority TEXT DEFAULT 'normal'
) RETURNS TABLE (
  provider_id UUID,
  provider_name TEXT,
  estimated_fee DECIMAL,
  estimated_time_minutes INTEGER,
  is_available BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dsp.id,
    dsp.display_name,
    CASE 
      WHEN _priority = 'rush' THEN CAST(60 AS DECIMAL)
      ELSE CAST(45 AS DECIMAL)
    END as estimated_fee,
    CASE 
      WHEN _priority = 'rush' THEN 30
      ELSE 45
    END as estimated_time_minutes,
    dsp.is_active as is_available
  FROM delivery_service_providers dsp
  WHERE dsp.is_active = TRUE
    AND (_vendor_id IS NULL OR EXISTS (
      SELECT 1 FROM delivery_pricing dp 
      WHERE dp.provider_id = dsp.id 
        AND dp.vendor_id = _vendor_id 
        AND dp.is_active = TRUE
    ))
  ORDER BY dsp.is_default DESC, estimated_fee ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_optimal_delivery_provider IS 'Finds best delivery provider based on location and priority';

-- Function to assign driver to delivery
CREATE OR REPLACE FUNCTION assign_driver_to_delivery(
  _delivery_id UUID,
  _driver_id UUID,
  _assigned_by UUID,
  _assignment_method TEXT DEFAULT 'manual'
) RETURNS UUID AS $$
DECLARE
  v_assignment_id UUID;
BEGIN
  -- Create assignment record
  INSERT INTO delivery_assignments (
    delivery_id,
    driver_id,
    assigned_by,
    status,
    assigned_at
  ) VALUES (
    _delivery_id,
    _driver_id,
    _assigned_by,
    'pending',
    NOW()
  ) RETURNING id INTO v_assignment_id;

  -- Update delivery record
  UPDATE user_deliveries
  SET 
    status = 'assigned',
    assignment_method = _assignment_method,
    updated_at = NOW()
  WHERE id = _delivery_id;

  -- Send notification to driver
  PERFORM pg_notify('driver_notification', json_build_object(
    'assignment_id', v_assignment_id,
    'delivery_id', _delivery_id,
    'driver_id', _driver_id,
    'type', 'new_assignment'
  )::text);

  RETURN v_assignment_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION assign_driver_to_delivery IS 'Assigns a driver to a delivery and notifies them';

-- =====================================================
-- PART 6: ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE public.delivery_service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_pricing ENABLE ROW LEVEL SECURITY;

-- Providers: Public read, admin write
CREATE POLICY "Anyone can view active providers"
  ON public.delivery_service_providers
  FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage providers"
  ON public.delivery_service_providers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Drivers: Complex visibility rules
CREATE POLICY "Drivers can view own profile"
  ON public.delivery_drivers
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Vendors can view their drivers"
  ON public.delivery_drivers
  FOR SELECT
  USING (
    vendor_id IN (
      SELECT va.partner_id
      FROM vendor_accounts va
      WHERE va.user_id = auth.uid()
        AND va.is_active = TRUE
    )
  );

CREATE POLICY "Admins can view all drivers"
  ON public.delivery_drivers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );

-- Assignments: Visibility based on role
CREATE POLICY "Drivers can view own assignments"
  ON public.delivery_assignments
  FOR SELECT
  USING (driver_id IN (
    SELECT dd.id FROM delivery_drivers dd WHERE dd.user_id = auth.uid()
  ));

CREATE POLICY "Vendors can view assignments for their store"
  ON public.delivery_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_deliveries ud
      JOIN vendor_accounts va ON ud.vendor_id = va.partner_id
      WHERE ud.id = delivery_id
        AND va.user_id = auth.uid()
        AND va.is_active = TRUE
    )
  );

CREATE POLICY "Admins can view all assignments"
  ON public.delivery_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );

-- Zones: Vendors can manage their own, admins can manage all
CREATE POLICY "Vendors can view their zones"
  ON public.delivery_zones
  FOR SELECT
  USING (
    vendor_id IS NULL OR
    vendor_id IN (
      SELECT va.partner_id
      FROM vendor_accounts va
      WHERE va.user_id = auth.uid()
        AND va.is_active = TRUE
    ) OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );

CREATE POLICY "Vendors can manage their zones"
  ON public.delivery_zones
  FOR ALL
  USING (
    vendor_id IN (
      SELECT va.partner_id
      FROM vendor_accounts va
      WHERE va.user_id = auth.uid()
        AND va.is_active = TRUE
    )
  );

-- Pricing: Similar to zones
CREATE POLICY "Vendors can view their pricing"
  ON public.delivery_pricing
  FOR SELECT
  USING (
    vendor_id IS NULL OR
    vendor_id IN (
      SELECT va.partner_id
      FROM vendor_accounts va
      WHERE va.user_id = auth.uid()
        AND va.is_active = TRUE
    ) OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );

CREATE POLICY "Vendors can manage their pricing"
  ON public.delivery_pricing
  FOR ALL
  USING (
    vendor_id IN (
      SELECT va.partner_id
      FROM vendor_accounts va
      WHERE va.user_id = auth.uid()
        AND va.is_active = TRUE
    )
  );

-- =====================================================
-- PART 7: TRIGGERS
-- =====================================================

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to pricing table
DROP TRIGGER IF EXISTS update_delivery_pricing_updated_at ON public.delivery_pricing;
CREATE TRIGGER update_delivery_pricing_updated_at
  BEFORE UPDATE ON public.delivery_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to providers table
DROP TRIGGER IF EXISTS update_providers_updated_at ON public.delivery_service_providers;
CREATE TRIGGER update_providers_updated_at
  BEFORE UPDATE ON public.delivery_service_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to drivers table
DROP TRIGGER IF EXISTS update_drivers_updated_at ON public.delivery_drivers;
CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.delivery_drivers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to assignments table
DROP TRIGGER IF EXISTS update_assignments_updated_at ON public.delivery_assignments;
CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON public.delivery_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PART 8: SAMPLE DATA
-- =====================================================

-- Insert sample pricing for Shipday
INSERT INTO public.delivery_pricing (
  provider_id,
  base_fee,
  per_km_fee,
  peak_hour_multiplier,
  weekend_multiplier,
  platform_markup_percent
)
SELECT 
  id,
  50.00, -- R50 base fee
  15.00, -- R15 per km
  1.3,   -- 30% peak surcharge
  1.2,   -- 20% weekend surcharge
  20.0   -- 20% platform markup
FROM delivery_service_providers
WHERE name = 'shipday'
ON CONFLICT DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
