import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
import { alphaPartners as staticPartners, AlphaPartner, isPartnerOpen, AlphaStatus } from '@/data/alphaPartners';
import MapDrawer from '@/components/map/MapDrawer';
import L from 'leaflet';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createMarkerIcon = (status: AlphaStatus) => {
  const colors = {
    exclusive: { primary: '#c4a052', secondary: '#8b7355' },
    featured: { primary: '#7a9a7a', secondary: '#5a7a5a' },
    verified: { primary: '#6b7280', secondary: '#4b5563' }
  };
  const { primary, secondary } = colors[status];
  return new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="url(#gradient-${status})" stroke="white" stroke-width="3"/>
        <text x="20" y="26" font-family="serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">A</text>
        <defs>
          <linearGradient id="gradient-${status}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${secondary};stop-opacity:1" />
          </linearGradient>
        </defs>
      </svg>
    `),
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

const createEventIcon = () => {
  return new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="#c4a052" stroke="white" stroke-width="3"/>
        <text x="20" y="26" font-family="sans-serif" font-size="18" fill="white" text-anchor="middle">★</text>
      </svg>
    `),
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

interface FilterState {
  status: 'all' | AlphaStatus;
  openNow: boolean;
  hasPerks: boolean;
  reservations: boolean;
  region: string;
}

interface MapEvent {
  id: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  event_date: string | null;
  event_type: string | null;
  event_url: string | null;
  active: boolean;
}

// Convert a Supabase alpha_partners row into the AlphaPartner shape used by the UI
const dbPartnerToAlphaPartner = (row: any): AlphaPartner => ({
  id: row.id,
  name: row.name,
  partnerSince: row.partner_since || '2024',
  alphaStatus: (row.alpha_status as AlphaStatus) || 'verified',
  address: row.address,
  city: row.city,
  region: row.region,
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
    status: 'all', openNow: false, hasPerks: false, reservations: false, region: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ vendorName: '', address: '', phone: '', description: '' });
  const [mapEvents, setMapEvents] = useState<MapEvent[]>([]);

  // Load partners from Supabase, fall back to static data only if DB is empty
  useEffect(() => {
    const loadPartners = async () => {
      const { data, error } = await supabase
        .from('alpha_partners')
        .select('*');
      if (data && data.length > 0) {
        const dbPartners = data
          .filter((r: any) => r.latitude && r.longitude)
          .map(dbPartnerToAlphaPartner);
        setPartners(dbPartners.length > 0 ? dbPartners : staticPartners);
      } else {
        // Only use static fallback if Supabase has no partners at all
        setPartners(staticPartners);
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

  // Load event pins
  useEffect(() => {
    const loadEvents = async () => {
      const { data } = await supabase.from('map_events').select('*').eq('active', true);
      if (data) setMapEvents(data as MapEvent[]);
    };
    loadEvents();
  }, []);

  const filteredPartners = useMemo(() => {
    return partners.filter(partner => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          partner.name.toLowerCase().includes(query) ||
          partner.city.toLowerCase().includes(query) ||
          partner.address.toLowerCase().includes(query) ||
          partner.specialties.some(s => s.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      if (filter.status !== 'all' && partner.alphaStatus !== filter.status) return false;
      if (filter.openNow && !isPartnerOpen(partner)) return false;
      if (filter.hasPerks && !partner.alphaPerks) return false;
      if (filter.reservations && !partner.openForReservations) return false;
      if (filter.region !== 'all' && partner.region !== filter.region) return false;
      return true;
    });
  }, [searchQuery, filter, partners]);

  const mapCenter: [number, number] = [-26.1, 28.0];
  const mapZoom = initialPartnerId ? 13 : 10;

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

  const regions = [...new Set(partners.map(p => p.region))];

  return (
    <div className="relative w-full h-screen bg-background">
      {/* Header */}
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

      {/* Filter Bar - hidden on mobile when partner selected */}
      <div className={`absolute top-24 md:top-28 left-4 right-4 z-[1001] space-y-3 ${selectedPartner ? 'hidden md:block' : ''}`}>
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search partners, cities, specialties..."
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
          <span className="text-sm text-muted-foreground">
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
        {filteredPartners.map(partner => (
          <Marker key={String(partner.id)} position={partner.coordinates} icon={createMarkerIcon(partner.alphaStatus)}
            eventHandlers={{ click: () => setSelectedPartner(partner) }}>
            <Popup>
              <div className="text-center">
                <h3 className="font-bold text-lg mb-1">{partner.name}</h3>
                <p className="text-sm text-gray-600">{partner.vibe}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        {mapEvents.map(ev => (
          <Marker key={`event-${ev.id}`} position={[ev.latitude, ev.longitude]} icon={createEventIcon()}>
            <Popup>
              <div className="text-center p-1">
                <h3 className="font-bold text-base mb-1">★ {ev.title}</h3>
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

      {/* Partner Sidebar (Desktop) */}
      <div className="absolute left-4 top-52 bottom-6 w-80 bg-card/95 backdrop-blur rounded-2xl p-4 overflow-y-auto z-[1000] hidden lg:block border border-border">
        <h2 className="text-lg font-display font-bold text-foreground mb-4">Partner Locations</h2>
        <div className="space-y-3">
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

      {/* Partner Detail Panel / Mobile Drawer */}
      <MapDrawer partner={selectedPartner} onClose={() => setSelectedPartner(null)} />
    </div>
  );
};

export default AlphaMap;
