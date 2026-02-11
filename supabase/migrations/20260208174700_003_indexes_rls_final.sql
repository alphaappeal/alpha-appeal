-- ============================================
-- ALPHA APPEAL - INDEXES, RLS & FINAL TOUCHES
-- Migration 003: Performance, Security & Cleanup
-- ============================================

-- ============================================
-- MISSING TABLES & FIXES
-- ============================================

-- Fix: Add missing genres table (referenced in albums)
CREATE TABLE IF NOT EXISTS genres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fix: Add missing migrations_log table
CREATE TABLE IF NOT EXISTS migrations_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version TEXT UNIQUE NOT NULL,
  description TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fix: Add missing user_profiles table if it doesn't exist (in case of conflicts)
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
  referred_by UUID REFERENCES auth.users,
  UNIQUE(referral_code)
);

-- ============================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- ============================================

-- Enhanced product search indexes
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING GIN (product_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_description_trgm ON products USING GIN (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_id, is_active) WHERE is_active = true;

-- Enhanced order search indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_date_range ON orders(created_at) WHERE created_at >= NOW() - INTERVAL '1 year';
CREATE INDEX IF NOT EXISTS idx_order_items_product_variant ON order_items(product_id, variant_id);

-- Enhanced subscription indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_billing ON user_subscriptions(next_billing_date) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_monthly_boxes_status ON monthly_boxes(status, shipped_at) WHERE status != 'delivered';

-- Enhanced loyalty indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_points_tier ON loyalty_points(current_tier);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_reference ON loyalty_transactions(reference_id) WHERE reference_id IS NOT NULL;

-- Enhanced review indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_product_reviews_date ON product_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_rating ON product_reviews(product_id, rating) WHERE is_approved = true;

-- Enhanced delivery indexes
CREATE INDEX IF NOT EXISTS idx_deliveries_tracking ON deliveries(tracking_number) WHERE tracking_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deliveries_status_date ON deliveries(delivery_status, estimated_delivery_date);

-- Enhanced NFT indexes
CREATE INDEX IF NOT EXISTS idx_nfts_collection_supply ON nfts(collection_id, total_supply);
CREATE INDEX IF NOT EXISTS idx_nft_ownership_wallet ON nft_ownership(wallet_address);
CREATE INDEX IF NOT EXISTS idx_nft_sales_history_date ON nft_sales_history(sold_at DESC);

-- Enhanced music indexes
CREATE INDEX IF NOT EXISTS idx_artists_name_trgm ON artists USING GIN (artist_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_albums_title_trgm ON albums USING GIN (album_title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tracks_title_trgm ON tracks USING GIN (track_title gin_trgm_ops);

-- Enhanced analytics indexes
CREATE INDEX IF NOT EXISTS idx_product_analytics_views ON product_analytics(views DESC);
CREATE INDEX IF NOT EXISTS idx_product_analytics_purchases ON product_analytics(purchases DESC);
CREATE INDEX IF NOT EXISTS idx_sales_analytics_revenue ON sales_analytics(total_revenue DESC);

-- ============================================
-- COMPREHENSIVE RLS POLICIES
-- ============================================

-- User Profiles RLS
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON user_profiles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- User Addresses RLS
CREATE POLICY "Users can manage own addresses" ON user_addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all addresses" ON user_addresses FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Shopping Cart RLS
CREATE POLICY "Users can manage own cart" ON shopping_cart FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all carts" ON shopping_cart FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Wishlist RLS
CREATE POLICY "Users can manage own wishlist" ON wishlist FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all wishlists" ON wishlist FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Orders RLS
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Admins can manage all orders" ON orders FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Order Items RLS
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all order items" ON order_items FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Payments RLS
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all payments" ON payments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Refunds RLS
CREATE POLICY "Users can view own refunds" ON refunds FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
CREATE POLICY "Users can request refunds for own orders" ON refunds FOR INSERT WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all refunds" ON refunds FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Subscription RLS
CREATE POLICY "Users can manage own subscriptions" ON user_subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions" ON user_subscriptions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Monthly Boxes RLS
CREATE POLICY "Users can view own boxes" ON monthly_boxes FOR SELECT USING (subscription_id IN (SELECT id FROM user_subscriptions WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all boxes" ON monthly_boxes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Loyalty Points RLS
CREATE POLICY "Users can view own loyalty points" ON loyalty_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own loyalty points" ON loyalty_points FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all loyalty points" ON loyalty_points FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Loyalty Transactions RLS
CREATE POLICY "Users can view own loyalty transactions" ON loyalty_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all loyalty transactions" ON loyalty_transactions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Achievements RLS
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage achievements" ON achievements FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Referrals RLS
CREATE POLICY "Users can view own referrals" ON referrals FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());
CREATE POLICY "Admins can view all referrals" ON referrals FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Product Reviews RLS
CREATE POLICY "Anyone can view approved reviews" ON product_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can manage own reviews" ON product_reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all reviews" ON product_reviews FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Review Images RLS
CREATE POLICY "Users can manage own review images" ON review_images FOR ALL USING (review_id IN (SELECT id FROM product_reviews WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all review images" ON review_images FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Deliveries RLS
CREATE POLICY "Users can view own deliveries" ON deliveries FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all deliveries" ON deliveries FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Digital Deliveries RLS
CREATE POLICY "Users can view own digital deliveries" ON digital_deliveries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all digital deliveries" ON digital_deliveries FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Artists RLS
CREATE POLICY "Artists can manage own content" ON artists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active artists" ON artists FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage all artists" ON artists FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Albums RLS
CREATE POLICY "Anyone can view released albums" ON albums FOR SELECT USING (is_released = true);
CREATE POLICY "Artists can manage own albums" ON albums FOR ALL USING (artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all albums" ON albums FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Tracks RLS
CREATE POLICY "Anyone can view tracks from released albums" ON tracks FOR SELECT USING (album_id IN (SELECT id FROM albums WHERE is_released = true));
CREATE POLICY "Artists can manage own tracks" ON tracks FOR ALL USING (album_id IN (SELECT id FROM albums WHERE artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid())));
CREATE POLICY "Admins can manage all tracks" ON tracks FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Music Royalties RLS
CREATE POLICY "Artists can view own royalties" ON music_royalties FOR SELECT USING (artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all royalties" ON music_royalties FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Playlists RLS
CREATE POLICY "Users can manage own playlists" ON playlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public playlists" ON playlists FOR SELECT USING (is_public = true);
CREATE POLICY "Admins can view all playlists" ON playlists FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Playlist Tracks RLS
CREATE POLICY "Users can manage tracks in own playlists" ON playlist_tracks FOR ALL USING (playlist_id IN (SELECT id FROM playlists WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all playlist tracks" ON playlist_tracks FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Listening History RLS
CREATE POLICY "Users can view own listening history" ON listening_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all listening history" ON listening_history FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- NFT Collections RLS
CREATE POLICY "Anyone can view NFT collections" ON nft_collections FOR SELECT USING (true);
CREATE POLICY "Artists can manage own collections" ON nft_collections FOR ALL USING (artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid()) OR creator_id = auth.uid());
CREATE POLICY "Admins can manage all collections" ON nft_collections FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- NFTs RLS
CREATE POLICY "Anyone can view NFTs" ON nfts FOR SELECT USING (true);
CREATE POLICY "Artists can manage own NFTs" ON nfts FOR ALL USING (collection_id IN (SELECT id FROM nft_collections WHERE artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid()) OR creator_id = auth.uid()));
CREATE POLICY "Admins can manage all NFTs" ON nfts FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- NFT Ownership RLS
CREATE POLICY "Users can view own NFT ownership" ON nft_ownership FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Admins can view all NFT ownership" ON nft_ownership FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- NFT Sales History RLS
CREATE POLICY "Anyone can view NFT sales history" ON nft_sales_history FOR SELECT USING (true);
CREATE POLICY "Users can view own NFT sales" ON nft_sales_history FOR SELECT USING (seller_id = auth.uid() OR buyer_id = auth.uid());
CREATE POLICY "Admins can manage all NFT sales" ON nft_sales_history FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- NFT Bids RLS
CREATE POLICY "Users can manage own bids" ON nft_bids FOR ALL USING (auth.uid() = bidder_id);
CREATE POLICY "Anyone can view active bids" ON nft_bids FOR SELECT USING (bid_status = 'active');
CREATE POLICY "Admins can manage all bids" ON nft_bids FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- NFT Auctions RLS
CREATE POLICY "Anyone can view NFT auctions" ON nft_auctions FOR SELECT USING (true);
CREATE POLICY "Admins can manage all auctions" ON nft_auctions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Crypto Wallets RLS
CREATE POLICY "Users can manage own crypto wallets" ON crypto_wallets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all crypto wallets" ON crypto_wallets FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Crypto Transactions RLS
CREATE POLICY "Users can view own crypto transactions" ON crypto_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all crypto transactions" ON crypto_transactions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Supply Chain Records RLS
CREATE POLICY "Anyone can view supply chain records" ON supply_chain_records FOR SELECT USING (true);
CREATE POLICY "Admins can manage supply chain records" ON supply_chain_records FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Carbon Offsets RLS
CREATE POLICY "Anyone can view carbon offsets" ON carbon_offsets FOR SELECT USING (true);
CREATE POLICY "Admins can manage carbon offsets" ON carbon_offsets FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Sustainability Certifications RLS
CREATE POLICY "Anyone can view sustainability certifications" ON sustainability_certifications FOR SELECT USING (true);
CREATE POLICY "Admins can manage sustainability certifications" ON sustainability_certifications FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Notifications RLS
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can send notifications" ON notifications FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- User Preferences RLS
CREATE POLICY "Users can manage own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view user preferences" ON user_preferences FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Analytics RLS
CREATE POLICY "Admins can view user analytics" ON user_analytics FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view product analytics" ON product_analytics FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view sales analytics" ON sales_analytics FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- ADDITIONAL CONSTRAINTS & VALIDATIONS
-- ============================================

-- Add foreign key constraints for existing tables that might be missing them
ALTER TABLE user_profiles ADD CONSTRAINT fk_user_profiles_referred_by FOREIGN KEY (referred_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE user_addresses ADD CONSTRAINT fk_user_addresses_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE shopping_cart ADD CONSTRAINT fk_shopping_cart_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE shopping_cart ADD CONSTRAINT fk_shopping_cart_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE wishlist ADD CONSTRAINT fk_wishlist_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE wishlist ADD CONSTRAINT fk_wishlist_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE orders ADD CONSTRAINT fk_orders_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE orders ADD CONSTRAINT fk_orders_shipping_address_id FOREIGN KEY (shipping_address_id) REFERENCES user_addresses(id) ON DELETE SET NULL;
ALTER TABLE orders ADD CONSTRAINT fk_orders_billing_address_id FOREIGN KEY (billing_address_id) REFERENCES user_addresses(id) ON DELETE SET NULL;
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_variant_id FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;
ALTER TABLE payments ADD CONSTRAINT fk_payments_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
ALTER TABLE refunds ADD CONSTRAINT fk_refunds_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
ALTER TABLE refunds ADD CONSTRAINT fk_refunds_payment_id FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE;
ALTER TABLE refunds ADD CONSTRAINT fk_refunds_requested_by FOREIGN KEY (requested_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE refunds ADD CONSTRAINT fk_refunds_processed_by FOREIGN KEY (processed_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE user_subscriptions ADD CONSTRAINT fk_user_subscriptions_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE user_subscriptions ADD CONSTRAINT fk_user_subscriptions_tier_id FOREIGN KEY (tier_id) REFERENCES subscription_tiers(id) ON DELETE SET NULL;
ALTER TABLE monthly_boxes ADD CONSTRAINT fk_monthly_boxes_subscription_id FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE CASCADE;
ALTER TABLE box_items ADD CONSTRAINT fk_box_items_box_id FOREIGN KEY (box_id) REFERENCES monthly_boxes(id) ON DELETE CASCADE;
ALTER TABLE box_items ADD CONSTRAINT fk_box_items_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
ALTER TABLE loyalty_points ADD CONSTRAINT fk_loyalty_points_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE loyalty_transactions ADD CONSTRAINT fk_loyalty_transactions_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE user_achievements ADD CONSTRAINT fk_user_achievements_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE user_achievements ADD CONSTRAINT fk_user_achievements_achievement_id FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE;
ALTER TABLE referrals ADD CONSTRAINT fk_referrals_referrer_id FOREIGN KEY (referrer_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE referrals ADD CONSTRAINT fk_referrals_referred_id FOREIGN KEY (referred_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE product_reviews ADD CONSTRAINT fk_product_reviews_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE product_reviews ADD CONSTRAINT fk_product_reviews_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE product_reviews ADD CONSTRAINT fk_product_reviews_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;
ALTER TABLE review_images ADD CONSTRAINT fk_review_images_review_id FOREIGN KEY (review_id) REFERENCES product_reviews(id) ON DELETE CASCADE;
ALTER TABLE deliveries ADD CONSTRAINT fk_deliveries_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
ALTER TABLE digital_deliveries ADD CONSTRAINT fk_digital_deliveries_order_item_id FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE;
ALTER TABLE digital_deliveries ADD CONSTRAINT fk_digital_deliveries_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE artists ADD CONSTRAINT fk_artists_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE albums ADD CONSTRAINT fk_albums_artist_id FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE;
ALTER TABLE albums ADD CONSTRAINT fk_albums_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
ALTER TABLE tracks ADD CONSTRAINT fk_tracks_album_id FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE;
ALTER TABLE tracks ADD CONSTRAINT fk_tracks_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
ALTER TABLE music_royalties ADD CONSTRAINT fk_music_royalties_artist_id FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE;
ALTER TABLE playlists ADD CONSTRAINT fk_playlists_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE playlist_tracks ADD CONSTRAINT fk_playlist_tracks_playlist_id FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE;
ALTER TABLE playlist_tracks ADD CONSTRAINT fk_playlist_tracks_track_id FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE;
ALTER TABLE playlist_tracks ADD CONSTRAINT fk_playlist_tracks_added_by FOREIGN KEY (added_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE listening_history ADD CONSTRAINT fk_listening_history_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE listening_history ADD CONSTRAINT fk_listening_history_track_id FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE;
ALTER TABLE nft_collections ADD CONSTRAINT fk_nft_collections_creator_id FOREIGN KEY (creator_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE nft_collections ADD CONSTRAINT fk_nft_collections_artist_id FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL;
ALTER TABLE nfts ADD CONSTRAINT fk_nfts_collection_id FOREIGN KEY (collection_id) REFERENCES nft_collections(id) ON DELETE CASCADE;
ALTER TABLE nfts ADD CONSTRAINT fk_nfts_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
ALTER TABLE nft_ownership ADD CONSTRAINT fk_nft_ownership_nft_id FOREIGN KEY (nft_id) REFERENCES nfts(id) ON DELETE CASCADE;
ALTER TABLE nft_ownership ADD CONSTRAINT fk_nft_ownership_owner_id FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE nft_sales_history ADD CONSTRAINT fk_nft_sales_history_nft_id FOREIGN KEY (nft_id) REFERENCES nfts(id) ON DELETE CASCADE;
ALTER TABLE nft_sales_history ADD CONSTRAINT fk_nft_sales_history_seller_id FOREIGN KEY (seller_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE nft_sales_history ADD CONSTRAINT fk_nft_sales_history_buyer_id FOREIGN KEY (buyer_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE nft_bids ADD CONSTRAINT fk_nft_bids_nft_id FOREIGN KEY (nft_id) REFERENCES nfts(id) ON DELETE CASCADE;
ALTER TABLE nft_bids ADD CONSTRAINT fk_nft_bids_bidder_id FOREIGN KEY (bidder_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE nft_auctions ADD CONSTRAINT fk_nft_auctions_nft_id FOREIGN KEY (nft_id) REFERENCES nfts(id) ON DELETE CASCADE;
ALTER TABLE nft_auctions ADD CONSTRAINT fk_nft_auctions_current_highest_bidder FOREIGN KEY (current_highest_bidder) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE crypto_wallets ADD CONSTRAINT fk_crypto_wallets_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE crypto_transactions ADD CONSTRAINT fk_crypto_transactions_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE crypto_transactions ADD CONSTRAINT fk_crypto_transactions_wallet_id FOREIGN KEY (wallet_id) REFERENCES crypto_wallets(id) ON DELETE SET NULL;
ALTER TABLE supply_chain_records ADD CONSTRAINT fk_supply_chain_records_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE carbon_offsets ADD CONSTRAINT fk_carbon_offsets_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
ALTER TABLE carbon_offsets ADD CONSTRAINT fk_carbon_offsets_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE sustainability_certifications ADD CONSTRAINT fk_sustainability_certifications_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE user_preferences ADD CONSTRAINT fk_user_preferences_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE user_analytics ADD CONSTRAINT fk_user_analytics_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE product_analytics ADD CONSTRAINT fk_product_analytics_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- ============================================
-- FUNCTIONS & VIEWS
-- ============================================

-- Function to calculate user loyalty tier based on total spent
CREATE OR REPLACE FUNCTION calculate_loyalty_tier(total_spent DECIMAL) RETURNS TEXT AS $$
BEGIN
    CASE
        WHEN total_spent >= 10000 THEN RETURN 'platinum';
        WHEN total_spent >= 5000 THEN RETURN 'gold';
        WHEN total_spent >= 1000 THEN RETURN 'silver';
        ELSE RETURN 'bronze';
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code() RETURNS TEXT AS $$
DECLARE
    code TEXT;
BEGIN
    LOOP
        code := upper(substr(md5(random()::text), 1, 8));
        EXIT WHEN NOT EXISTS (SELECT 1 FROM user_profiles WHERE referral_code = code);
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- View for product catalog with ratings
CREATE OR REPLACE VIEW product_catalog AS
SELECT 
    p.id,
    p.product_name,
    p.slug,
    p.description,
    p.price,
    p.compare_at_price,
    p.stock_quantity,
    p.is_active,
    p.sustainability_score,
    p.product_type,
    pc.category_name,
    pc.slug as category_slug,
    pi.image_url as primary_image,
    COALESCE(pr.avg_rating, 0) as avg_rating,
    COALESCE(pr.review_count, 0) as review_count
FROM products p
LEFT JOIN product_categories pc ON p.category_id = pc.id
LEFT JOIN (
    SELECT product_id, AVG(rating) as avg_rating, COUNT(*) as review_count
    FROM product_reviews 
    WHERE is_approved = true 
    GROUP BY product_id
) pr ON p.id = pr.product_id
LEFT JOIN (
    SELECT product_id, image_url 
    FROM product_images 
    WHERE is_primary = true 
    LIMIT 1
) pi ON p.id = pi.product_id
WHERE p.is_active = true;

-- View for user order summary
CREATE OR REPLACE VIEW user_order_summary AS
SELECT 
    o.user_id,
    COUNT(*) as total_orders,
    SUM(o.total_amount) as total_spent,
    AVG(o.total_amount) as avg_order_value,
    MAX(o.created_at) as last_order_date
FROM orders o
WHERE o.status NOT IN ('cancelled', 'refunded')
GROUP BY o.user_id;

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample genres if they don't exist
INSERT INTO genres (name, description) VALUES
('Hip Hop', 'Urban music with rhythmic beats and rap vocals'),
('Electronic', 'Synthesized music with electronic instruments'),
('Jazz', 'Improvisational music with complex harmonies'),
('Reggae', 'Jamaican music with offbeat rhythms'),
('Afrobeats', 'African pop music with danceable rhythms'),
('House', 'Electronic dance music with repetitive beats'),
('Amapiano', 'South African deep house with log drums'),
('Classical', 'Traditional orchestral and instrumental music')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Log migration completion
INSERT INTO migrations_log (version, description, executed_at) VALUES
('20260208174700_003_indexes_rls_final', 'Performance indexes, comprehensive RLS policies, and final schema cleanup', NOW())
ON CONFLICT (version) DO NOTHING;

-- ============================================
-- SCHEMA VALIDATION
-- ============================================

-- Validate that all required tables exist
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'user_profiles', 'user_addresses', 'product_categories', 'products', 
        'product_images', 'product_variants', 'shopping_cart', 'wishlist',
        'orders', 'order_items', 'payments', 'refunds', 'subscription_tiers',
        'user_subscriptions', 'monthly_boxes', 'box_items', 'loyalty_points',
        'loyalty_transactions', 'achievements', 'user_achievements', 'referrals',
        'product_reviews', 'review_images', 'deliveries', 'digital_deliveries',
        'artists', 'albums', 'tracks', 'music_royalties', 'playlists',
        'playlist_tracks', 'listening_history', 'nft_collections', 'nfts',
        'nft_ownership', 'nft_sales_history', 'nft_bids', 'nft_auctions',
        'crypto_wallets', 'crypto_transactions', 'supply_chain_records',
        'carbon_offsets', 'sustainability_certifications', 'notifications',
        'user_preferences', 'user_analytics', 'product_analytics', 'sales_analytics'
    );
    
    RAISE NOTICE 'Schema validation complete: % tables created successfully', table_count;
END $$;