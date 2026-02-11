-- ============================================
-- ALPHA APPEAL - MUSIC & NFT PLATFORM
-- Migration 002: Music Platform + NFT Marketplace
-- Extends core e-commerce schema
-- ============================================

-- ============================================
-- MUSIC PLATFORM
-- ============================================

-- Artists (extends user_profiles for musicians)
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE,
  artist_name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  banner_image_url TEXT,
  social_links JSONB,
  sustainability_story TEXT,
  contract_start_date DATE,
  royalty_percentage DECIMAL(5,2) DEFAULT 50.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Albums
CREATE TABLE IF NOT EXISTS albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artists ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products ON DELETE SET NULL,
  album_title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  release_date DATE,
  album_type TEXT CHECK (album_type IN ('album', 'ep', 'single', 'compilation')) DEFAULT 'album',
  cover_art_url TEXT,
  description TEXT,
  total_tracks INTEGER,
  genres TEXT[],
  is_released BOOLEAN DEFAULT false,
  explicit_content BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracks
CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID REFERENCES albums ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products ON DELETE SET NULL,
  track_title TEXT NOT NULL,
  track_number INTEGER,
  duration_seconds INTEGER,
  audio_file_url TEXT,
  lyrics TEXT,
  is_explicit BOOLEAN DEFAULT false,
  preview_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Music Royalties
CREATE TABLE IF NOT EXISTS music_royalties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artists ON DELETE CASCADE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_sales DECIMAL(12,2),
  artist_earnings DECIMAL(12,2),
  payment_status TEXT CHECK (payment_status IN ('pending', 'processing', 'paid', 'disputed')) DEFAULT 'pending',
  payment_date DATE,
  transaction_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artist_id, period_start, period_end)
);

-- Music Playlists
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  playlist_name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  cover_image_url TEXT,
  track_count INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlist Tracks
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID REFERENCES playlists ON DELETE CASCADE NOT NULL,
  track_id UUID REFERENCES tracks ON DELETE CASCADE NOT NULL,
  added_by UUID REFERENCES auth.users ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  display_order INTEGER DEFAULT 0,
  UNIQUE(playlist_id, track_id)
);

-- Music Listening History
CREATE TABLE IF NOT EXISTS listening_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  track_id UUID REFERENCES tracks ON DELETE CASCADE NOT NULL,
  played_at TIMESTAMPTZ DEFAULT NOW(),
  play_duration_seconds INTEGER,
  source TEXT CHECK (source IN ('album', 'playlist', 'radio', 'search')) DEFAULT 'search'
);

-- ============================================
-- NFT MARKETPLACE
-- ============================================

-- NFT Collections
CREATE TABLE IF NOT EXISTS nft_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES auth.users ON DELETE SET NULL,
  artist_id UUID REFERENCES artists ON DELETE SET NULL,
  contract_address TEXT,
  blockchain TEXT DEFAULT 'ethereum' CHECK (blockchain IN ('ethereum', 'polygon', 'solana', 'binance')),
  royalty_percentage DECIMAL(5,2) DEFAULT 10.00,
  banner_image_url TEXT,
  collection_size INTEGER,
  total_supply INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NFTs
CREATE TABLE IF NOT EXISTS nfts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID REFERENCES nft_collections ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products ON DELETE SET NULL,
  token_id TEXT,
  nft_name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  metadata_url TEXT,
  animation_url TEXT,
  total_supply INTEGER DEFAULT 1,
  minted_count INTEGER DEFAULT 0,
  utility_description TEXT,
  attributes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NFT Ownership
CREATE TABLE IF NOT EXISTS nft_ownership (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nft_id UUID REFERENCES nfts ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  purchase_price DECIMAL(12,2),
  purchase_currency TEXT DEFAULT 'ZAR',
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  transaction_hash TEXT,
  is_primary_owner BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NFT Sales History
CREATE TABLE IF NOT EXISTS nft_sales_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nft_id UUID REFERENCES nfts ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users ON DELETE SET NULL,
  buyer_id UUID REFERENCES auth.users ON DELETE SET NULL,
  sale_price DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  marketplace TEXT,
  transaction_hash TEXT,
  sold_at TIMESTAMPTZ DEFAULT NOW()
);

-- NFT Bids
CREATE TABLE IF NOT EXISTS nft_bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nft_id UUID REFERENCES nfts ON DELETE CASCADE NOT NULL,
  bidder_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  bid_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  bid_status TEXT CHECK (bid_status IN ('active', 'accepted', 'rejected', 'outbid', 'expired')) DEFAULT 'active',
  bid_time TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- NFT Auctions
