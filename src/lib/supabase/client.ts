import { supabase } from '@/lib/supabase';

// Export the client for backward compatibility if needed, 
// though consumers should import from @/lib/supabase directly now.
export { supabase };

// Type definitions for database tables
export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  date_of_birth: string | null;
  created_at: string;
  last_login: string | null;
  is_active: boolean;
  user_type: 'customer' | 'artist' | 'admin' | 'vendor';
  bio: string | null;
  instagram_handle: string | null;
  favorite_genres: string[] | null;
  loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  total_spent: number;
  referral_code: string | null;
  referred_by: string | null;
}

export interface UserAddress {
  id: string;
  user_id: string;
  address_type: 'shipping' | 'billing';
  full_name: string;
  street_address: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
}

export interface ProductCategory {
  id: string;
  category_name: string;
  slug: string;
  parent_category_id: string | null;
  icon_url: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  partner_id: string | null;
  product_name: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  sku: string | null;
  barcode: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  is_digital: boolean;
  digital_file_url: string | null;
  weight_grams: number | null;
  requires_shipping: boolean;
  is_active: boolean;
  sustainability_score: number | null;
  hemp_based: boolean;
  carbon_footprint_kg: number | null;
  product_type: 'flower' | 'edibles' | 'concentrates' | 'accessories' | 'wellness' | 'music' | 'nft' | 'subscription';
  metadata: any | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_name: string;
  sku: string | null;
  price_adjustment: number;
  stock_quantity: number;
  image_url: string | null;
  attributes: any | null;
  created_at: string;
}

export interface ShoppingCartItem {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount_amount: number;
  loyalty_points_used: number;
  total_amount: number;
  currency: string;
  shipping_address_id: string | null;
  billing_address_id: string | null;
  customer_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_digital: boolean;
  digital_delivery_status: 'pending' | 'sent' | 'accessed' | null;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  payment_method: 'payfast' | 'crypto' | 'loyalty_points' | 'manual';
  provider: string | null;
  transaction_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  payment_metadata: any | null;
  created_at: string;
  processed_at: string | null;
}

export interface SubscriptionTier {
  id: string;
  tier_name: string;
  monthly_price: number;
  discount_percentage: number;
  features: any | null;
  box_description: string | null;
  created_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  tier_id: string | null;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  start_date: string;
  next_billing_date: string | null;
  cancelled_at: string | null;
  pause_until: string | null;
  payment_method_id: string | null;
  created_at: string;
}

