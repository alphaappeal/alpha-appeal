/**
 * Delivery Service Integration Utilities
 * Supports multiple providers: Shipday, BobGo, etc.
 */

import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// =====================================================
// TYPES & SCHEMAS
// =====================================================

export type DeliveryProvider = 'shipday' | 'bobgo' | 'uber_direct';

export interface DeliveryAddress {
  street: string;
  suburb: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  instructions?: string;
}

export interface DeliveryItem {
  name: string;
  quantity: number;
  price: number;
  sku?: string;
  weight_kg?: number;
}

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  vehicle_type?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  vehicle_plate?: string;
  rating?: number;
  current_latitude?: number;
  current_longitude?: number;
}

export interface DeliveryQuote {
  provider: DeliveryProvider;
  fee: number;
  currency: string;
  estimated_pickup_minutes: number;
  estimated_dropoff_minutes: number;
  distance_km: number;
  valid_until: string;
  quote_id: string;
}

export interface DeliveryOrder {
  order_id: string;
  pickup_address: DeliveryAddress;
  delivery_address: DeliveryAddress;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  items: DeliveryItem[];
  priority?: 'normal' | 'rush' | 'scheduled';
  scheduled_time?: string;
  special_instructions?: string;
  vendor_notes?: string;
}

export interface DeliveryStatus {
  status: 'pending' | 'assigned' | 'en_route_to_pickup' | 'at_pickup' | 'en_route_to_customer' | 'delivered' | 'failed' | 'cancelled';
  driver?: DriverInfo;
  eta_minutes?: number;
  tracking_url?: string;
  last_update: string;
  location?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
}

export interface ProofOfDelivery {
  photo_urls?: string[];
  signature_url?: string;
  delivered_at: string;
  notes?: string;
  recipient_name?: string;
}

// Zod schemas
export const DeliveryAddressSchema = z.object({
  street: z.string().min(1),
  suburb: z.string().min(1),
  city: z.string().min(1),
  province: z.string().min(1),
  postal_code: z.string().min(1),
  country: z.string().default('South Africa'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  instructions: z.string().optional(),
});

export const DeliveryItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  price: z.number().nonnegative(),
  sku: z.string().optional(),
  weight_kg: z.number().positive().optional(),
});

export const DeliveryOrderSchema = z.object({
  order_id: z.string().uuid(),
  pickup_address: DeliveryAddressSchema,
  delivery_address: DeliveryAddressSchema,
  customer_name: z.string().min(1),
  customer_phone: z.string().min(10),
  customer_email: z.string().email().optional(),
  items: z.array(DeliveryItemSchema),
  priority: z.enum(['normal', 'rush', 'scheduled']).optional(),
  scheduled_time: z.string().datetime().optional(),
  special_instructions: z.string().optional(),
  vendor_notes: z.string().optional(),
});

// =====================================================
// SHIPDAY API INTEGRATION
// =====================================================