CREATE TABLE IF NOT EXISTS nft_auctions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nft_id UUID REFERENCES nfts ON DELETE CASCADE NOT NULL,
  starting_price DECIMAL(12,2) NOT NULL,
  reserve_price DECIMAL(12,2),
  auction_start TIMESTAMPTZ NOT NULL,
  auction_end TIMESTAMPTZ NOT NULL,
  current_highest_bid DECIMAL(12,2),
  current_highest_bidder UUID REFERENCES auth.users ON DELETE SET NULL,
  auction_status TEXT CHECK (auction_status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BLOCKCHAIN & CRYPTO PAYMENTS
-- ============================================

-- Crypto Wallets
CREATE TABLE IF NOT EXISTS crypto_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  wallet_address TEXT NOT NULL,
  blockchain TEXT CHECK (blockchain IN ('ethereum', 'polygon', 'solana', 'binance')) NOT NULL,
  wallet_type TEXT CHECK (wallet_type IN ('metamask', 'trustwallet', 'phantom', 'binance-wallet')) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, wallet_address, blockchain)
);

-- Crypto Transactions
CREATE TABLE IF NOT EXISTS crypto_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  wallet_id UUID REFERENCES crypto_wallets ON DELETE CASCADE,
  transaction_type TEXT CHECK (transaction_type IN ('deposit', 'withdrawal', 'payment', 'refund')) NOT NULL,
  amount DECIMAL(18,8) NOT NULL,
  currency TEXT NOT NULL,
  blockchain TEXT NOT NULL,
  transaction_hash TEXT,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'failed', 'cancelled')) DEFAULT 'pending',
  reference_id UUID, -- Links to orders, payments, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- ============================================
-- SUPPLY CHAIN & SUSTAINABILITY
-- ============================================

-- Supply Chain Records
CREATE TABLE IF NOT EXISTS supply_chain_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products ON DELETE CASCADE NOT NULL,
  stage TEXT CHECK (stage IN ('cultivation', 'harvest', 'processing', 'manufacturing', 'distribution', 'retail')) NOT NULL,
  location TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  blockchain_hash TEXT,
  certification_urls TEXT[],
  carbon_footprint_kg DECIMAL(6,2),
  water_usage_liters INTEGER,
  energy_consumption_kwh DECIMAL(8,2),
  notes TEXT
);

-- Carbon Offsets
CREATE TABLE IF NOT EXISTS carbon_offsets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders ON DELETE CASCADE,
  product_id UUID REFERENCES products ON DELETE CASCADE,
  carbon_footprint_kg DECIMAL(6,2),
  offset_cost DECIMAL(10,2),
  offset_provider TEXT,
  certificate_url TEXT,
  blockchain_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sustainability Certifications
CREATE TABLE IF NOT EXISTS sustainability_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products ON DELETE CASCADE NOT NULL,
  certification_type TEXT NOT NULL,
  certifying_body TEXT NOT NULL,
  certificate_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS & COMMUNICATION
-- ============================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT true,
  preferred_language TEXT DEFAULT 'en',
  preferred_currency TEXT DEFAULT 'ZAR',
  theme_preference TEXT CHECK (theme_preference IN ('light', 'dark', 'system')) DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ANALYTICS & REPORTING
-- ============================================

-- User Analytics
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  session_id TEXT,
  page_views INTEGER DEFAULT 0,
  time_on_site INTEGER DEFAULT 0, -- in seconds
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  referrer_source TEXT,
  device_type TEXT,
  browser TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Analytics
CREATE TABLE IF NOT EXISTS product_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products ON DELETE CASCADE NOT NULL,
  views INTEGER DEFAULT 0,
  add_to_cart INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  wishlist_adds INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0.0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Analytics
