-- ============================================
-- ALPHA APPEAL - INITIAL SEED DATA
-- Migration 004: Starter Data
-- ============================================

-- ============================================
-- SUBSCRIPTION TIERS
-- ============================================

INSERT INTO subscription_tiers (tier_name, monthly_price, discount_percentage, features, box_description) VALUES
('Basic', 299.00, 0, '{"box_size": "Standard", "products": ["Flower", "Accessories"], "shipping": "Standard"}', 'Monthly box with curated products'),
('Premium', 599.00, 10, '{"box_size": "Premium", "products": ["Flower", "Edibles", "Accessories"], "shipping": "Free", "exclusive": "Early access"}', 'Premium monthly box with exclusive items'),
('Elite', 999.00, 20, '{"box_size": "Elite", "products": ["All categories"], "shipping": "Free", "exclusive": "VIP access", "personalized": "Custom selection"}', 'Elite experience with personalized selections')
ON CONFLICT (tier_name) DO NOTHING;

-- ============================================
-- PRODUCT CATEGORIES
-- ============================================

-- Main categories
INSERT INTO product_categories (category_name, slug, icon_url, description, display_order) VALUES
('Fashion', 'fashion', 'shirt', 'Sustainable hemp-based clothing and accessories', 1),
('Wellness', 'wellness', 'heart-pulse', 'CBD oils, edibles, and wellness products', 2),
('Music', 'music', 'music', 'Digital albums, vinyl, and exclusive tracks', 3),
('NFTs', 'nfts', 'badge', 'Limited edition digital collectibles', 4)
ON CONFLICT (slug) DO NOTHING;

-- Fashion subcategories
WITH fashion_cat AS (SELECT id FROM product_categories WHERE slug = 'fashion')
INSERT INTO product_categories (category_name, slug, parent_category_id, icon_url, description, display_order)
SELECT 'Hemp Clothing', 'hemp-clothing', id, 'shirt', 'T-shirts, hoodies, pants made from hemp', 1 FROM fashion_cat
UNION ALL
SELECT 'Accessories', 'accessories', id, 'watch', 'Bags, hats, jewelry', 2 FROM fashion_cat
UNION ALL
SELECT 'Artist Merch', 'artist-merch', id, 'star', 'Exclusive artist collaboration pieces', 3 FROM fashion_cat
ON CONFLICT (slug) DO NOTHING;

-- Wellness subcategories
WITH wellness_cat AS (SELECT id FROM product_categories WHERE slug = 'wellness')
INSERT INTO product_categories (category_name, slug, parent_category_id, icon_url, description, display_order)
SELECT 'CBD Oils', 'cbd-oils', id, 'droplet', 'Full-spectrum CBD oils and tinctures', 1 FROM wellness_cat
UNION ALL
SELECT 'Edibles', 'edibles', id, 'candy', 'CBD gummies, chocolates, and snacks', 2 FROM wellness_cat
UNION ALL
SELECT 'Skincare', 'skincare', id, 'sparkles', 'CBD-infused creams, balms, and serums', 3 FROM wellness_cat
ON CONFLICT (slug) DO NOTHING;

-- Music subcategories
WITH music_cat AS (SELECT id FROM product_categories WHERE slug = 'music')
INSERT INTO product_categories (category_name, slug, parent_category_id, icon_url, description, display_order)
SELECT 'Digital Albums', 'digital-albums', id, 'disc', 'MP3, FLAC, and WAV downloads', 1 FROM music_cat
UNION ALL
SELECT 'Vinyl', 'vinyl', id, 'disc-3', 'Limited edition vinyl pressings', 2 FROM music_cat
UNION ALL
SELECT 'Exclusive Tracks', 'exclusive-tracks', id, 'music-2', 'Unreleased and exclusive content', 3 FROM music_cat
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SAMPLE PRODUCTS
-- ============================================

-- Fashion Products
WITH fashion_cat AS (SELECT id FROM product_categories WHERE slug = 'hemp-clothing')
INSERT INTO products (category_id, product_name, slug, description, long_description, price, stock_quantity, hemp_based, sustainability_score, is_active, product_type, weight_grams, metadata)
SELECT 
  id,
  'Alpha Appeal Hemp T-Shirt',
  'alpha-appeal-hemp-tshirt',
  'Comfortable, sustainable hemp t-shirt with Alpha Appeal logo',
  'Made from 100% organic hemp fibers, this t-shirt is soft, breathable, and eco-friendly. Features the Alpha Appeal logo and comes in multiple colors. Hemp cultivation requires 50% less water than cotton and regenerates soil health.',
  299.00,
  50,
  true,
  5,
  true,
  'clothing',
  200,
  '{"sizes": ["S", "M", "L", "XL", "XXL"], "colors": ["Black", "White", "Green"], "material": "100% Hemp", "care": "Machine wash cold"}'
