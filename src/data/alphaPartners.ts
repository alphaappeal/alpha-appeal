export type AlphaStatus = 'verified' | 'featured' | 'exclusive';

export interface AlphaPartner {
  id: number;
  name: string;
  partnerSince: string;
  alphaStatus: AlphaStatus;
  address: string;
  city: string;
  region: string;
  coordinates: [number, number];
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  currentlyOpen: boolean;
  vibe: string;
  specialties: string[];
  atmosphere: string;
  images: {
    hero: string;
    gallery?: string[];
  };
  alphaPerks: {
    memberDiscount: string;
    exclusiveAccess: string;
    specialEvents: string;
  };
  amenities: string[];
  paymentOptions: string[];
  rating: {
    overall: number;
    reviews: number;
    attributes: {
      quality: number;
      service: number;
      atmosphere: number;
    };
  };
  featured: boolean;
  hasDelivery?: boolean;
  openForReservations: boolean;
  membersOnly?: boolean;
}

export const alphaPartners: AlphaPartner[] = [
  {
    id: 1,
    name: 'Canna Cafe',
    partnerSince: '2024',
    alphaStatus: 'verified',
    address: '10 Bank St, Boksburg, 1459',
    city: 'Boksburg',
    region: 'Gauteng',
    coordinates: [-26.2167, 28.2500],
    contact: {
      phone: '+27 11 894 XXXX',
      email: 'info@cannacafe.co.za',
      website: 'https://cannacafe.co.za'
    },
    hours: {
      weekdays: '09:00 - 18:00',
      saturday: '10:00 - 17:00',
      sunday: 'Closed'
    },
    currentlyOpen: true,
    vibe: 'Cafe & Lounge',
    specialties: ['Premium Flower', 'Edibles', 'Coffee Bar'],
    atmosphere: 'Relaxed cafe atmosphere with knowledgeable staff',
    images: {
      hero: 'https://images.unsplash.com/photo-1577648188599-291bb8b831c3?w=800',
      gallery: []
    },
    alphaPerks: {
      memberDiscount: '10% off all purchases',
      exclusiveAccess: 'Priority seating in lounge',
      specialEvents: 'Monthly Alpha member tastings'
    },
    amenities: ['WiFi', 'Lounge', 'Parking', 'Coffee Bar'],
    paymentOptions: ['Cash', 'Card', 'EFT'],
    rating: {
      overall: 4.7,
      reviews: 142,
      attributes: {
        quality: 4.8,
        service: 4.6,
        atmosphere: 4.9
      }
    },
    featured: false,
    openForReservations: true
  },
  {
    id: 2,
    name: 'Canna Africa',
    partnerSince: '2024',
    alphaStatus: 'featured',
    address: 'Stoneridge Centre, Greenstone Park',
    city: 'Greenstone',
    region: 'Gauteng',
    coordinates: [-26.1189, 28.1360],
    contact: {
      phone: '+27 11 XXX XXXX',
      email: 'hello@cannaafrica.co.za'
    },
    hours: {
      weekdays: '09:00 - 18:00',
      saturday: '09:00 - 18:00',
      sunday: '10:00 - 16:00'
    },
    currentlyOpen: true,
    vibe: 'Premium Dispensary',
    specialties: ['Rare Strains', 'Concentrates', 'Wellness Products'],
    atmosphere: 'Professional, boutique-style with expert consultation',
    images: {
      hero: 'https://images.unsplash.com/photo-1536098759661-0b8b2f0db4f2?w=800'
    },
    alphaPerks: {
      memberDiscount: '15% off first purchase',
      exclusiveAccess: 'Early access to new drops',
      specialEvents: 'Quarterly strain education workshops'
    },
    amenities: ['Wheelchair Access', 'Parking', 'Private Consultation', 'Security'],
    paymentOptions: ['Cash', 'Card', 'EFT'],
    rating: {
      overall: 4.5,
      reviews: 89,
      attributes: {
        quality: 4.7,
        service: 4.4,
        atmosphere: 4.5
      }
    },
    featured: true,
    hasDelivery: true,
    openForReservations: true
  },
  {
    id: 3,
    name: 'Mookush',
    partnerSince: '2023',
    alphaStatus: 'exclusive',
    address: '27 Gleneagles Rd, Greenside, Johannesburg',
    city: 'Johannesburg',
    region: 'Gauteng',
    coordinates: [-26.1628, 28.0146],
    contact: {
      phone: '+27 11 XXX XXXX',
      email: 'info@mookush.co.za'
    },
    hours: {
      weekdays: '10:00 - 20:00',
      saturday: '10:00 - 21:00',
      sunday: '11:00 - 18:00'
    },
    currentlyOpen: true,
    vibe: 'Lifestyle Lounge',
    specialties: ['Curated Selection', 'Premium Accessories', 'Events Space'],
    atmosphere: 'Upscale lounge experience for cannabis connoisseurs',
    images: {
      hero: 'https://images.unsplash.com/photo-1584553421349-3557997c58c3?w=800'
    },
    alphaPerks: {
      memberDiscount: '20% off for Elite members',
      exclusiveAccess: 'Private lounge access',
      specialEvents: 'Invitation to exclusive Alpha events'
    },
    amenities: ['VIP Lounge', 'WiFi', 'Parking', 'Event Space', 'Music'],
    paymentOptions: ['Cash', 'Card', 'EFT', 'Crypto'],
    rating: {
      overall: 4.8,
      reviews: 203,
      attributes: {
        quality: 4.9,
        service: 4.7,
        atmosphere: 5.0
      }
    },
    featured: true,
    hasDelivery: true,
    openForReservations: true,
    membersOnly: false
  },
  {
    id: 4,
    name: 'Jays Blunts',
    partnerSince: '2024',
    alphaStatus: 'verified',
    address: 'Skyline Smoke Shop, Johannesburg',
    city: 'Johannesburg',
    region: 'Gauteng',
    coordinates: [-26.1850, 28.0294],
    contact: {
      phone: '+27 11 XXX XXXX'
    },
    hours: {
      weekdays: '09:00 - 19:00',
      saturday: '10:00 - 19:00',
      sunday: 'Closed'
    },
    currentlyOpen: true,
    vibe: 'Accessories & Essentials',
    specialties: ['Premium Papers', 'Grinders', 'Storage Solutions'],
    atmosphere: 'No-nonsense smoke shop with quality products',
    images: {
      hero: 'https://images.unsplash.com/photo-1601628828688-632f38a5a7d0?w=800'
    },
    alphaPerks: {
      memberDiscount: '10% off accessories',
      exclusiveAccess: 'First access to limited drops',
      specialEvents: 'Product demos for members'
    },
    amenities: ['Parking', 'Quick Service'],
    paymentOptions: ['Cash', 'Card'],
    rating: {
      overall: 4.3,
      reviews: 67,
      attributes: {
        quality: 4.5,
        service: 4.2,
        atmosphere: 4.1
      }
    },
    featured: false,
    openForReservations: false
  },
  {
    id: 5,
    name: 'El Blanco',
    partnerSince: '2024',
    alphaStatus: 'featured',
    address: 'The Gantry Lifestyle Center, Fourways',
    city: 'Fourways',
    region: 'Gauteng',
    coordinates: [-26.0262, 28.0047],
    contact: {
      phone: '+27 11 XXX XXXX',
      email: 'info@elblanco.co.za'
    },
    hours: {
      weekdays: '10:00 - 19:00',
      saturday: '10:00 - 20:00',
      sunday: '10:00 - 17:00'
    },
    currentlyOpen: true,
    vibe: 'Upscale Boutique',
    specialties: ['Designer Strains', 'Wellness Line', 'Gift Boxes'],
    atmosphere: 'Sophisticated boutique experience in premium mall setting',
    images: {
      hero: 'https://images.unsplash.com/photo-1566305977571-5666677c6e98?w=800'
    },
    alphaPerks: {
      memberDiscount: 'Elite members: Complimentary delivery',
      exclusiveAccess: 'Private shopping appointments',
      specialEvents: 'VIP launch events'
    },
    amenities: ['Valet Parking', 'ATM', 'Gift Wrapping', 'Consultation'],
    paymentOptions: ['Cash', 'Card', 'EFT', 'Crypto'],
    rating: {
      overall: 4.6,
      reviews: 156,
      attributes: {
        quality: 4.7,
        service: 4.6,
        atmosphere: 4.8
      }
    },
    featured: true,
    hasDelivery: true,
    openForReservations: true
  },
  {
    id: 6,
    name: 'Bud Tender',
    partnerSince: '2024',
    alphaStatus: 'verified',
    address: 'Lyndhurst, Johannesburg, 2192',
    city: 'Johannesburg',
    region: 'Gauteng',
    coordinates: [-26.1074, 28.1184],
    contact: {
      phone: '+27 11 XXX XXXX'
    },
    hours: {
      weekdays: '09:00 - 18:00',
      saturday: '10:00 - 18:00',
      sunday: 'Closed'
    },
    currentlyOpen: true,
    vibe: 'Neighborhood Spot',
    specialties: ['Local Favorites', 'Flower', 'Edibles'],
    atmosphere: 'Friendly neighborhood spot with consistent quality',
    images: {
      hero: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800'
    },
    alphaPerks: {
      memberDiscount: 'First-time: 15% off',
      exclusiveAccess: 'Member rewards program',
      specialEvents: 'Community events'
    },
    amenities: ['Parking', 'Easy Access'],
    paymentOptions: ['Cash', 'Card'],
    rating: {
      overall: 4.4,
      reviews: 94,
      attributes: {
        quality: 4.5,
        service: 4.3,
        atmosphere: 4.4
      }
    },
    featured: false,
    openForReservations: true
  }
];

// Helper to check if a partner is currently open based on current time
export const isPartnerOpen = (partner: AlphaPartner): boolean => {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;

  let todayHours: string;
  if (day === 0) {
    todayHours = partner.hours.sunday;
  } else if (day === 6) {
    todayHours = partner.hours.saturday;
  } else {
    todayHours = partner.hours.weekdays;
  }

  if (todayHours.toLowerCase() === 'closed') {
    return false;
  }

  const timeMatch = todayHours.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
  if (!timeMatch) return false;

  const openTime = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
  const closeTime = parseInt(timeMatch[3]) * 60 + parseInt(timeMatch[4]);

  return currentTime >= openTime && currentTime <= closeTime;
};
