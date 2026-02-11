import { Product as ShopProduct } from '@/components/shop/ProductCard';

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_name: string;
  sku: string;
  price_adjustment: number;
  stock_quantity: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: number;
  product: ShopProduct;
  variant?: ProductVariant;
}

// Re-export Product for convenience
export type Product = ShopProduct;

export interface CartTotals {
  subtotal: number;
  shipping: number;
  vat: number;
  total: number;
  discount: number;
  loyaltyPointsUsed: number;
}

export interface ShippingAddress {
  id?: string;
  user_id?: string;
  address_type: 'shipping' | 'billing';
  full_name: string;
  street_address: string;
  suburb?: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentMethod {
  type: 'payfast' | 'loyalty_points' | 'cod';
  details?: {
    method: 'card' | 'eft' | 'snapscan';
    card_last_four?: string;
    card_brand?: string;
  };
}

export interface OrderFormData {
  shipping: ShippingAddress;
  payment: PaymentMethod;
  order: {
    subtotal: number;
    shipping_cost: number;
    vat: number;
    discount: number;
    loyalty_points_used: number;
    total_amount: number;
    currency: string;
  };
}