FROM fashion_cat
ON CONFLICT (slug) DO NOTHING;

-- Wellness Products
WITH wellness_cat AS (SELECT id FROM product_categories WHERE slug = 'cbd-oils')
INSERT INTO products (category_id, product_name, slug, description, long_description, price, stock_quantity, sustainability_score, is_active, product_type, metadata)
SELECT 
  id,
  'Full Spectrum CBD Oil 1000mg',
  'full-spectrum-cbd-oil-1000mg',
  'Premium full-spectrum CBD oil for relaxation and wellness',
  'Our full-spectrum CBD oil contains 1000mg of CBD per 30ml bottle. Extracted from organically grown hemp using CO2 extraction. Contains beneficial cannabinoids and terpenes. Third-party lab tested for purity and potency.',
  799.00,
  30,
  5,
  true,
  'cbd_oil',
  '{"strength": "1000mg", "volume": "30ml", "ingredients": ["Hemp Extract", "MCT Oil"], "dosage": "Start with 0.25ml (8.3mg CBD) twice daily", "lab_tested": true}'
FROM wellness_cat
ON CONFLICT (slug) DO NOTHING;

-- Music Products (Digital)
WITH music_cat AS (SELECT id FROM product_categories WHERE slug = 'digital-albums')
INSERT INTO products (category_id, product_name, slug, description, long_description, price, is_digital, requires_shipping, stock_quantity, is_active, product_type, metadata)
SELECT 
  id,
  'Alpha Waves - Debut Album (Digital)',
  'alpha-waves-debut-album-digital',
  'First album from eco-conscious hip-hop artist Alpha Waves',
  'Alpha Waves brings conscious lyrics and sustainable vibes in this groundbreaking debut. Features 12 tracks exploring themes of environmental activism, social justice, and personal growth. Available in MP3, FLAC, and WAV formats.',
  149.00,
  true,
  false,
  999,
  true,
  'digital_album',
  '{"format": ["MP3", "FLAC", "WAV"], "tracks": 12, "duration": "42:18", "genre": ["Hip Hop", "Conscious Rap"], "released": "2025-12-01"}'
FROM music_cat
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- ACHIEVEMENTS
-- ============================================

INSERT INTO achievements (achievement_name, description, badge_icon_url, points_reward, criteria) VALUES
('First Purchase', 'Made your first Alpha Appeal purchase', '/badges/first-purchase.svg', 50, '{"type": "order_count", "threshold": 1}'),
('Hemp Hero', 'Purchased 5 hemp-based products', '/badges/hemp-hero.svg', 100, '{"type": "hemp_products", "threshold": 5}'),
('Wellness Warrior', 'Purchased 10 wellness products', '/badges/wellness-warrior.svg', 150, '{"type": "category_purchases", "category": "Wellness", "threshold": 10}'),
('Music Lover', 'Purchased 5 albums or tracks', '/badges/music-lover.svg', 100, '{"type": "category_purchases", "category": "Music", "threshold": 5}'),
('Sustainable Star', 'Offset 100kg of carbon through purchases', '/badges/sustainable-star.svg', 200, '{"type": "carbon_offset", "threshold": 100}'),
('Social Butterfly', 'Referred 5 friends successfully', '/badges/social-butterfly.svg', 500, '{"type": "referrals", "threshold": 5}'),
('Review Guru', 'Written 10 approved product reviews', '/badges/review-guru.svg', 200, '{"type": "reviews", "threshold": 10}'),
('Early Adopter', 'Joined Alpha Appeal in the first month', '/badges/early-adopter.svg', 300, '{"type": "signup_date", "before": "2026-03-08"}'),
('VIP Member', 'Subscribed to Alpha VIP tier', '/badges/vip-member.svg', 250, '{"type": "subscription_tier", "tier": "alpha_vip"}'),
('NFT Collector', 'Owned 3 Alpha Appeal NFTs', '/badges/nft-collector.svg', 400, '{"type": "nft_count", "threshold": 3}')
ON CONFLICT (achievement_name) DO NOTHING;

-- ============================================
-- SAMPLE ARTIST
-- ============================================

