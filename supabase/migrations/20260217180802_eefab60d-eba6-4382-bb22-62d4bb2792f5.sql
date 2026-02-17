
-- Update existing partner logos
UPDATE public.alpha_partners SET 
  hero_image = '/images/partners/canna-cafe-logo.png',
  logo_url = '/images/partners/canna-cafe-logo.png'
WHERE id = '919f4727-f09f-41ef-a855-fe989c13303e';

UPDATE public.alpha_partners SET 
  hero_image = '/images/partners/el-blanco-logo.png',
  logo_url = '/images/partners/el-blanco-logo.png'
WHERE id = '3a98ac8e-5849-4de7-a17c-4ba7eeea5d39';

UPDATE public.alpha_partners SET 
  hero_image = '/images/partners/mookush-logo.png',
  logo_url = '/images/partners/mookush-logo.png'
WHERE id = 'd62056d1-5698-4af1-8026-ca41cd180d7d';

-- Insert missing partners
INSERT INTO public.alpha_partners (name, alpha_status, address, city, region, latitude, longitude, phone, vibe, specialties, atmosphere, hero_image, logo_url, member_discount, exclusive_access, special_events, amenities, payment_methods, rating_overall, review_count, featured, has_delivery, open_for_reservations)
VALUES
(
  'Jays Blunts', 'verified', 'Skyline Smoke Shop, Johannesburg', 'Johannesburg', 'Gauteng',
  -26.1850, 28.0294, '+27 11 XXX XXXX', 'Accessories & Essentials',
  ARRAY['Premium Papers', 'Grinders', 'Storage Solutions'],
  'No-nonsense smoke shop with quality products',
  '/images/partners/jays-blunts-logo.png', '/images/partners/jays-blunts-logo.png',
  '10% off accessories', 'First access to limited drops', 'Product demos for members',
  ARRAY['Parking', 'Quick Service'], ARRAY['Cash', 'Card'],
  4.3, 67, false, false, false
),
(
  'Canna Africa', 'featured', 'Stoneridge Centre, Greenstone Park', 'Greenstone', 'Gauteng',
  -26.1189, 28.1360, '+27 11 XXX XXXX', 'Premium Dispensary',
  ARRAY['Rare Strains', 'Concentrates', 'Wellness Products'],
  'Professional, boutique-style with expert consultation',
  '/images/partners/canna-africa-logo.png', '/images/partners/canna-africa-logo.png',
  '15% off first purchase', 'Early access to new drops', 'Quarterly strain education workshops',
  ARRAY['Wheelchair Access', 'Parking', 'Private Consultation', 'Security'], ARRAY['Cash', 'Card', 'EFT'],
  4.5, 89, true, true, true
),
(
  'Bud Tender', 'verified', 'Lyndhurst, Johannesburg, 2192', 'Johannesburg', 'Gauteng',
  -26.1074, 28.1184, '+27 11 XXX XXXX', 'Neighborhood Spot',
  ARRAY['Local Favorites', 'Flower', 'Edibles'],
  'Friendly neighborhood spot with consistent quality',
  '/images/partners/bud-tender-logo.png', '/images/partners/bud-tender-logo.png',
  'First-time: 15% off', 'Member rewards program', 'Community events',
  ARRAY['Parking', 'Easy Access'], ARRAY['Cash', 'Card'],
  4.4, 94, false, false, true
);