CREATE TABLE IF NOT EXISTS sales_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_customers INTEGER DEFAULT 0,
  avg_order_value DECIMAL(10,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Music tables
CREATE INDEX IF NOT EXISTS idx_artists_user ON artists(user_id);
CREATE INDEX IF NOT EXISTS idx_artists_active ON artists(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_albums_artist ON albums(artist_id);
CREATE INDEX IF NOT EXISTS idx_albums_released ON albums(is_released) WHERE is_released = true;
CREATE INDEX IF NOT EXISTS idx_tracks_album ON tracks(album_id);
CREATE INDEX IF NOT EXISTS idx_music_royalties_artist ON music_royalties(artist_id);
CREATE INDEX IF NOT EXISTS idx_music_royalties_period ON music_royalties(period_start, period_end);

-- Playlist tables
CREATE INDEX IF NOT EXISTS idx_playlists_user ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_public ON playlists(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist ON playlist_tracks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_track ON playlist_tracks(track_id);
CREATE INDEX IF NOT EXISTS idx_listening_history_user ON listening_history(user_id);
CREATE INDEX IF NOT EXISTS idx_listening_history_track ON listening_history(track_id);

-- NFT tables
CREATE INDEX IF NOT EXISTS idx_nft_collections_creator ON nft_collections(creator_id);
CREATE INDEX IF NOT EXISTS idx_nft_collections_artist ON nft_collections(artist_id);
CREATE INDEX IF NOT EXISTS idx_nfts_collection ON nfts(collection_id);
CREATE INDEX IF NOT EXISTS idx_nfts_product ON nfts(product_id);
CREATE INDEX IF NOT EXISTS idx_nft_ownership_owner ON nft_ownership(owner_id);
CREATE INDEX IF NOT EXISTS idx_nft_ownership_nft ON nft_ownership(nft_id);
CREATE INDEX IF NOT EXISTS idx_nft_sales_nft ON nft_sales_history(nft_id);
CREATE INDEX IF NOT EXISTS idx_nft_sales_buyer ON nft_sales_history(buyer_id);
CREATE INDEX IF NOT EXISTS idx_nft_bids_nft ON nft_bids(nft_id);
CREATE INDEX IF NOT EXISTS idx_nft_bids_bidder ON nft_bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_nft_auctions_nft ON nft_auctions(nft_id);

-- Crypto tables
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_user ON crypto_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_address ON crypto_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_user ON crypto_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_hash ON crypto_transactions(transaction_hash);

-- Supply chain tables
CREATE INDEX IF NOT EXISTS idx_supply_chain_product ON supply_chain_records(product_id);
CREATE INDEX IF NOT EXISTS idx_supply_chain_stage ON supply_chain_records(stage);
CREATE INDEX IF NOT EXISTS idx_carbon_offsets_order ON carbon_offsets(order_id);
CREATE INDEX IF NOT EXISTS idx_carbon_offsets_product ON carbon_offsets(product_id);

-- Notification tables
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- Analytics tables
CREATE INDEX IF NOT EXISTS idx_user_analytics_user ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_session ON user_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_product ON product_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_analytics_date ON sales_analytics(date);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on new tables
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_royalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_sales_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_chain_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_offsets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sustainability_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Music
-- Artists can manage their own content
CREATE POLICY "Artists can manage own content"
  ON artists FOR ALL
  USING (auth.uid() = user_id);

-- Anyone can view released albums
CREATE POLICY "Anyone can view released albums"
  ON albums FOR SELECT
  USING (is_released = true);

-- Artists can manage their own albums
CREATE POLICY "Artists can manage own albums"
  ON albums FOR ALL
  USING (artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid()));

-- Artists can manage their own tracks
CREATE POLICY "Artists can manage own tracks"
  ON tracks FOR ALL
  USING (album_id IN (SELECT id FROM albums WHERE artist_id IN (SELECT id FROM artists WHERE user_id = auth.uid())));

-- Users can manage their own playlists
CREATE POLICY "Users can manage own playlists"
  ON playlists FOR ALL
  USING (auth.uid() = user_id);

-- Users can manage their own playlist tracks
CREATE POLICY "Users can manage own playlist tracks"
  ON playlist_tracks FOR ALL
  USING (playlist_id IN (SELECT id FROM playlists WHERE user_id = auth.uid()));

-- Users can view their own listening history
CREATE POLICY "Users can view own listening history"
  ON listening_history FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Triggers for updated_at
CREATE TRIGGER update_artists_updated_at
  BEFORE UPDATE ON artists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_albums_updated_at
  BEFORE UPDATE ON albums
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nft_collections_updated_at
  BEFORE UPDATE ON nft_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nfts_updated_at
  BEFORE UPDATE ON nfts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample music genres
INSERT INTO genres (name) VALUES
('Hip Hop'),
('Electronic'),
('Jazz'),
('Reggae'),
('Afrobeats'),
('House'),
('Amapiano'),
('Classical')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Log migration completion
INSERT INTO migrations_log (version, description, executed_at) VALUES
('20260208174500_002_music_nft_platform', 'Music platform and NFT marketplace with blockchain integration', NOW())
ON CONFLICT (version) DO NOTHING;