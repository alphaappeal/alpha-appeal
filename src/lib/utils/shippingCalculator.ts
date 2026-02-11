/**
 * Shipping Calculator Utility
 * Calculates shipping costs based on South African provinces
 */

export interface ShippingCosts {
  [key: string]: number;
}

export const SHIPPING_COSTS: ShippingCosts = {
  "Gauteng": 99,
  "Western Cape": 129,
  "KwaZulu-Natal": 119,
  "Eastern Cape": 139,
  "Free State": 129,
  "Mpumalanga": 119,
  "Limpopo": 149,
  "North West": 129,
  "Northern Cape": 159
};

export const DEFAULT_SHIPPING_COST = 149;

/**
 * Calculate shipping cost based on province
 * @param province - South African province name
 * @returns Shipping cost in ZAR
 */
export function calculateShippingCost(province: string): number {
  const normalizedProvince = province.toLowerCase().trim();
  
  // Find matching province (case-insensitive)
  for (const [key, value] of Object.entries(SHIPPING_COSTS)) {
    if (key.toLowerCase() === normalizedProvince) {
      return value;
    }
  }
  
  // Return default cost if province not found
  return DEFAULT_SHIPPING_COST;
}

/**
 * Get all available provinces for shipping
 * @returns Array of province names
 */
export function getAvailableProvinces(): string[] {
  return Object.keys(SHIPPING_COSTS);
}

/**
 * Get shipping cost breakdown
 * @param province - South African province
 * @param cartSubtotal - Subtotal of items (before shipping)
 * @returns Detailed shipping breakdown
 */
export function getShippingBreakdown(province: string, cartSubtotal: number) {
  const shippingCost = calculateShippingCost(province);
  const vat = (cartSubtotal + shippingCost) * 0.15;
  const total = cartSubtotal + shippingCost + vat;
  
  return {
    subtotal: cartSubtotal,
    shipping: shippingCost,
    vat: vat,
    total: total,
    breakdown: {
      subtotal: cartSubtotal,
      shipping: shippingCost,
      vat: vat
    }
  };
}

/**
 * Check if free shipping is available
 * @param cartSubtotal - Subtotal of items
 * @param threshold - Minimum amount for free shipping
 * @returns Boolean indicating if shipping is free
 */
export function isFreeShipping(cartSubtotal: number, threshold: number = 1000): boolean {
  return cartSubtotal >= threshold;
}

/**
 * Get estimated delivery time based on province
 * @param province - South African province
 * @returns Estimated delivery days
 */
export function getEstimatedDeliveryDays(province: string): number {
  const normalizedProvince = province.toLowerCase().trim();
  
  // Major provinces with faster delivery
  const fastDeliveryProvinces = [
    "gauteng", "western cape", "kwaZulu-natal"
  ];
  
  if (fastDeliveryProvinces.includes(normalizedProvince)) {
    return 2; // 2-3 business days
  }
  
  return 4; // 4-5 business days for other provinces
}