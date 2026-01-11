-- Promo Codes table
CREATE TABLE public.promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    max_uses INTEGER DEFAULT 20,
    current_uses INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on promo_codes
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can read promo codes to validate them
CREATE POLICY "Anyone can view active promo codes" ON public.promo_codes
    FOR SELECT USING (active = true);

-- Only admins can manage promo codes
CREATE POLICY "Admins can manage promo codes" ON public.promo_codes
    FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Promo Code Redemptions table
CREATE TABLE public.promo_code_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    promo_code VARCHAR(50) NOT NULL,
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, promo_code)
);

-- Enable RLS on promo_code_redemptions
ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own redemptions
CREATE POLICY "Users can view own redemptions" ON public.promo_code_redemptions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own redemptions
CREATE POLICY "Users can redeem codes" ON public.promo_code_redemptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can manage all redemptions
CREATE POLICY "Admins can manage all redemptions" ON public.promo_code_redemptions
    FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Vendor Submissions table (for map submissions)
CREATE TABLE public.vendor_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    vendor_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50),
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.users(id)
);

-- Enable RLS on vendor_submissions
ALTER TABLE public.vendor_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions" ON public.vendor_submissions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create submissions
CREATE POLICY "Users can create submissions" ON public.vendor_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can manage all submissions
CREATE POLICY "Admins can manage all submissions" ON public.vendor_submissions
    FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert initial promo codes
INSERT INTO public.promo_codes (code, max_uses, active) VALUES
    ('HERBALIST2025', 20, true),
    ('GREENHEALER', 20, true),
    ('BOTANICBLISS', 20, true),
    ('PLANTALCHEMY', 20, true),
    ('NATURALCURE', 20, true);

-- Update all existing users to 'private' tier
UPDATE public.users SET subscription_tier = 'private' WHERE subscription_tier IS NULL OR subscription_tier = 'free';