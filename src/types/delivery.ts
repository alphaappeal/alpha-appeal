/**
 * Delivery Management System Type Definitions
 * 
 * These types provide full TypeScript support for the delivery management system.
 * They compensate for the Supabase CLI type generation issue.
 * 
 * Usage:
 * import type { DeliveryProvider, DeliveryDriver } from '@/types/delivery';
 */

import type { Json } from '../integrations/supabase/types';

// =====================================================
// DELIVERY SERVICE PROVIDERS
// =====================================================

export interface DeliveryProvider {
  id: string;
  name: string; // 'shipday' | 'bobgo' | 'uber_direct'
  display_name: string;
  api_key_encrypted: string | null;
  api_secret_encrypted: string | null;
  base_url: string | null;
  webhook_url: string | null;
  is_active: boolean;
  is_default: boolean;
  supported_regions: string[] | null;
  pricing_model: Json | null;
  metadata: Json | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryProviderInsert {
  id?: string;
  name: string;
  display_name: string;
  api_key_encrypted?: string | null;
  api_secret_encrypted?: string | null;
  base_url?: string | null;
  webhook_url?: string | null;
  is_active?: boolean;
  is_default?: boolean;
  supported_regions?: string[] | null;
  pricing_model?: Json | null;
  metadata?: Json | null;
  created_at?: string;
  updated_at?: string;
}

export interface DeliveryProviderUpdate {
  id?: string;
  name?: string;
  display_name?: string;
  api_key_encrypted?: string | null;
  api_secret_encrypted?: string | null;
  base_url?: string | null;
  webhook_url?: string | null;
  is_active?: boolean;
  is_default?: boolean;
  supported_regions?: string[] | null;
  pricing_model?: Json | null;
  metadata?: Json | null;
  created_at?: string;
  updated_at?: string;
}

// =====================================================
// DELIVERY DRIVERS
// =====================================================

export interface DeliveryDriver {
  id: string;
  user_id: string | null;
  vendor_id: string | null;
  is_independent_contractor: boolean;
  is_available: boolean;
  current_latitude: number | null;
  current_longitude: number | null;
  rating: number | null;
  total_deliveries: number;
  completed_deliveries: number;
  cancelled_deliveries: number;
  vehicle_type: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_color: string | null;
  vehicle_plate: string | null;
  license_number: string | null;
  insurance_expiry: string | null;
  background_check_status: string;
  background_check_date: string | null;
  profile_photo_url: string | null;
  bank_account_details: Json | null;
  earnings_total: number;
  earnings_pending: number;
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryDriverInsert {
  id?: string;
  user_id?: string | null;
  vendor_id?: string | null;
  is_independent_contractor?: boolean;
  is_available?: boolean;
  current_latitude?: number | null;
  current_longitude?: number | null;
  rating?: number | null;
  total_deliveries?: number;
  completed_deliveries?: number;
  cancelled_deliveries?: number;
  vehicle_type?: string | null;
  vehicle_make?: string | null;
  vehicle_model?: string | null;
  vehicle_color?: string | null;
  vehicle_plate?: string | null;
  license_number?: string | null;
  insurance_expiry?: string | null;
  background_check_status?: string;
  background_check_date?: string | null;
  profile_photo_url?: string | null;
  bank_account_details?: Json | null;
  earnings_total?: number;
  earnings_pending?: number;
  last_active_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DeliveryDriverUpdate {
  id?: string;
  user_id?: string | null;
  vendor_id?: string | null;
  is_independent_contractor?: boolean;
  is_available?: boolean;
  current_latitude?: number | null;
  current_longitude?: number | null;
  rating?: number | null;
  total_deliveries?: number;
  completed_deliveries?: number;
  cancelled_deliveries?: number;
  vehicle_type?: string | null;
  vehicle_make?: string | null;
  vehicle_model?: string | null;
  vehicle_color?: string | null;
  vehicle_plate?: string | null;
  license_number?: string | null;
  insurance_expiry?: string | null;
  background_check_status?: string;
  background_check_date?: string | null;
  profile_photo_url?: string | null;
  bank_account_details?: Json | null;
  earnings_total?: number;
  earnings_pending?: number;
  last_active_at?: string;
  created_at?: string;
  updated_at?: string;
}

// =====================================================
// DELIVERY ASSIGNMENTS
// =====================================================

export interface DeliveryAssignment {
  id: string;
  delivery_id: string;
  driver_id: string;
  assigned_by: string | null;
  assigned_at: string;
  accepted_at: string | null;
  declined_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  status: string; // 'pending' | 'accepted' | 'declined' | 'en_route_to_pickup' | 'at_pickup' | 'en_route_to_customer' | 'delivered' | 'cancelled'
  rejection_reason: string | null;
  cancellation_reason: string | null;
  route_geometry: Json | null;
  distance_km: number | null;
  duration_minutes: number | null;
  earnings_amount: number | null;
  tip_amount: number;
  total_earnings: number | null;
  customer_rating: number | null;
  customer_feedback: string | null;
  driver_rating: number | null;
  driver_feedback: string | null;
  metadata: Json | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryAssignmentInsert {
  id?: string;
  delivery_id: string;
  driver_id: string;
  assigned_by?: string | null;
  assigned_at?: string;
  accepted_at?: string | null;
  declined_at?: string | null;
  picked_up_at?: string | null;
  delivered_at?: string | null;
  status?: string;
  rejection_reason?: string | null;
  cancellation_reason?: string | null;
  route_geometry?: Json | null;
  distance_km?: number | null;
  duration_minutes?: number | null;
  earnings_amount?: number | null;
  tip_amount?: number;
  total_earnings?: number | null;
  customer_rating?: number | null;
  customer_feedback?: string | null;
  driver_rating?: number | null;
  driver_feedback?: string | null;
  metadata?: Json | null;
  created_at?: string;
  updated_at?: string;
}

export interface DeliveryAssignmentUpdate {
  id?: string;
  delivery_id?: string;
  driver_id?: string;
  assigned_by?: string | null;
  assigned_at?: string;
  accepted_at?: string | null;
  declined_at?: string | null;
  picked_up_at?: string | null;
  delivered_at?: string | null;
  status?: string;
  rejection_reason?: string | null;
  cancellation_reason?: string | null;
  route_geometry?: Json | null;
  distance_km?: number | null;
  duration_minutes?: number | null;
  earnings_amount?: number | null;
  tip_amount?: number;
  total_earnings?: number | null;
  customer_rating?: number | null;
  customer_feedback?: string | null;
  driver_rating?: number | null;
  driver_feedback?: string | null;
  metadata?: Json | null;
  created_at?: string;
  updated_at?: string;
}

// =====================================================
// DELIVERY ZONES
// =====================================================

export interface DeliveryZone {
  id: string;
  provider_id: string | null;
  vendor_id: string | null;
  name: string;
  description: string | null;
  polygon: Json | null; // GeoJSON Polygon
  center_latitude: number | null;
  center_longitude: number | null;
  radius_km: number | null;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface DeliveryZoneInsert {
  id?: string;
  provider_id?: string | null;
  vendor_id?: string | null;
  name: string;
  description?: string | null;
  polygon?: Json | null;
  center_latitude?: number | null;
  center_longitude?: number | null;
  radius_km?: number | null;
  is_active?: boolean;
  priority?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DeliveryZoneUpdate {
  id?: string;
  provider_id?: string | null;
  vendor_id?: string | null;
  name?: string;
  description?: string | null;
  polygon?: Json | null;
  center_latitude?: number | null;
  center_longitude?: number | null;
  radius_km?: number | null;
  is_active?: boolean;
  priority?: number;
  created_at?: string;
  updated_at?: string;
}

// =====================================================
// DELIVERY PRICING
// =====================================================

export interface DeliveryPricing {
  id: string;
  provider_id: string | null;
  vendor_id: string | null;
  zone_id: string | null;
  base_fee: number;
  per_km_fee: number;
  per_minute_fee: number;
  peak_hour_multiplier: number;
  weekend_multiplier: number;
  holiday_multiplier: number;
  min_distance_km: number;
  max_distance_km: number;
  min_weight_kg: number;
  max_weight_kg: number;
  extra_weight_fee: number;
  rush_delivery_multiplier: number;
  scheduled_discount: number;
  platform_markup_percent: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryPricingInsert {
  id?: string;
  provider_id?: string | null;
  vendor_id?: string | null;
  zone_id?: string | null;
  base_fee?: number;
  per_km_fee?: number;
  per_minute_fee?: number;
  peak_hour_multiplier?: number;
  weekend_multiplier?: number;
  holiday_multiplier?: number;
  min_distance_km?: number;
  max_distance_km?: number;
  min_weight_kg?: number;
  max_weight_kg?: number;
  extra_weight_fee?: number;
  rush_delivery_multiplier?: number;
  scheduled_discount?: number;
  platform_markup_percent?: number;
  valid_from?: string;
  valid_until?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DeliveryPricingUpdate {
  id?: string;
  provider_id?: string | null;
  vendor_id?: string | null;
  zone_id?: string | null;
  base_fee?: number;
  per_km_fee?: number;
  per_minute_fee?: number;
  peak_hour_multiplier?: number;
  weekend_multiplier?: number;
  holiday_multiplier?: number;
  min_distance_km?: number;
  max_distance_km?: number;
  min_weight_kg?: number;
  max_weight_kg?: number;
  extra_weight_fee?: number;
  rush_delivery_multiplier?: number;
  scheduled_discount?: number;
  platform_markup_percent?: number;
  valid_from?: string;
  valid_until?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// =====================================================
// HELPER TYPES FOR QUERIES
// =====================================================

export type DeliveryProviderSelect = Pick<DeliveryProvider, 'id' | 'name' | 'display_name' | 'is_active'>;
export type DeliveryDriverSelect = Pick<DeliveryDriver, 'id' | 'user_id' | 'vendor_id' | 'is_available' | 'rating' | 'vehicle_type'>;
export type DeliveryAssignmentSelect = Pick<DeliveryAssignment, 'id' | 'delivery_id' | 'driver_id' | 'status' | 'assigned_at'>;
export type DeliveryZoneSelect = Pick<DeliveryZone, 'id' | 'name' | 'is_active' | 'priority'>;
export type DeliveryPricingSelect = Pick<DeliveryPricing, 'id' | 'base_fee' | 'per_km_fee' | 'is_active'>;

// =====================================================
// RPC FUNCTION TYPES
// =====================================================

export interface CalculateDeliveryFeeParams {
  _vendor_id: string | null;
  _pickup_lat: number;
  _pickup_lng: number;
  _dropoff_lat: number;
  _dropoff_lng: number;
  _distance_km: number;
  _provider_id?: string;
  _is_rush?: boolean;
  _is_scheduled?: boolean;
  _order_weight_kg?: number;
}

export interface FindOptimalProviderParams {
  _vendor_id: string | null;
  _pickup_address: string;
  _delivery_address: string;
  _priority?: string;
}

export interface AssignDriverParams {
  _delivery_id: string;
  _driver_id: string;
  _assigned_by: string | null;
  _assignment_method?: string;
}

// =====================================================
// USAGE EXAMPLES
// =====================================================

/*
Example 1: Fetch active providers
```typescript
import { supabase } from "@/integrations/supabase/client";
import type { DeliveryProvider } from "@/types/delivery";

const { data, error } = await supabase
  .from('delivery_service_providers')
  .select('*')
  .eq('is_active', true);

if (error) throw error;
const providers = data as DeliveryProvider[];
```

Example 2: Calculate delivery fee
```typescript
import { supabase } from "@/integrations/supabase/client";
import type { CalculateDeliveryFeeParams } from "@/types/delivery";

const params: CalculateDeliveryFeeParams = {
  _vendor_id: partnerId,
  _pickup_lat: -33.9249,
  _pickup_lng: 18.4241,
  _dropoff_lat: -33.9500,
  _dropoff_lng: 18.4500,
  _distance_km: 5.0,
  _provider_id: 'shipday',
  _is_rush: false,
  _is_scheduled: false,
  _order_weight_kg: 2.0
};

const { data: fee, error } = await supabase.rpc('calculate_delivery_fee', params);
if (error) throw error;
console.log('Delivery fee:', fee as number);
```

Example 3: Assign driver to delivery
```typescript
import { supabase } from "@/integrations/supabase/client";
import type { AssignDriverParams } from "@/types/delivery";

const params: AssignDriverParams = {
  _delivery_id: deliveryId,
  _driver_id: driverId,
  _assigned_by: userId,
  _assignment_method: 'manual'
};

const { data, error } = await supabase.rpc('assign_driver_to_delivery', params);
if (error) throw error;
console.log('Assignment created:', data);
```

Example 4: Get active drivers
```typescript
import { supabase } from "@/integrations/supabase/client";
import type { DeliveryDriver } from "@/types/delivery";

const { data, error } = await supabase
  .from('delivery_drivers')
  .select('*')
  .eq('is_available', true)
  .eq('background_check_status', 'approved');

if (error) throw error;
const drivers = data as DeliveryDriver[];
```

Example 5: Create delivery pricing
```typescript
import { supabase } from "@/integrations/supabase/client";
import type { DeliveryPricingInsert } from "@/types/delivery";

const pricing: DeliveryPricingInsert = {
  provider_id: providerId,
  vendor_id: vendorId,
  base_fee: 50.00,
  per_km_fee: 15.00,
  per_minute_fee: 0.50,
  peak_hour_multiplier: 1.3,
  weekend_multiplier: 1.2,
  holiday_multiplier: 1.5,
  platform_markup_percent: 20.0,
  is_active: true
};

const { data, error } = await supabase
  .from('delivery_pricing')
  .insert(pricing)
  .select()
  .single();

if (error) throw error;
console.log('Pricing created:', data);
```
*/
