import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Phone, Clock, Navigation, X, ShoppingBag, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { vendorLocations, VendorLocation } from '@/data/locations';
import L from 'leaflet';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom purple/gold marker icon
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="url(#gradient)" stroke="white" stroke-width="3"/>
      <text x="20" y="26" font-family="serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">A</text>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8b7355;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7a9a7a;stop-opacity:1" />
        </linearGradient>
      </defs>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// Products data for showing availability at stores
const products = [
  { id: 1, name: "Alpha Signature Hoodie", price: 1299, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500", availableAt: [1, 5] },
  { id: 2, name: "Wellness Starter Kit", price: 899, image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500", availableAt: [1, 2, 3] },
  { id: 3, name: "Alpha Tote Bag", price: 599, image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500", availableAt: [1, 2, 4, 5] },
  { id: 4, name: "Premium Lifestyle Box", price: 2499, image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=500", availableAt: [1] },
  { id: 5, name: "Alpha Snapback", price: 499, image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500", availableAt: [1, 2, 3, 4, 5] },
  { id: 6, name: "Botanical Blend Set", price: 1499, image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500", availableAt: [1, 2, 3] },
  { id: 7, name: "Alpha Track Jacket", price: 1899, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500", availableAt: [1, 4, 5] },
  { id: 8, name: "Culture Zine Vol. 1", price: 299, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500", availableAt: [1, 2, 3, 4, 5] }
];

const AlphaMap = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get selected store from navigation state
  const navigationState = location.state as { selectedStoreId?: number } | null;
  const initialStoreId = navigationState?.selectedStoreId;

  const [selectedVendor, setSelectedVendor] = useState<VendorLocation | null>(() => {
    if (initialStoreId) {
      return vendorLocations.find(v => v.id === initialStoreId) || null;
    }
    return null;
  });
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vendorName: '',
    address: '',
    phone: '',
    description: ''
  });

  // Calculate map center and zoom based on navigation
  const mapCenter: [number, number] = initialStoreId
    ? vendorLocations.find(v => v.id === initialStoreId)?.coordinates || [-28.0, 25.0]
    : [-28.0, 25.0];
  const mapZoom = initialStoreId ? 13 : 5;

  // Get products available at a store
  const getStoreProducts = (storeId: number) => {
    return products.filter(p => p.availableAt.includes(storeId));
  };

  const getDirections = (vendor: VendorLocation) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${vendor.coordinates[0]},${vendor.coordinates[1]}`;
    window.open(url, '_blank');
  };

  const callStore = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleVendorClick = (vendor: VendorLocation) => {
    setSelectedVendor(vendor);
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
    <div className="relative w-full h-screen bg-background">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-background to-transparent p-6 z-[1000] pointer-events-none">
        <h1 className="text-3xl font-display font-bold text-gradient-gold">
          Alpha Appeal Locations
        </h1>
        <p className="text-muted-foreground mt-2">Find your nearest Alpha experience</p>
      </div>

      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {vendorLocations.map(vendor => (
          <Marker
            key={vendor.id}
            position={vendor.coordinates}
            icon={customIcon}
            eventHandlers={{
              click: () => handleVendorClick(vendor)
            }}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-bold text-lg mb-1">{vendor.name}</h3>
                <p className="text-sm text-gray-600">{vendor.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Submit Vendor Button */}
      <div className="absolute top-24 left-6 z-[1000]">
        <Button
          onClick={() => setShowSubmitForm(!showSubmitForm)}
          variant="default"
          className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
        >
          <Send className="w-4 h-4" />
          Suggest a Store
        </Button>
      </div>

      {/* Vendor Submission Form */}
      {showSubmitForm && (
        <div className="absolute top-36 left-6 z-[1000] w-80 bg-card/95 backdrop-blur border border-secondary/30 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Suggest a Vendor</h3>
            <button onClick={() => setShowSubmitForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
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
              <Button type="button" variant="outline" onClick={() => setShowSubmitForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Vendor List Sidebar */}
      <div className="absolute left-6 top-36 bottom-6 w-80 bg-card/95 backdrop-blur rounded-2xl p-6 overflow-y-auto z-[1000] hidden lg:block border border-secondary/20">
        <h2 className="text-xl font-display font-bold text-foreground mb-4">Our Locations</h2>
        <div className="space-y-3">
          {vendorLocations.map(vendor => (
            <button
              key={vendor.id}
              onClick={() => handleVendorClick(vendor)}
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
                      {getStoreProducts(vendor.id).length} Products
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
        <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-96 bg-card/95 backdrop-blur rounded-2xl p-6 z-[1000] border-2 border-secondary shadow-2xl max-h-[80vh] overflow-y-auto">
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

          <div className="flex gap-3 mb-6">
            <Button
              onClick={() => getDirections(selectedVendor)}
              className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              <Navigation className="w-5 h-5 mr-2" />
              Directions
            </Button>
            <Button
              onClick={() => callStore(selectedVendor.phone)}
              variant="outline"
              className="flex-1"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call
            </Button>
          </div>

          {/* Available Products at This Store */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-foreground font-bold mb-3 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-secondary" />
              Available Products
            </h3>
            <div className="space-y-2">
              {getStoreProducts(selectedVendor.id).slice(0, 5).map(product => (
                <div key={product.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-medium truncate">{product.name}</p>
                    <p className="text-secondary text-xs">R{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => navigate('/shop', { state: { selectedLocation: selectedVendor.id } })}
              variant="outline"
              className="w-full mt-3 text-sm"
            >
              View All Products at This Store
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlphaMap;
