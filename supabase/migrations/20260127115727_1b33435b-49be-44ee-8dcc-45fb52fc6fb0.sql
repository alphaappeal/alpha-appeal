-- 1. ALPHA PARTNERS TABLE (main partner data - extends map_locations concept)
CREATE TABLE IF NOT EXISTS alpha_partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  partner_since TEXT DEFAULT '2024',
  alpha_status TEXT CHECK (alpha_status IN ('verified', 'featured', 'exclusive')) DEFAULT 'verified',
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  email TEXT,
  website TEXT,
  hours_weekdays TEXT DEFAULT '09:00 - 18:00',
  hours_saturday TEXT DEFAULT '10:00 - 17:00',
  hours_sunday TEXT DEFAULT 'Closed',
  currently_open BOOLEAN DEFAULT true,
  vibe TEXT,
  specialties TEXT[],
  atmosphere TEXT,
  hero_image TEXT,
  member_discount TEXT,
  exclusive_access TEXT,
  special_events TEXT,
  amenities TEXT[],
  payment_methods TEXT[],
  rating_overall DECIMAL(2, 1) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  has_delivery BOOLEAN DEFAULT false,
  open_for_reservations BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on alpha_partners
ALTER TABLE alpha_partners ENABLE ROW LEVEL SECURITY;

-- Anyone can view partners
CREATE POLICY "Anyone can view alpha partners"
  ON alpha_partners FOR SELECT
  USING (true);

-- Admins can manage all partners
CREATE POLICY "Admins can manage alpha partners"
  ON alpha_partners FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. VENDOR ACCOUNTS TABLE (links users to partners)
CREATE TABLE IF NOT EXISTS vendor_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  partner_id UUID REFERENCES alpha_partners(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'manager' CHECK (role IN ('owner', 'manager', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, partner_id)
);

ALTER TABLE vendor_accounts ENABLE ROW LEVEL SECURITY;

-- Users can view their own vendor accounts
CREATE POLICY "Users can view own vendor accounts"
  ON vendor_accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can manage all vendor accounts
CREATE POLICY "Admins can manage vendor accounts"
  ON vendor_accounts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. PARTNER PRODUCTS TABLE (inventory management)
CREATE TABLE IF NOT EXISTS partner_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES alpha_partners(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('flower', 'edibles', 'concentrates', 'accessories', 'wellness')),
  strain_type TEXT CHECK (strain_type IN ('indica', 'sativa', 'hybrid', 'cbd', 'other')),
  thc_percentage DECIMAL(4, 2),
  cbd_percentage DECIMAL(4, 2),
  price DECIMAL(10, 2),
  price_unit TEXT DEFAULT 'per gram',
  description TEXT,
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  effects TEXT[],
  flavors TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE partner_products ENABLE ROW LEVEL SECURITY;

-- Anyone can view products
CREATE POLICY "Anyone can view partner products"
  ON partner_products FOR SELECT
  USING (true);

-- Vendors can manage their own products
CREATE POLICY "Vendors can manage own products"
  ON partner_products FOR ALL
  USING (
    partner_id IN (
      SELECT partner_id FROM vendor_accounts WHERE user_id = auth.uid()
    )
  );

-- Admins can manage all products
CREATE POLICY "Admins can manage all partner products"
  ON partner_products FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Vendors can update their partner info
CREATE POLICY "Vendors can update own partner"
  ON alpha_partners FOR UPDATE
  USING (
    id IN (
      SELECT partner_id FROM vendor_accounts WHERE user_id = auth.uid()
    )
  );

-- 4. INSERT SAMPLE PARTNER DATA
INSERT INTO alpha_partners (
  name, alpha_status, address, city, region, latitude, longitude,
  phone, vibe, specialties, atmosphere, hero_image,
  member_discount, exclusive_access, special_events,
  amenities, payment_methods, rating_overall, review_count, featured
) VALUES
(
  'Canna Cafe',
  'verified',
  '10 Bank St, Boksburg, 1459',
  'Boksburg',
  'Gauteng',
  -26.2167,
  28.2500,
  '+27 11 894 0000',
  'Cafe & Lounge',
  ARRAY['Premium Flower', 'Edibles', 'Coffee Bar'],
  'Relaxed cafe atmosphere with knowledgeable staff',
  'https://images.unsplash.com/photo-1577648188599-291bb8b831c3?w=800',
  '10% off all purchases',
  'Priority seating in lounge',
  'Monthly Alpha member tastings',
  ARRAY['WiFi', 'Lounge', 'Parking', 'Coffee Bar'],
  ARRAY['Cash', 'Card', 'EFT'],
  4.7,
  142,
  false
),
(
  'Mookush',
  'exclusive',
  '27 Gleneagles Rd, Greenside, Johannesburg',
  'Johannesburg',
  'Gauteng',
  -26.1628,
  28.0146,
  '+27 11 XXX XXXX',
  'Lifestyle Lounge',
  ARRAY['Curated Selection', 'Premium Accessories', 'Events Space'],
  'Upscale lounge experience for cannabis connoisseurs',
  'https://images.unsplash.com/photo-1584553421349-3557997c58c3?w=800',
  '20% off for Elite members',
  'Private lounge access',
  'Invitation to exclusive Alpha events',
  ARRAY['VIP Lounge', 'WiFi', 'Parking', 'Event Space', 'Music'],
  ARRAY['Cash', 'Card', 'EFT', 'Crypto'],
  4.8,
  203,
  true
),
(
  'El Blanco',
  'featured',
  'The Gantry Lifestyle Center, Fourways',
  'Fourways',
  'Gauteng',
  -26.0262,
  28.0047,
  '+27 11 XXX XXXX',
  'Upscale Boutique',
  ARRAY['Designer Strains', 'Wellness Line', 'Gift Boxes'],
  'Sophisticated boutique experience in premium mall setting',
  'https://images.unsplash.com/photo-1566305977571-5666677c6e98?w=800',
  'Elite members: Complimentary delivery',
  'Private shopping appointments',
  'VIP launch events',
  ARRAY['Valet Parking', 'ATM', 'Gift Wrapping', 'Consultation'],
  ARRAY['Cash', 'Card', 'EFT', 'Crypto'],
  4.6,
  156,
  true
);

-- Create updated_at trigger for alpha_partners
CREATE TRIGGER update_alpha_partners_updated_at
  BEFORE UPDATE ON alpha_partners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for partner_products  
CREATE TRIGGER update_partner_products_updated_at
  BEFORE UPDATE ON partner_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();