export class ShipdayAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.shipday.com';
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${this.apiKey}`,
    };
  }

  /**
   * Create delivery order
   */
  async createOrder(order: DeliveryOrder): Promise<{ orderId: string; trackingUrl: string; fee: number }> {
    const payload = {
      orderNumber: order.order_id,
      customerName: order.customer_name,
      customerAddress: this.formatAddress(order.delivery_address),
      customerEmail: order.customer_email || '',
      customerPhoneNumber: order.customer_phone,
      restaurantName: 'Alpha Partner',
      restaurantAddress: this.formatAddress(order.pickup_address),
      orderItem: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      deliveryInstruction: order.special_instructions || order.vendor_notes || '',
      priority: order.priority === 'rush' ? 'RUSH ORDER' : undefined,
    };

    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Shipday API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    
    return {
      orderId: String(data.orderId || data.id),
      trackingUrl: data.trackingLink || '',
      fee: data.deliveryFee || data.distance?.fee || 0,
    };
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<DeliveryStatus> {
    const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get order status: ${response.statusText}`);
    }

    const data = await response.json();
    
    const statusMap: Record<string, DeliveryStatus['status']> = {
      'ASSIGNED': 'assigned',
      'STARTED': 'en_route_to_pickup',
      'PICKED_UP': 'en_route_to_customer',
      'COMPLETED': 'delivered',
      'FAILED': 'failed',
      'CANCELLED': 'cancelled',
    };

    return {
      status: statusMap[data.orderStatus] || 'pending',
      driver: data.assignedCarrier ? {
        id: String(data.assignedCarrier.id),
        name: data.assignedCarrier.name || data.assignedCarrier.personalName,
        phone: data.assignedCarrier.phone || data.assignedCarrier.phoneNumber,
        current_latitude: data.assignedCarrier.latitude,
        current_longitude: data.assignedCarrier.longitude,
      } : undefined,
      eta_minutes: data.etaSeconds ? Math.round(data.etaSeconds / 60) : undefined,
      tracking_url: data.trackingLink,
      last_update: new Date().toISOString(),
      location: data.assignedCarrier?.latitude && data.assignedCarrier?.longitude ? {
        latitude: data.assignedCarrier.latitude,
        longitude: data.assignedCarrier.longitude,
        timestamp: new Date().toISOString(),
      } : undefined,
    };
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel order: ${response.statusText}`);
    }
  }

  /**
   * Get quote
   */
  async getQuote(pickupAddress: string, deliveryAddress: string): Promise<DeliveryQuote> {
    const response = await fetch(`${this.baseUrl}/quote`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        pickupAddress,
        deliveryAddress,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get quote: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      provider: 'shipday',
      fee: data.fee || 0,
      currency: 'ZAR',
      estimated_pickup_minutes: data.estimatedPickupMinutes || 30,
      estimated_dropoff_minutes: data.estimatedDropoffMinutes || 45,
      distance_km: data.distanceKm || 0,
      valid_until: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min validity
      quote_id: data.quoteId || crypto.randomUUID(),
    };
  }

  private formatAddress(address: DeliveryAddress): string {
    return `${address.street}, ${address.suburb}, ${address.city}, ${address.province} ${address.postal_code}`;
  }
}

// =====================================================
// BOBGO API INTEGRATION (Placeholder - Replace with actual API)
// =====================================================

export class BobGoAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = Deno.env.get('BOBGO_API_URL') || 'https://api.bobgo.co.za';
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }

  /**
   * Create delivery order
   */
  async createOrder(order: DeliveryOrder): Promise<{ orderId: string; trackingUrl: string; fee: number }> {
    // TODO: Implement actual BobGo API integration
    console.log('BobGo API not yet implemented, using mock response');
    
    return {
      orderId: `bobgo_${order.order_id}`,
      trackingUrl: `https://track.bobgo.co.za/${order.order_id}`,
      fee: 65.00, // Mock fee
    };
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<DeliveryStatus> {
    // TODO: Implement actual BobGo API integration
    return {
      status: 'pending',
      last_update: new Date().toISOString(),
    };
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<void> {
    // TODO: Implement actual BobGo API integration
    throw new Error('BobGo cancel not implemented');
  }

  /**
   * Get quote
   */
  async getQuote(pickupAddress: string, deliveryAddress: string): Promise<DeliveryQuote> {
    // TODO: Implement actual BobGo API integration
    return {
      provider: 'bobgo',
      fee: 65.00,
      currency: 'ZAR',
      estimated_pickup_minutes: 35,
      estimated_dropoff_minutes: 50,
      distance_km: 12.5,
      valid_until: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      quote_id: crypto.randomUUID(),
    };
  }
}

// =====================================================
// DELIVERY SERVICE FACTORY
// =====================================================

export function createDeliveryProvider(provider: DeliveryProvider, apiKey: string): ShipdayAPI | BobGoAPI {
  switch (provider) {
    case 'shipday':
      return new ShipdayAPI(apiKey);
    case 'bobgo':
      return new BobGoAPI(apiKey);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Estimate delivery time based on distance and traffic
 */
export function estimateDeliveryTime(
  distanceKm: number,
  trafficCondition: 'light' | 'moderate' | 'heavy' = 'moderate'
): { pickupMinutes: number; dropoffMinutes: number } {
  const speedMap = {
    light: 40,
    moderate: 30,
    heavy: 20,
  };
  
  const avgSpeed = speedMap[trafficCondition];
  const driveTimeMinutes = (distanceKm / avgSpeed) * 60;
  
  return {
    pickupMinutes: 15, // Fixed prep time
    dropoffMinutes: Math.round(driveTimeMinutes + 10), // Drive time + buffer
  };
}

/**
 * Format phone number for South Africa
 */
export function formatSAPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('27')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+27${cleaned.substring(1)}`;
  } else {
    return `+27${cleaned}`;
  }
}
