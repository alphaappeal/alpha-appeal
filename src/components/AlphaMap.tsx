import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Phone, Clock, Navigation, X, ShoppingBag, Plus, Minus, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    mapboxgl: any;
  }
}

interface Vendor {
  id: number;
  name: string;
  address: string;
  coordinates: [number, number];
  phone: string;
  hours: string;
  type: string;
  products: string[];
  description: string;
}

const AlphaMap = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vendorName: '',
    address: '',
    phone: '',
    description: ''
  });
  const { toast } = useToast();

  // Mapbox Token from secrets
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWxwaGFhcHBlYWwiLCJhIjoiY200eTNnZmMxMDU5NjJrcHRxa3M5YnpyNyJ9.hAdpRlAbmZOmQyh0yNbZxw';
  
  // Alpha Appeal Vendor Locations in South Africa
  const vendorLocations: Vendor[] = [
    {
      id: 1,
      name: 'Alpha Appeal Flagship Store',
      address: 'Sandton City, Johannesburg',
      coordinates: [28.0473, -26.1076],
      phone: '+27 11 123 4567',
      hours: 'Mon-Sat: 9AM-8PM, Sun: 10AM-6PM',
      type: 'flagship',
      products: ['Fashion', 'Accessories', 'Lifestyle Kits', 'Music'],
      description: 'Our premium flagship experience in the heart of Sandton'
    },
    {
      id: 2,
      name: 'Alpha Appeal V&A Waterfront',
      address: 'V&A Waterfront, Cape Town',
      coordinates: [18.4194, -33.9033],
      phone: '+27 21 456 7890',
      hours: 'Mon-Sun: 10AM-9PM',
      type: 'boutique',
      products: ['Fashion', 'Accessories', 'Curated Boxes'],
      description: 'Coastal vibes meet elite lifestyle'
    },
    {
      id: 3,
      name: 'Alpha Appeal Umhlanga',
      address: 'Gateway Theatre of Shopping, Durban',
      coordinates: [31.0655, -29.7289],
      phone: '+27 31 789 0123',
      hours: 'Mon-Sat: 9AM-7PM, Sun: 9AM-5PM',
      type: 'boutique',
      products: ['Fashion', 'Wellness', 'Music'],
      description: 'East coast elegance and culture'
    },
    {
      id: 4,
      name: 'Alpha Appeal Menlyn',
      address: 'Menlyn Park, Pretoria',
      coordinates: [28.2772, -25.7847],
      phone: '+27 12 345 6789',
      hours: 'Mon-Fri: 9AM-8PM, Sat-Sun: 9AM-6PM',
      type: 'store',
      products: ['Fashion', 'Accessories'],
      description: 'Capital city sophistication'
    },
    {
      id: 5,
      name: 'Alpha Appeal Rosebank',
      address: 'The Zone @ Rosebank, Johannesburg',
      coordinates: [28.0423, -26.1466],
      phone: '+27 11 987 6543',
      hours: 'Mon-Sun: 9AM-8PM',
      type: 'store',
      products: ['Fashion', 'Lifestyle', 'Events'],
      description: 'Urban lifestyle hub'
    }
  ];

  useEffect(() => {
    // Load Mapbox GL JS
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
    script.async = true;
    document.head.appendChild(script);

    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    script.onload = () => {
      if (!mapContainerRef.current || mapRef.current) return;

      const mapboxgl = window.mapboxgl;
      mapboxgl.accessToken = MAPBOX_TOKEN;

      // Initialize map
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [28.0473, -26.2041],
        zoom: 5.5,
        pitch: 45,
        bearing: 0
      });

      mapRef.current = map;

      // Double-click to expand/shrink
      map.on('dblclick', (e: any) => {
        e.preventDefault();
        setIsExpanded(prev => !prev);
      });

      // Add geolocate control
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true
      });
      map.addControl(geolocate, 'top-right');

      map.on('load', () => {
        setMapLoaded(true);

        // Add markers for each vendor
        vendorLocations.forEach(vendor => {
          // Create custom marker element with gold/purple gradient
          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.innerHTML = `
            <div style="
              background: linear-gradient(135deg, hsl(30 26% 44%) 0%, hsl(103 22% 56%) 100%);
              width: 40px;
              height: 40px;
              border-radius: 50%;
              border: 3px solid hsl(0 0% 95%);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
              transition: transform 0.2s;
            " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
              <span style="color: white; font-weight: bold; font-family: 'Playfair Display', serif; font-size: 16px;">A</span>
            </div>
          `;

          // Add marker to map
          new mapboxgl.Marker(el)
            .setLngLat([vendor.coordinates[0], vendor.coordinates[1]])
            .addTo(map);

          // Click handler
          el.addEventListener('click', () => {
            setSelectedVendor(vendor);
            map.flyTo({
              center: [vendor.coordinates[0], vendor.coordinates[1]],
              zoom: 13,
              duration: 2000
            });
          });
        });

        // Try to get user location
        geolocate.trigger();
      });

      // Cleanup
      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    };
  }, []);

  const getDirections = (vendor: Vendor) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${vendor.coordinates[1]},${vendor.coordinates[0]}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${vendor.coordinates[1]},${vendor.coordinates[0]}`;
      window.open(url, '_blank');
    }
  };

  const callStore = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleSubmitVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendorName || !formData.address) {
      toast({
        title: "Required fields",
        description: "Please fill in vendor name and address",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.from('vendor_submissions').insert({
        user_id: session?.user?.id || null,
        vendor_name: formData.vendorName,
        address: formData.address,
        phone: formData.phone,
        description: formData.description
      });

      if (error) throw error;

      toast({
        title: "Submission received!",
        description: "We'll review your vendor suggestion and get back to you."
      });

      setFormData({ vendorName: '', address: '', phone: '', description: '' });
      setShowSubmitForm(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`relative w-full bg-background transition-all duration-500 ${isExpanded ? 'fixed inset-0 z-50' : 'h-[80vh]'}`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-background to-transparent p-6 z-10">
        <h1 className="text-3xl font-display font-bold text-gradient-gold">
          Alpha Appeal Locations
        </h1>
        <p className="text-muted-foreground mt-2">Find your nearest Alpha experience • Double-click to expand</p>
      </div>

      {/* Custom Zoom Controls */}
      <div className="absolute top-24 right-6 z-20 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-card/90 backdrop-blur border border-border rounded-lg flex items-center justify-center text-foreground hover:bg-card transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-card/90 backdrop-blur border border-border rounded-lg flex items-center justify-center text-foreground hover:bg-card transition-colors"
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>

      {/* Submit Vendor Button */}
      <div className="absolute top-24 left-6 z-20">
        <Button
          onClick={() => setShowSubmitForm(!showSubmitForm)}
          variant="sage"
          className="flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Suggest a Store
        </Button>
      </div>

      {/* Vendor Submission Form */}
      {showSubmitForm && (
        <div className="absolute top-36 left-6 z-20 w-80 bg-card/95 backdrop-blur border border-secondary/30 rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Suggest a Vendor</h3>
          <form onSubmit={handleSubmitVendor} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vendorName">Vendor Name *</Label>
              <Input
                id="vendorName"
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                placeholder="Store name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+27..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Why should we partner?"
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="glass" onClick={() => setShowSubmitForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="sage" disabled={submitting} className="flex-1">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Vendor List Sidebar */}
      <div className="absolute left-6 top-44 bottom-6 w-80 bg-card/95 backdrop-blur rounded-2xl p-6 overflow-y-auto z-10 hidden lg:block border border-secondary/20">
        <h2 className="text-xl font-display font-bold text-foreground mb-4">Our Locations</h2>
        <div className="space-y-3">
          {vendorLocations.map(vendor => (
            <button
              key={vendor.id}
              onClick={() => {
                setSelectedVendor(vendor);
                if (mapRef.current) {
                  mapRef.current.flyTo({
                    center: [vendor.coordinates[0], vendor.coordinates[1]],
                    zoom: 13,
                    duration: 2000
                  });
                }
              }}
              className={`w-full text-left p-4 rounded-xl transition-all border ${
                selectedVendor?.id === vendor.id
                  ? 'bg-secondary/20 border-secondary'
                  : 'bg-muted/30 border-border hover:border-secondary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <MapPin className={`w-5 h-5 flex-shrink-0 mt-1 ${
                  selectedVendor?.id === vendor.id ? 'text-secondary' : 'text-gold'
                }`} />
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{vendor.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{vendor.address}</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {vendor.type === 'flagship' && (
                      <span className="text-xs bg-gold text-gold-foreground px-2 py-0.5 rounded-full font-semibold">
                        Flagship
                      </span>
                    )}
                    <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">
                      {vendor.products.length} Categories
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Vendor Details Panel */}
      {selectedVendor && (
        <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-96 bg-card/95 backdrop-blur rounded-2xl p-6 z-20 border-2 border-secondary shadow-2xl">
          <button
            onClick={() => setSelectedVendor(null)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="mb-4">
            {selectedVendor.type === 'flagship' && (
              <span className="inline-block bg-gradient-to-r from-gold to-secondary text-foreground text-xs font-semibold px-3 py-1 rounded-full mb-3">
                ⭐ Flagship Store
              </span>
            )}
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">{selectedVendor.name}</h2>
            <p className="text-muted-foreground text-sm mb-4">{selectedVendor.description}</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 text-muted-foreground">
              <MapPin className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <span className="text-sm">{selectedVendor.address}</span>
            </div>

            <div className="flex items-start gap-3 text-muted-foreground">
              <Phone className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <button
                onClick={() => callStore(selectedVendor.phone)}
                className="text-sm hover:text-secondary transition-colors"
              >
                {selectedVendor.phone}
              </button>
            </div>

            <div className="flex items-start gap-3 text-muted-foreground">
              <Clock className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <span className="text-sm">{selectedVendor.hours}</span>
            </div>

            <div className="flex items-start gap-3 text-muted-foreground">
              <ShoppingBag className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {selectedVendor.products.map((product, idx) => (
                  <span key={idx} className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">
                    {product}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => getDirections(selectedVendor)}
              variant="sage"
              className="flex-1"
            >
              <Navigation className="w-5 h-5 mr-2" />
              Directions
            </Button>
            <Button
              onClick={() => callStore(selectedVendor.phone)}
              variant="glass"
              className="flex-1"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-30">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* Expand/Collapse hint */}
      {isExpanded && (
        <button
          onClick={() => setIsExpanded(false)}
          className="absolute top-6 right-6 z-30 px-4 py-2 bg-card/90 backdrop-blur border border-border rounded-lg text-sm text-foreground hover:bg-card transition-colors"
        >
          Exit Fullscreen
        </button>
      )}
    </div>
  );
};

export default AlphaMap;