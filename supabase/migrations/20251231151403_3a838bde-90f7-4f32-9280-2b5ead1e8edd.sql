-- Add missing columns per checklist requirements

-- Add onboarding_completed to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Add product_name to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS product_name character varying;