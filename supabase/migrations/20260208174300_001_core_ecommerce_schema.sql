-- ============================================
-- ALPHA APPEAL - CORE E-COMMERCE SCHEMA
-- Migration 001: Complete E-commerce Foundation
-- Extends existing partner tables
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER MANAGEMENT (extends existing auth.users)
-- ============================================

-- User Profiles (enhanced from existing)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  user_type TEXT CHECK (user_type IN ('customer', 'artist', 'admin', 'vendor')) DEFAULT 'customer',
  bio TEXT,
  instagram_handle TEXT,
  favorite_genres TEXT[],
  loyalty_tier TEXT CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')) DEFAULT 'bronze',
  total_spent DECIMAL(12,2) DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES auth.users
);

-- User Addresses
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  address_type TEXT CHECK (address_type IN ('shipping', 'billing')) DEFAULT 'shipping',
  full_name TEXT,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT NOT NULL CHECK (length(postal_code) = 4),
  country TEXT DEFAULT 'South Africa',
  phone TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCT CATALOG
-- ============================================

-- Product Categories
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_category_id UUID REFERENCES product_categories ON DELETE SET NULL,
  icon_url TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES product_categories ON DELETE SET NULL,
  partner_id UUID REFERENCES alpha_partners(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price DECIMAL(10,2) CHECK (compare_at_price >= 0),
  cost_price DECIMAL(10,2) CHECK (cost_price >= 0),
  sku TEXT UNIQUE,
  barcode TEXT,
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INTEGER DEFAULT 10,
  is_digital BOOLEAN DEFAULT false,
  digital_file_url TEXT,
  weight_grams INTEGER CHECK (weight_grams >= 0),
  requires_shipping BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  sustainability_score INTEGER CHECK (sustainability_score BETWEEN 1 AND 5),
  hemp_based BOOLEAN DEFAULT false,
  carbon_footprint_kg DECIMAL(6,2) CHECK (carbon_footprint_kg >= 0),
  product_type TEXT CHECK (product_type IN ('flower', 'edibles', 'concentrates', 'accessories', 'wellness', 'music', 'nft', 'subscription')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products ON DELETE CASCADE NOT NULL,
  variant_name TEXT NOT NULL,
  sku TEXT UNIQUE,
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  image_url TEXT,
  attributes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SHOPPING CART & WISHLIST
-- ============================================

-- Shopping Cart
CREATE TABLE IF NOT EXISTS shopping_cart (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES product_variants ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, variant_id)
);

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================
-- ORDERS & PAYMENTS
-- ============================================

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')) DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  shipping_cost DECIMAL(10,2) DEFAULT 0 CHECK (shipping_cost >= 0),
  tax DECIMAL(10,2) DEFAULT 0 CHECK (tax >= 0),
  discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  loyalty_points_used INTEGER DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  currency TEXT DEFAULT 'ZAR',
  shipping_address_id UUID REFERENCES user_addresses ON DELETE SET NULL,
  billing_address_id UUID REFERENCES user_addresses ON DELETE SET NULL,
  customer_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  is_digital BOOLEAN DEFAULT false,
  digital_delivery_status TEXT CHECK (digital_delivery_status IN ('pending', 'sent', 'accessed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments (integrates with existing PayFast)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders ON DELETE CASCADE NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('payfast', 'crypto', 'loyalty_points', 'manual')) NOT NULL,
  provider TEXT,
  transaction_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'ZAR',
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')) DEFAULT 'pending',
  payment_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Refunds
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders ON DELETE CASCADE NOT NULL,
  payment_id UUID REFERENCES payments ON DELETE CASCADE,
  refund_amount DECIMAL(10,2) NOT NULL CHECK (refund_amount > 0),
  reason TEXT,
  status TEXT CHECK (status IN ('requested', 'approved', 'processing', 'completed', 'rejected')) DEFAULT 'requested',
  admin_notes TEXT,
  requested_by UUID REFERENCES auth.users ON DELETE SET NULL,
  processed_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- ============================================
-- SUBSCRIPTION SYSTEM
-- ============================================

-- Subscription Tiers
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier_name TEXT UNIQUE NOT NULL,
  monthly_price DECIMAL(10,2) NOT NULL CHECK (monthly_price >= 0),
  discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage BETWEEN 0 AND 100),
  features JSONB,
  box_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  tier_id UUID REFERENCES subscription_tiers ON DELETE SET NULL,
  status TEXT CHECK (status IN ('active', 'paused', 'cancelled', 'expired')) DEFAULT 'active',
  start_date TIMESTAMPTZ DEFAULT NOW(),
  next_billing_date TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  pause_until TIMESTAMPTZ,
  payment_method_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly Subscription Boxes
CREATE TABLE IF NOT EXISTS monthly_boxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES user_subscriptions ON DELETE CASCADE NOT NULL,
  box_month DATE NOT NULL,
  status TEXT CHECK (status IN ('preparing', 'shipped', 'delivered')) DEFAULT 'preparing',
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Box Items
CREATE TABLE IF NOT EXISTS box_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  box_id UUID REFERENCES monthly_boxes ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  notes TEXT
);

-- ============================================
-- LOYALTY & REWARDS
-- ============================================

-- Loyalty Points Balance
CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE NOT NULL,
  total_points INTEGER DEFAULT 0 CHECK (total_points >= 0),
  points_earned_lifetime INTEGER DEFAULT 0 CHECK (points_earned_lifetime >= 0),
  points_redeemed_lifetime INTEGER DEFAULT 0 CHECK (points_redeemed_lifetime >= 0),
  current_tier TEXT CHECK (current_tier IN ('bronze', 'silver', 'gold', 'platinum')) DEFAULT 'bronze',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loyalty Transactions
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('earn', 'redeem', 'expire', 'adjustment')) NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  achievement_name TEXT UNIQUE NOT NULL,
  description TEXT,
  badge_icon_url TEXT,
  points_reward INTEGER DEFAULT 0 CHECK (points_reward >= 0),
  criteria JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users ON DELETE SET NULL,
  referred_id UUID REFERENCES auth.users ON DELETE SET NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'rewarded')) DEFAULT 'pending',
  referral_code TEXT UNIQUE NOT NULL,
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================
-- REVIEWS & RATINGS
-- ============================================

