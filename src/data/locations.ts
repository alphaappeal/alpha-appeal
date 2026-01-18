export interface VendorLocation {
  id: number;
  name: string;
  shortName: string;
  address: string;
  coordinates: [number, number];
  phone: string;
  hours: string;
  type: 'flagship' | 'boutique' | 'store';
  products: string[];
  description: string;
}

export const vendorLocations: VendorLocation[] = [
  {
    id: 1,
    name: 'Alpha Appeal Flagship Store',
    shortName: 'Sandton',
    address: 'Sandton City, Johannesburg',
    coordinates: [-26.1076, 28.0473],
    phone: '+27 11 123 4567',
    hours: 'Mon-Sat: 9AM-8PM, Sun: 10AM-6PM',
    type: 'flagship',
    products: ['Fashion', 'Accessories', 'Lifestyle Kits', 'Music'],
    description: 'Our premium flagship experience in the heart of Sandton'
  },
  {
    id: 2,
    name: 'Alpha Appeal V&A Waterfront',
    shortName: 'V&A Waterfront',
    address: 'V&A Waterfront, Cape Town',
    coordinates: [-33.9033, 18.4194],
    phone: '+27 21 456 7890',
    hours: 'Mon-Sun: 10AM-9PM',
    type: 'boutique',
    products: ['Fashion', 'Accessories', 'Curated Boxes'],
    description: 'Coastal vibes meet elite lifestyle'
  },
  {
    id: 3,
    name: 'Alpha Appeal Umhlanga',
    shortName: 'Umhlanga',
    address: 'Gateway Theatre of Shopping, Durban',
    coordinates: [-29.7289, 31.0655],
    phone: '+27 31 789 0123',
    hours: 'Mon-Sat: 9AM-7PM, Sun: 9AM-5PM',
    type: 'boutique',
    products: ['Fashion', 'Wellness', 'Music'],
    description: 'East coast elegance and culture'
  },
  {
    id: 4,
    name: 'Alpha Appeal Menlyn',
    shortName: 'Menlyn',
    address: 'Menlyn Park, Pretoria',
    coordinates: [-25.7847, 28.2772],
    phone: '+27 12 345 6789',
    hours: 'Mon-Fri: 9AM-8PM, Sat-Sun: 9AM-6PM',
    type: 'store',
    products: ['Fashion', 'Accessories'],
    description: 'Capital city sophistication'
  },
  {
    id: 5,
    name: 'Alpha Appeal Rosebank',
    shortName: 'Rosebank',
    address: 'The Zone @ Rosebank, Johannesburg',
    coordinates: [-26.1466, 28.0423],
    phone: '+27 11 987 6543',
    hours: 'Mon-Sun: 9AM-8PM',
    type: 'store',
    products: ['Fashion', 'Lifestyle', 'Events'],
    description: 'Urban lifestyle hub'
  }
];
