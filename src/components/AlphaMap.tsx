import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { 
  MapPin, Phone, Clock, Navigation, X, Send, Loader2, 
  Star, Gift, Shield, Filter, Search, Calendar, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlphaPartner, isPartnerOpen, AlphaStatus } from '@/data/alphaPartners';
import MapDrawer from '@/components/map/MapDrawer';
import { createPartnerMarker, createIconMarker } from '@/lib/mapIcons';
import L from 'leaflet';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface FilterState {
  status: 'all' | AlphaStatus;
  openNow: boolean;
  hasPerks: boolean;
  reservations: boolean;
  country: string;
  region: string;
  category: string;
  showEvents: boolean;
}

interface MapLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  description: string | null;
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
  category_id: string | null;
}

interface MapEventWithType {
  id: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  event_date: string | null;
  event_type: string | null;
  event_url: string | null;
  active: boolean;
  start_date: string | null;
  end_date: string | null;
  event_type_name: string | null;
  event_icon: string | null;
  event_color: string | null;
  image_url: string | null;
}

interface CategoryOption {
  id: string;
  name: string;
  icon: string;
  color: string | null;
}

// MapController: handles flyTo when selectedPartner changes
const MapController = ({ partner }: { partner: AlphaPartner | null }) => {
  const map = useMap();
  useEffect(() => {
    if (partner) {
      map.flyTo(partner.coordinates, 14, { duration: 1 });
    }
  }, [partner, map]);
  return null;
};

// BoundsController: fits map to all partner locations after load
const BoundsController = ({ partners, partnersLoaded, skipFit }: { partners: AlphaPartner[]; partnersLoaded: boolean; skipFit: boolean }) => {
  const map = useMap();
  const [hasFit, setHasFit] = useState(false);

  useEffect(() => {
    if (!partnersLoaded || hasFit || skipFit) return;
    if (partners.length > 0) {
      const bounds = L.latLngBounds(partners.map(p => p.coordinates));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    } else {
      map.setView([20, 0], 2);
    }
    setHasFit(true);
  }, [partnersLoaded, partners, map, hasFit, skipFit]);

  return null;
};

// Convert a Supabase alpha_partners row into the AlphaPartner shape used by the UI
const dbPartnerToAlphaPartner = (row: any): AlphaPartner => ({
  id: row.id,
  name: row.name,
  partnerSince: row.partner_since || '2024',
  alphaStatus: (row.alpha_status as AlphaStatus) || 'verified',
  address: row.address,
  city: row.city,
  region: row.region,
  country: row.country || 'South Africa',
  coordinates: [Number(row.latitude), Number(row.longitude)] as [number, number],
  contact: {
    phone: row.phone || undefined,
    email: row.email || undefined,
    website: row.website || undefined,
  },
  hours: {
    weekdays: row.hours_weekdays || '09:00 - 18:00',
    saturday: row.hours_saturday || '10:00 - 17:00',
    sunday: row.hours_sunday || 'Closed',
  },
  currentlyOpen: row.currently_open ?? true,
  vibe: row.vibe || '',
  specialties: row.specialties || [],
  atmosphere: row.atmosphere || '',
  images: { hero: row.hero_image || row.logo_url || '/placeholder.svg' },
  logoUrl: row.logo_url || undefined,
  alphaPerks: {
    memberDiscount: row.member_discount || '',
    exclusiveAccess: row.exclusive_access || '',
    specialEvents: row.special_events || '',
  },
  amenities: row.amenities || [],
  paymentOptions: row.payment_methods || [],
  rating: {
    overall: Number(row.rating_overall) || 0,
    reviews: row.review_count || 0,
    attributes: { quality: 0, service: 0, atmosphere: 0 },
  },
  featured: row.featured ?? false,
  hasDelivery: row.has_delivery ?? false,
  openForReservations: row.open_for_reservations ?? true,
});