-- Product Reviews
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  order_id UUID REFERENCES orders ON DELETE SET NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review_title TEXT,
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review Images
CREATE TABLE IF NOT EXISTS review_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES product_reviews ON DELETE CASCADE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DELIVERY & SHIPPING
-- ============================================

-- Deliveries
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders ON DELETE CASCADE,
  courier_service TEXT,
  tracking_number TEXT UNIQUE,
  tracking_url TEXT,
  shipping_method TEXT,
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  delivery_status TEXT CHECK (delivery_status IN ('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed')) DEFAULT 'pending',
  delivery_address JSONB,
  delivery_notes TEXT,
  signature_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Digital Deliveries
CREATE TABLE IF NOT EXISTS digital_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id UUID REFERENCES order_items ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  download_url TEXT,
  access_expires_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER,
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- User tables
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_default ON user_addresses(user_id, is_default);

-- Product tables
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_partner ON products(partner_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);

-- Order tables
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Subscription tables
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_monthly_boxes_subscription ON monthly_boxes(subscription_id);
CREATE INDEX IF NOT EXISTS idx_monthly_boxes_month ON monthly_boxes(box_month);

-- Loyalty tables
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user ON loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user ON loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON loyalty_transactions(transaction_type);

-- Review tables
CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_approved ON product_reviews(is_approved) WHERE is_approved = true;

