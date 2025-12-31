-- ========================================
-- ALPHA PLATFORM DATABASE SCHEMA
-- Secure Role-Based Access Control
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app_role enum for role management
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- ========================================
-- TABLE: USER_ROLES (Secure role storage)
-- ========================================
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- SECURITY DEFINER FUNCTION: has_role
-- Prevents recursive RLS issues
-- ========================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- ========================================
-- TABLE: DIARY_ENTRIES (Community Knowledge Hub)
-- ========================================
CREATE TABLE IF NOT EXISTS public.diary_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT,
  tags TEXT[],
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: PRODUCTS (Shop)
-- ========================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  image_url TEXT,
  category TEXT,
  in_stock BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: MAP_LOCATIONS
-- ========================================
CREATE TABLE IF NOT EXISTS public.map_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('store', 'event', 'partner')),
  address TEXT,
  city TEXT,
  province TEXT,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  description TEXT,
  contact_info JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: PAYMENTS
-- ========================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT DEFAULT 'payfast',
  reference TEXT UNIQUE,
  payfast_payment_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  raw_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ENABLE RLS ON NEW TABLES
-- ========================================
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS POLICIES: USER_ROLES
-- ========================================
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- RLS POLICIES: DIARY ENTRIES
-- ========================================
CREATE POLICY "Anyone can view published entries" ON public.diary_entries
  FOR SELECT USING (published = TRUE);

CREATE POLICY "Admins can manage all entries" ON public.diary_entries
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- RLS POLICIES: PRODUCTS
-- ========================================
CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- RLS POLICIES: MAP LOCATIONS
-- ========================================
CREATE POLICY "Anyone can view active locations" ON public.map_locations
  FOR SELECT USING (active = TRUE);

CREATE POLICY "Admins can manage locations" ON public.map_locations
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- RLS POLICIES: PAYMENTS
-- ========================================
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create payments" ON public.payments
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- UPDATED RLS FOR EXISTING TABLES
-- ========================================

-- Users table: allow admins to manage all users
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Subscriptions: allow admins to manage
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Orders: allow admins to manage
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Private applications: allow admins to manage
DROP POLICY IF EXISTS "Admins can manage applications" ON public.private_member_applications;
CREATE POLICY "Admins can manage all applications" ON public.private_member_applications
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_diary_published ON public.diary_entries(published);
CREATE INDEX IF NOT EXISTS idx_diary_category ON public.diary_entries(category);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_locations_type ON public.map_locations(type);
CREATE INDEX IF NOT EXISTS idx_locations_active ON public.map_locations(active);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);

-- ========================================
-- TRIGGER: Auto-assign admin role for specific email
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Assign admin role to the specified admin email
  IF NEW.email = 'alphaappealoffice@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  
  -- Assign default user role to everyone
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user role assignment
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();