-- Create sample artist (would normally link to a user_id)
INSERT INTO artists (artist_name, slug, bio, sustainability_story, royalty_percentage, is_active)
VALUES (
  'Alpha Waves',
  'alpha-waves',
  'Alpha Waves is a South African hip-hop artist dedicated to spreading messages of environmental consciousness and social justice through music.',
  'Alpha Waves uses hemp-based merchandise, eco-friendly vinyl pressings, and donates 10% of all proceeds to reforestation projects in South Africa.',
  50.00,
  true
)
ON CONFLICT (slug) DO NOTHING;

-- Create sample album
WITH artist AS (SELECT id FROM artists WHERE slug = 'alpha-waves')
INSERT INTO albums (artist_id, album_title, slug, release_date, album_type, description, total_tracks, genres, is_released)
SELECT 
  id,
  'Conscious Vibes',
  'conscious-vibes',
  '2025-12-01',
  'album',
  'Debut album exploring themes of sustainability, social justice, and personal growth',
  12,
  ARRAY['Hip Hop', 'Conscious Rap', 'Afrobeat'],
  true
FROM artist
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SAMPLE TRACKS
-- ============================================

WITH album AS (SELECT id FROM albums WHERE slug = 'conscious-vibes')
INSERT INTO tracks (album_id, track_title, track_number, duration_seconds, preview_url)
SELECT 
  id,
  'Green Revolution',
  1,
  240,
  'https://example.com/previews/green-revolution.mp3'
FROM album
UNION ALL
SELECT 
  id,
  'Sustainable Life',
  2,
  260,
  'https://example.com/previews/sustainable-life.mp3'
FROM album
UNION ALL
SELECT 
  id,
  'Eco Conscious',
  3,
  220,
  'https://example.com/previews/eco-conscious.mp3'
FROM album
ON CONFLICT (album_id, track_number) DO NOTHING;

-- ============================================
-- SAMPLE NFT COLLECTION
-- ============================================

INSERT INTO nft_collections (collection_name, slug, description, blockchain, royalty_percentage, collection_size, total_supply)
VALUES (
  'Eco Conscious Art',
  'eco-conscious-art',
  'Limited edition digital art celebrating environmental awareness',
  'ethereum',
  10.00,
  100,
  1
)
ON CONFLICT (slug) DO NOTHING;

-- Sample NFT
WITH collection AS (SELECT id FROM nft_collections WHERE slug = 'eco-conscious-art')
INSERT INTO nfts (collection_id, nft_name, description, image_url, total_supply, utility_description, attributes)
SELECT 
  id,
  'Green Future #001',
  'Digital artwork representing a sustainable future',
  'https://example.com/nfts/green-future-001.png',
  1,
  'Access to exclusive Alpha Waves concert',
  '{"artist": "Alpha Waves", "theme": "Environment", "edition": "1/100"}'
FROM collection
ON CONFLICT (nft_name) DO NOTHING;

-- ============================================
-- VERIFY SEED DATA
-- ============================================

-- Check counts and log results
DO $$
DECLARE
  tier_count INTEGER;
  category_count INTEGER;
  product_count INTEGER;
  achievement_count INTEGER;
  artist_count INTEGER;
  album_count INTEGER;
  track_count INTEGER;
  nft_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO tier_count FROM subscription_tiers;
  SELECT COUNT(*) INTO category_count FROM product_categories;
  SELECT COUNT(*) INTO product_count FROM products;
  SELECT COUNT(*) INTO achievement_count FROM achievements;
  SELECT COUNT(*) INTO artist_count FROM artists;
  SELECT COUNT(*) INTO album_count FROM albums;
  SELECT COUNT(*) INTO track_count FROM tracks;
  SELECT COUNT(*) INTO nft_count FROM nfts;
  
  RAISE NOTICE '=== SEED DATA VERIFICATION ===';
  RAISE NOTICE 'Subscription Tiers: %', tier_count;
  RAISE NOTICE 'Product Categories: %', category_count;
  RAISE NOTICE 'Products: %', product_count;
  RAISE NOTICE 'Achievements: %', achievement_count;
  RAISE NOTICE 'Artists: %', artist_count;
  RAISE NOTICE 'Albums: %', album_count;
  RAISE NOTICE 'Tracks: %', track_count;
  RAISE NOTICE 'NFTs: %', nft_count;
  RAISE NOTICE '=== SEED DATA COMPLETE ===';
END $$;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

INSERT INTO migrations_log (version, description, executed_at) VALUES
('20260208175000_004_seed_initial_data', 'Initial seed data for products, artists, achievements, and NFTs', NOW())
ON CONFLICT (version) DO NOTHING;