-- Delivery tables
CREATE INDEX IF NOT EXISTS idx_deliveries_order ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(delivery_status);
CREATE INDEX IF NOT EXISTS idx_digital_deliveries_user ON digital_deliveries(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all user-facing tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_deliveries ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
-- Users can view own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can manage own addresses
CREATE POLICY "Users can manage own addresses"
  ON user_addresses FOR ALL
  USING (auth.uid() = user_id);

-- Users can manage own cart
CREATE POLICY "Users can manage own cart"
  ON shopping_cart FOR ALL
  USING (auth.uid() = user_id);

-- Users can manage own wishlist
CREATE POLICY "Users can manage own wishlist"
  ON wishlist FOR ALL
  USING (auth.uid() = user_id);

-- Users can view own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view own order items
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Users can manage own subscriptions
CREATE POLICY "Users can manage own subscriptions"
  ON user_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- Users can view own loyalty points
CREATE POLICY "Users can view own loyalty points"
  ON loyalty_points FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view own loyalty transactions
CREATE POLICY "Users can view own loyalty transactions"
  ON loyalty_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can manage own achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR ALL
  USING (user_id = auth.uid());

-- Users can manage own referrals
CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

-- Users can manage own reviews
CREATE POLICY "Users can manage own reviews"
  ON product_reviews FOR ALL
  USING (auth.uid() = user_id);

-- Users can view approved reviews
CREATE POLICY "Anyone can view approved reviews"
  ON product_reviews FOR SELECT
  USING (is_approved = true);

-- Users can manage own review images
CREATE POLICY "Users can manage own review images"
  ON review_images FOR ALL
  USING (review_id IN (SELECT id FROM product_reviews WHERE user_id = auth.uid()));

-- Users can view own deliveries
CREATE POLICY "Users can view own deliveries"
  ON deliveries FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Users can view own digital deliveries
CREATE POLICY "Users can view own digital deliveries"
  ON digital_deliveries FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_cart_updated_at
  BEFORE UPDATE ON shopping_cart
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample categories
INSERT INTO product_categories (category_name, slug, description, display_order) VALUES
('Flower', 'flower', 'Premium cannabis flower strains', 1),
('Edibles', 'edibles', 'Cannabis-infused food and beverages', 2),
('Concentrates', 'concentrates', 'High-potency cannabis extracts', 3),
('Accessories', 'accessories', 'Smoking accessories and tools', 4),
('Wellness', 'wellness', 'CBD products and wellness items', 5),
('Music', 'music', 'Digital music and artist content', 6),
('NFTs', 'nfts', 'Digital collectibles and NFTs', 7),
('Subscriptions', 'subscriptions', 'Monthly subscription boxes', 8)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample subscription tiers
INSERT INTO subscription_tiers (tier_name, monthly_price, discount_percentage, features, box_description) VALUES
('Basic', 299.00, 0, '{"box_size": "Standard", "products": ["Flower", "Accessories"], "shipping": "Standard"}', 'Monthly box with curated products'),
('Premium', 599.00, 10, '{"box_size": "Premium", "products": ["Flower", "Edibles", "Accessories"], "shipping": "Free", "exclusive": "Early access"}', 'Premium monthly box with exclusive items'),
('Elite', 999.00, 20, '{"box_size": "Elite", "products": ["All categories"], "shipping": "Free", "exclusive": "VIP access", "personalized": "Custom selection"}', 'Elite experience with personalized selections')
ON CONFLICT (tier_name) DO NOTHING;

-- Insert sample achievements
INSERT INTO achievements (achievement_name, description, badge_icon_url, points_reward, criteria) VALUES
('First Purchase', 'Make your first purchase', '/badges/first-purchase.png', 100, '{"event": "first_purchase"}'),
('Review Writer', 'Write your first product review', '/badges/review-writer.png', 50, '{"event": "first_review"}'),
('Referral Master', 'Refer 5 friends', '/badges/referral-master.png', 500, '{"event": "referrals", "count": 5}'),
('Loyalty Member', 'Earn 1000 loyalty points', '/badges/loyalty-member.png', 200, '{"event": "loyalty_milestone", "points": 1000}'),
('Box Collector', 'Receive 12 monthly boxes', '/badges/box-collector.png', 300, '{"event": "subscription_milestone", "months": 12}')
ON CONFLICT (achievement_name) DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Log migration completion
INSERT INTO migrations_log (version, description, executed_at) VALUES
('20260208174300_001_core_ecommerce_schema', 'Core e-commerce schema with user management, products, orders, subscriptions, and loyalty system', NOW())
ON CONFLICT (version) DO NOTHING;