export interface MonthlyBox {
  id: string;
  subscription_id: string;
  box_month: string;
  status: 'preparing' | 'shipped' | 'delivered';
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

export interface LoyaltyPoints {
  id: string;
  user_id: string;
  total_points: number;
  points_earned_lifetime: number;
  points_redeemed_lifetime: number;
  current_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  transaction_type: 'earn' | 'redeem' | 'expire' | 'adjustment';
  points: number;
  reason: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string | null;
  order_id: string | null;
  rating: number;
  review_title: string | null;
  review_text: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface Artist {
  id: string;
  user_id: string;
  artist_name: string;
  slug: string;
  bio: string | null;
  profile_image_url: string | null;
  banner_image_url: string | null;
  social_links: any | null;
  sustainability_story: string | null;
  contract_start_date: string | null;
  royalty_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Album {
  id: string;
  artist_id: string;
  product_id: string | null;
  album_title: string;
  slug: string;
  release_date: string | null;
  album_type: 'album' | 'ep' | 'single' | 'compilation';
  cover_art_url: string | null;
  description: string | null;
  total_tracks: number | null;
  genres: string[] | null;
  is_released: boolean;
  explicit_content: boolean;
  created_at: string;
  updated_at: string;
}

export interface Track {
  id: string;
  album_id: string;
  product_id: string | null;
  track_title: string;
  track_number: number | null;
  duration_seconds: number | null;
  audio_file_url: string | null;
  lyrics: string | null;
  is_explicit: boolean;
  preview_url: string | null;
  created_at: string;
}

export interface NFTCollection {
  id: string;
  collection_name: string;
  slug: string;
  description: string | null;
  creator_id: string | null;
  artist_id: string | null;
  contract_address: string | null;
  blockchain: 'ethereum' | 'polygon' | 'solana' | 'binance';
  royalty_percentage: number;
  banner_image_url: string | null;
  collection_size: number | null;
  total_supply: number;
  created_at: string;
  updated_at: string;
}

export interface NFT {
  id: string;
  collection_id: string;
  product_id: string | null;
  token_id: string | null;
  nft_name: string;
  description: string | null;
  image_url: string | null;
  metadata_url: string | null;
  animation_url: string | null;
  total_supply: number;
  minted_count: number;
  utility_description: string | null;
  attributes: any | null;
  created_at: string;
  updated_at: string;
}

// Helper functions for common operations
export const supabaseClient = {
  // User operations
  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  updateUserProfile: async (userId: string, updates: Partial<UserProfile>) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Product operations
  getProducts: async (filters?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
  }) => {
    let query = supabase
      .from('product_catalog')
      .select('*')
      .eq('is_active', true);

    if (filters?.category) {
      query = query.eq('category_slug', filters.category);
    }

    if (filters?.search) {
      query = query.or(
        `product_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters?.inStock) {
      query = query.gt('stock_quantity', 0);
    }

    const { data, error } = await query.order('product_name', { ascending: true });

    if (error) throw error;
    return data;
  },

  getProductById: async (productId: string) => {
    const { data, error } = await supabase
      .from('product_catalog')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) throw error;
    return data;
  },

  getProductImages: async (productId: string) => {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Shopping cart operations
  getCartItems: async (userId: string) => {
    const { data, error } = await supabase
      .from('shopping_cart')
      .select(`
        *,
        products (
          id,
          product_name,
          price,
          slug,
          is_active,
          stock_quantity
        ),
        product_variants (
          id,
          variant_name,
          price_adjustment
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  addToCart: async (userId: string, productId: string, variantId?: string, quantity: number = 1) => {
    const { data, error } = await supabase
      .from('shopping_cart')
      .upsert({
        user_id: userId,
        product_id: productId,
        variant_id: variantId,
        quantity: quantity
      }, {
        onConflict: 'user_id,product_id,variant_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  removeFromCart: async (cartItemId: string) => {
    const { data, error } = await supabase
      .from('shopping_cart')
      .delete()
      .eq('id', cartItemId)
      .single();

    if (error) throw error;
    return data;
  },

  // Order operations
  createOrder: async (orderData: {
    user_id: string;
    order_number: string;
    subtotal: number;
    shipping_cost: number;
    tax: number;
    total_amount: number;
    currency: string;
    shipping_address_id: string;
    billing_address_id: string;
  }) => {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Review operations
  getReviewsForProduct: async (productId: string) => {
    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        user_profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  createReview: async (reviewData: {
    product_id: string;
    user_id: string;
    order_id: string;
    rating: number;
    review_title: string;
    review_text: string;
    is_verified_purchase: boolean;
  }) => {
    const { data, error } = await supabase
      .from('product_reviews')
      .insert(reviewData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Subscription operations
  getUserSubscriptions: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_tiers (
          tier_name,
          monthly_price,
          discount_percentage,
          features
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Music operations
  getArtists: async (filters?: { active?: boolean }) => {
    let query = supabase
      .from('artists')
      .select('*');

    if (filters?.active) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.order('artist_name', { ascending: true });

    if (error) throw error;
    return data;
  },

  getAlbumsByArtist: async (artistId: string) => {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .eq('artist_id', artistId)
      .order('release_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  getTracksByAlbum: async (albumId: string) => {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('album_id', albumId)
      .order('track_number', { ascending: true });

    if (error) throw error;
    return data;
  },

  // NFT operations
  getNFTCollections: async () => {
    const { data, error } = await supabase
      .from('nft_collections')
      .select('*')
      .order('collection_name', { ascending: true });

    if (error) throw error;
    return data;
  },

  getNFTsByCollection: async (collectionId: string) => {
    const { data, error } = await supabase
      .from('nfts')
      .select('*')
      .eq('collection_id', collectionId)
      .order('nft_name', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Utility functions
  searchProducts: async (query: string) => {
    const { data, error } = await supabase
      .from('product_catalog')
      .select('*')
      .or(
        `product_name.ilike.%${query}%,description.ilike.%${query}%,category_name.ilike.%${query}%`
      )
      .limit(20);

    if (error) throw error;
    return data;
  },

  // Real-time subscriptions
  subscribeToCart: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`cart-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shopping_cart',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  subscribeToOrders: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`orders-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }
};

export default supabaseClient;