const AlphaMap = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const navigationState = location.state as { selectedPartnerId?: number | string } | null;
  const initialPartnerId = navigationState?.selectedPartnerId;

  const [partners, setPartners] = useState<AlphaPartner[]>([]);
  const [partnersLoaded, setPartnersLoaded] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<AlphaPartner | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterState>({
    status: 'all', openNow: false, hasPerks: false, reservations: false,
    country: 'all', region: 'all', category: 'all', showEvents: true,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ vendorName: '', address: '', phone: '', description: '' });
  const [mapEvents, setMapEvents] = useState<MapEventWithType[]>([]);
  const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // Load partners from Supabase
  useEffect(() => {
    const loadPartners = async () => {
      const { data } = await supabase.from('alpha_partners').select('*');
      if (data && data.length > 0) {
        const dbPartners = data
          .filter((r: any) => r.latitude != null && r.longitude != null)
          .map(dbPartnerToAlphaPartner);
        setPartners(dbPartners);
      } else {
        setPartners([]);
      }
      setPartnersLoaded(true);
    };
    loadPartners();
  }, []);

  // Set initial selected partner after partners load
  useEffect(() => {
    if (initialPartnerId && partners.length > 0) {
      const found = partners.find(p => String(p.id) === String(initialPartnerId));
      if (found) setSelectedPartner(found);
    }
  }, [initialPartnerId, partners]);

  // Load categories for filter dropdown
  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data as CategoryOption[]);
    };
    loadCategories();
  }, []);

  // Load map locations from view
  useEffect(() => {
    const loadLocations = async () => {
      const { data } = await supabase
        .from('map_locations_with_categories')
        .select('*')
        .eq('active', true);
      if (data) {
        setMapLocations(
          (data as any[]).filter(r => r.latitude != null && r.longitude != null) as MapLocation[]
        );
      }
    };
    loadLocations();
  }, []);

  // Load event pins from pre-filtered view (active + future events) + realtime
  useEffect(() => {
    const loadEvents = async () => {
      const { data } = await supabase
        .from('active_upcoming_map_events')
        .select('*');
      if (data) {
        const filtered = (data as any[]).filter(ev => ev.latitude != null && ev.longitude != null);
        setMapEvents(filtered as MapEventWithType[]);
      }
    };
    loadEvents();

    // Realtime subscription so admin-created events appear instantly
    const channel = supabase
      .channel('map-events-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'map_events' }, () => {
        // Re-fetch from the view to get joined type data and filtering
        loadEvents();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredPartners = useMemo(() => {
    return partners.filter(partner => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          partner.name.toLowerCase().includes(query) ||
          partner.city.toLowerCase().includes(query) ||
          partner.address.toLowerCase().includes(query) ||
          partner.country.toLowerCase().includes(query) ||
          (partner.region && partner.region.toLowerCase().includes(query)) ||
          partner.specialties.some(s => s.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      if (filter.status !== 'all' && partner.alphaStatus !== filter.status) return false;
      if (filter.openNow && !isPartnerOpen(partner)) return false;
      if (filter.hasPerks && !partner.alphaPerks) return false;
      if (filter.reservations && !partner.openForReservations) return false;
      if (filter.country !== 'all' && partner.country !== filter.country) return false;
      if (filter.region !== 'all' && (partner.region || '') !== filter.region) return false;
      return true;
    });
  }, [searchQuery, filter, partners]);

  // Filter map locations by category
  const filteredLocations = useMemo(() => {
    if (filter.category === 'all') return mapLocations;
    return mapLocations.filter(loc => loc.category_id === filter.category);
  }, [mapLocations, filter.category]);

  const mapCenter: [number, number] = [-26.1, 28.0];
  const mapZoom = 10;

  const handleSubmitVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendorName || !formData.address) {
      toast({ title: "Required fields", description: "Please fill in vendor name and address", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.from('store_suggestions').insert({
        user_id: session?.user?.id || null,
        store_name: formData.vendorName,
        address: formData.address,
        phone: formData.phone,
        description: formData.description,
        status: 'pending'
      });
      if (error) throw error;
      toast({ title: "Submission received!", description: "We'll review your suggestion and get back to you." });
      setFormData({ vendorName: '', address: '', phone: '', description: '' });
      setShowSubmitForm(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to submit.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Derive dynamic filter options from partner data
  const countries = [...new Set(partners.map(p => p.country))].sort();
  const regions = [...new Set(
    partners
      .filter(p => filter.country === 'all' || p.country === filter.country)
      .map(p => p.region)
      .filter(Boolean)
  )].sort();

  // Reset region filter when country changes and selected region is no longer valid
  useEffect(() => {
    if (filter.region !== 'all' && !regions.includes(filter.region)) {
      setFilter(prev => ({ ...prev, region: 'all' }));
    }
  }, [filter.country, regions, filter.region]);

  const formatLocation = (partner: AlphaPartner) => {
    if (partner.country === 'South Africa') {
      return `${partner.city}, ${partner.region}`;
    }
    return `${partner.city}, ${partner.country}`;
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar — visible on lg+ */}
      <div className="hidden lg:flex flex-col w-[380px] flex-shrink-0 border-r border-border bg-card/95 overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-display font-bold text-foreground mb-3">Partner Locations</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search partners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {filteredPartners.length} location{filteredPartners.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredPartners.length === 0 && partnersLoaded && (
            <div className="text-center py-12">
              <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No partner locations found</p>
              <p className="text-xs text-muted-foreground mt-1">Partners added in admin will appear here automatically</p>
            </div>
          )}
          {filteredPartners.map(partner => {
            const isOpen = isPartnerOpen(partner);
            return (
              <button
                key={String(partner.id)}
                onClick={() => setSelectedPartner(partner)}
                className={`w-full text-left p-4 rounded-xl transition-all border ${
                  selectedPartner?.id === partner.id ? 'bg-secondary/20 border-secondary' : 'bg-muted/30 border-border hover:border-secondary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img src={partner.logoUrl || partner.images.hero} alt={partner.name} className="w-16 h-16 object-contain rounded-lg bg-muted p-1" />
                    {partner.alphaStatus === 'exclusive' && <span className="absolute -top-1 -right-1 text-xs">⭐</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm truncate">{partner.name}</h3>
                    <p className="text-xs text-secondary">{partner.vibe}</p>
                    <p className="text-xs text-muted-foreground">{formatLocation(partner)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-3 h-3 text-secondary fill-secondary" />
                      <span className="text-xs text-foreground">{partner.rating.overall}</span>
                      <span className="text-xs text-muted-foreground">({partner.rating.reviews})</span>
                    </div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {isOpen ? (
                        <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">Open</span>
                      ) : (
                        <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">Closed</span>
                      )}
                      {partner.featured && (
                        <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">Featured</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 relative">
        {/* Header overlay */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-background via-background/90 to-transparent p-4 md:p-6 z-[1001] pointer-events-none">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Alpha Partner Network
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            Curated locations for the discerning cannabis enthusiast
          </p>
          <p className="text-secondary text-xs md:text-sm mt-1">
            Members receive exclusive perks at all partner locations
          </p>
        </div>

        {/* Filter Bar */}
        <div className={`absolute top-24 md:top-28 left-4 right-4 z-[1001] space-y-3 ${selectedPartner ? 'hidden md:block' : ''}`}>
          {/* Mobile search */}
          <div className="relative max-w-md lg:hidden">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search partners, cities, countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card/95 backdrop-blur text-foreground rounded-xl border-border focus:border-secondary"
            />
          </div>

          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>

          <div className={`flex flex-wrap gap-2 ${showFilters ? 'block' : 'hidden md:flex'}`}>
            <div className="flex gap-1 flex-wrap">
              <Button variant={filter.status === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter({...filter, status: 'all'})}
                className={filter.status === 'all' ? 'bg-secondary text-secondary-foreground' : ''}>All Partners</Button>
              <Button variant={filter.status === 'exclusive' ? 'default' : 'outline'} size="sm" onClick={() => setFilter({...filter, status: 'exclusive'})}
                className={filter.status === 'exclusive' ? 'bg-secondary text-secondary-foreground' : ''}>⭐ Exclusive</Button>
              <Button variant={filter.status === 'featured' ? 'default' : 'outline'} size="sm" onClick={() => setFilter({...filter, status: 'featured'})}
                className={filter.status === 'featured' ? 'bg-secondary text-secondary-foreground' : ''}>Featured</Button>
            </div>

            <Button variant={filter.openNow ? 'default' : 'outline'} size="sm" onClick={() => setFilter({...filter, openNow: !filter.openNow})}
              className={filter.openNow ? 'bg-secondary text-secondary-foreground' : ''}>
              <span className={filter.openNow ? '' : 'text-green-500'}>●</span><span className="ml-1">Open Now</span>
            </Button>

            <Button variant={filter.hasPerks ? 'default' : 'outline'} size="sm" onClick={() => setFilter({...filter, hasPerks: !filter.hasPerks})}
              className={filter.hasPerks ? 'bg-secondary text-secondary-foreground' : ''}>🎁 Member Perks</Button>

            <Button variant={filter.reservations ? 'default' : 'outline'} size="sm" onClick={() => setFilter({...filter, reservations: !filter.reservations})}
              className={filter.reservations ? 'bg-secondary text-secondary-foreground' : ''}>Reservations</Button>

            {/* Events toggle */}
            <Button variant={filter.showEvents ? 'default' : 'outline'} size="sm" onClick={() => setFilter({...filter, showEvents: !filter.showEvents})}
              className={filter.showEvents ? 'bg-secondary text-secondary-foreground' : ''}>
              <Calendar className="w-3 h-3 mr-1" /> Events
            </Button>

            {/* Category filter */}
            {categories.length > 0 && (
              <div className={`relative inline-flex items-center rounded-md border text-sm font-medium h-9 ${
                filter.category !== 'all'
                  ? 'bg-secondary text-secondary-foreground border-secondary'
                  : 'bg-background border-input hover:bg-accent hover:text-accent-foreground'
              }`}>
                <select value={filter.category} onChange={(e) => setFilter({...filter, category: e.target.value})}
                  className="appearance-none bg-transparent text-inherit px-3 py-1.5 pr-7 text-sm font-medium cursor-pointer focus:outline-none">
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
              </div>
            )}

            {/* Country filter */}
            {countries.length > 1 && (
              <div className={`relative inline-flex items-center rounded-md border text-sm font-medium h-9 ${
                filter.country !== 'all' 
                  ? 'bg-secondary text-secondary-foreground border-secondary' 
                  : 'bg-background border-input hover:bg-accent hover:text-accent-foreground'
              }`}>
                <select value={filter.country} onChange={(e) => setFilter({...filter, country: e.target.value, region: 'all'})}
                  className="appearance-none bg-transparent text-inherit px-3 py-1.5 pr-7 text-sm font-medium cursor-pointer focus:outline-none">
                  <option value="all">All Countries</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
              </div>
            )}

            {/* Region filter */}
            <div className={`relative inline-flex items-center rounded-md border text-sm font-medium h-9 ${
              filter.region !== 'all' 
                ? 'bg-secondary text-secondary-foreground border-secondary' 
                : 'bg-background border-input hover:bg-accent hover:text-accent-foreground'
            }`}>
              <select value={filter.region} onChange={(e) => setFilter({...filter, region: e.target.value})}
                className="appearance-none bg-transparent text-inherit px-3 py-1.5 pr-7 text-sm font-medium cursor-pointer focus:outline-none">
                <option value="all">All Regions</option>
                {regions.map(region => <option key={region} value={region}>{region}</option>)}
              </select>
              <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground lg:hidden">
              {filteredPartners.length} partner location{filteredPartners.length !== 1 ? 's' : ''} found
            </span>
            <Button variant="ghost" size="sm" onClick={() => setShowSubmitForm(!showSubmitForm)} className="text-secondary hover:text-secondary/80">
              <Send className="w-4 h-4 mr-2" /> Suggest a Store
            </Button>
          </div>
        </div>

        {/* Map */}
        <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }} className="z-0" scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <MapController partner={selectedPartner} />
          <BoundsController partners={partners} partnersLoaded={partnersLoaded} skipFit={!!initialPartnerId} />

          {/* Partner store markers */}
          {filteredPartners.map(partner => (
            <Marker key={String(partner.id)} position={partner.coordinates} icon={createPartnerMarker(partner.alphaStatus)}
              eventHandlers={{ click: () => setSelectedPartner(partner) }}>
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold text-lg mb-1">{partner.name}</h3>
                  <p className="text-sm text-gray-600">{partner.vibe}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Map location markers (category-based) */}
          {filteredLocations.map(loc => (
            <Marker
              key={`loc-${loc.id}`}
              position={[Number(loc.latitude), Number(loc.longitude)]}
              icon={createIconMarker(
                loc.category_icon || 'map-pin',
                loc.category_color || '#6b7280'
              )}
            >
              <Popup>
                <div className="text-center p-1">
                  <h3 className="font-bold text-base mb-1">{loc.name}</h3>
                  {loc.category_name && (
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full mb-1" style={{ backgroundColor: loc.category_color || '#6b7280', color: 'white' }}>
                      {loc.category_name}
                    </span>
                  )}
                  {loc.description && <p className="text-sm text-gray-600 mb-1">{loc.description}</p>}
                  {loc.address && <p className="text-xs text-gray-500">{loc.address}{loc.city ? `, ${loc.city}` : ''}</p>}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Event markers (event-type-based) */}
          {filter.showEvents && mapEvents.map(ev => (
            <Marker
              key={`event-${ev.id}`}
              position={[Number(ev.latitude), Number(ev.longitude)]}
              icon={createIconMarker(
                ev.event_icon || 'calendar',
                ev.event_color || '#c4a052',
                { glow: true, size: 44 }
              )}
            >
              <Popup>
                <div className="text-center p-1">
                  <h3 className="font-bold text-base mb-1">{ev.title}</h3>
                  {ev.event_type_name && (
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full mb-1" style={{ backgroundColor: ev.event_color || '#c4a052', color: 'white' }}>
                      {ev.event_type_name}
                    </span>
                  )}
                  {ev.description && <p className="text-sm text-gray-600 mb-1">{ev.description}</p>}
                  {ev.event_date && <p className="text-xs text-gray-500">{new Date(ev.event_date).toLocaleDateString()}</p>}
                  {ev.event_url && <a href={ev.event_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 underline">View Event</a>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Vendor Submission Form */}
        {showSubmitForm && (
          <div className="absolute top-48 left-4 z-[1002] w-80 bg-card/95 backdrop-blur border border-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-lg font-semibold text-foreground">Suggest a Store</h3>
              <button onClick={() => setShowSubmitForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Your suggestion will be reviewed by our team before appearing on the map.</p>
            <form onSubmit={handleSubmitVendor} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vendorName">Store Name *</Label>
                <Input id="vendorName" value={formData.vendorName} onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })} placeholder="Store name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Full address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+27..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Why should we partner?</Label>
                <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Tell us about them..." />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowSubmitForm(false)} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={submitting} className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Partner Detail Panel / Mobile Drawer */}
        <MapDrawer partner={selectedPartner} onClose={() => setSelectedPartner(null)} />
      </div>
    </div>
  );
};

export default AlphaMap;
