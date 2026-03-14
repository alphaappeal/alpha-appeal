import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type LocationCategory = 'all' | 'flagship' | 'boutique' | 'lounge';

interface Location {
  id: string;
  name: string;
  category: LocationCategory;
  address: string;
  area: string;
  lat: number;
  lng: number;
  venderId: string;
}

const locations: Location[] = [
  {
    id: '1',
    name: 'Alpha Appeal Sandton',
    category: 'flagship',
    address: '28 Maude Street, Sandton Central',
    area: 'Sandton, Johannesburg',
    lat: -26.1076,
    lng: 28.0567,
    venderId: 'sandton'
  },
  {
    id: '2',
    name: 'The Cape Collective',
    category: 'boutique',
    address: '12 Victoria Road, Camps Bay',
    area: 'Camps Bay, Cape Town',
    lat: -33.9505,
    lng: 18.3776,
    venderId: 'camps-bay'
  },
  {
    id: '3',
    name: 'Umhlanga Private Lounge',
    category: 'lounge',
    address: 'The Pearls, Umhlanga Rocks Drive',
    area: 'Umhlanga, Durban',
    lat: -29.7269,
    lng: 31.0874,
    venderId: 'umhlanga'
  },
  {
    id: '4',
    name: 'Stellenbosch Boutique',
    category: 'boutique',
    address: '45 Dorp Street, Stellenbosch',
    area: 'Stellenbosch, Western Cape',
    lat: -33.9346,
    lng: 18.8603,
    venderId: 'stellenbosch'
  }
];

const categoryLabels: Record<LocationCategory, string> = {
  all: 'All',
  flagship: 'Flagships',
  boutique: 'Boutique Venders',
  lounge: 'Private Lounges'
};

const MemberNetwork: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [activeCategory, setActiveCategory] = useState<LocationCategory>('all');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const filteredLocations = activeCategory === 'all' 
    ? locations 
    : locations.filter(loc => loc.category === activeCategory);

  // Create gold circle marker icon
  const createGoldMarker = () => {
    return L.divIcon({
      className: 'custom-gold-marker',
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, hsl(30 26% 54%) 0%, hsl(30 35% 45%) 100%);
          border: 2px solid hsl(30 26% 65%);
          border-radius: 50%;
          box-shadow: 0 0 12px hsl(30 26% 44% / 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            font-family: 'Playfair Display', serif;
            font-size: 12px;
            font-weight: 600;
            color: white;
          ">A</span>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  };

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Initialize map centered on South Africa
    mapRef.current = L.map(mapContainer.current, {
      center: [-28.5, 25.5],
      zoom: 5,
      zoomControl: false,
      attributionControl: false
    });

    // Add dark styled tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(mapRef.current);

    // Add markers for all locations
    locations.forEach(location => {
      const marker = L.marker([location.lat, location.lng], {
        icon: createGoldMarker()
      }).addTo(mapRef.current!);

      marker.bindPopup(`
        <div style="
          background: hsl(0 0% 8%);
          color: hsl(0 0% 95%);
          padding: 16px;
          border-radius: 8px;
          min-width: 200px;
          font-family: 'Outfit', sans-serif;
        ">
          <h3 style="
            font-family: 'Playfair Display', serif;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
            color: hsl(30 26% 54%);
          ">${location.name}</h3>
          <p style="font-size: 13px; margin-bottom: 4px;">${location.address}</p>
          <p style="font-size: 12px; color: hsl(0 0% 60%); margin-bottom: 12px;">${location.area}</p>
          <a 
            href="/shop?vender=${location.venderId}" 
            style="
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 8px 16px;
              background: linear-gradient(135deg, hsl(30 26% 44%) 0%, hsl(30 35% 35%) 100%);
              color: white;
              font-size: 12px;
              font-weight: 500;
              border-radius: 4px;
              text-decoration: none;
              transition: opacity 0.2s;
            "
          >
            View Menu
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      `, {
        className: 'custom-popup'
      });

      markersRef.current.push(marker);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location.id);
    if (mapRef.current) {
      mapRef.current.flyTo([location.lat, location.lng], 14, {
        duration: 1.5
      });
      
      // Open the popup for this marker
      const markerIndex = locations.findIndex(l => l.id === location.id);
      if (markerIndex !== -1 && markersRef.current[markerIndex]) {
        markersRef.current[markerIndex].openPopup();
      }
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.setZoom(direction === 'in' ? currentZoom + 1 : currentZoom - 1);
    }
  };

  return (
    <section id="member-network-section" className="py-20 bg-background">
      <div className="container mx-auto px-4 mb-12">
        <div className="text-center">
          <span className="text-sm uppercase tracking-[0.3em] text-gold mb-4 block font-medium">
            Exclusive Access
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Member Network
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our curated network of authorized venders and private member lounges worldwide.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row h-[600px] rounded-xl overflow-hidden border border-border bg-card">
          {/* Left Panel - Location List */}
          <div className="w-full lg:w-[30%] flex flex-col border-r border-border">
            {/* Category Filters */}
            <div className="p-4 border-b border-border">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(categoryLabels) as LocationCategory[]).map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${
                      activeCategory === category
                        ? 'bg-gold text-gold-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {categoryLabels[category]}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Cards */}
            <div className="flex-1 overflow-y-auto">
              {filteredLocations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleLocationClick(location)}
                  className={`w-full text-left p-4 border-b border-border transition-all duration-300 hover:bg-muted/50 ${
                    selectedLocation === location.id ? 'bg-muted/70' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold/70 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-gold-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-base text-foreground mb-1 truncate">
                        {location.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-1 truncate">
                        {location.address}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gold capitalize">
                          {location.category === 'lounge' ? 'Private Lounge' : 
                           location.category === 'flagship' ? 'Flagship' : 'Boutique'}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {location.area}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel - Map */}
          <div className="w-full lg:w-[70%] relative h-[300px] lg:h-full">
            <div 
              ref={mapContainer} 
              className="w-full h-full midnight-map"
            />
            
            {/* Custom Zoom Controls */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
              <button
                onClick={() => handleZoom('in')}
                className="w-8 h-8 bg-card/90 backdrop-blur-sm border border-border rounded flex items-center justify-center text-foreground hover:bg-muted transition-colors"
              >
                <span className="text-lg font-light">+</span>
              </button>
              <button
                onClick={() => handleZoom('out')}
                className="w-8 h-8 bg-card/90 backdrop-blur-sm border border-border rounded flex items-center justify-center text-foreground hover:bg-muted transition-colors"
              >
                <span className="text-lg font-light">−</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles for Leaflet */}
      <style>{`
        .midnight-map {
          filter: grayscale(1) invert(1) brightness(0.7);
        }
        
        .midnight-map .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: none;
          padding: 0;
        }
        
        .midnight-map .leaflet-popup-content {
          margin: 0;
          filter: invert(1) brightness(1.4);
        }
        
        .midnight-map .leaflet-popup-tip {
          display: none;
        }
        
        .custom-gold-marker {
          background: transparent;
          border: none;
          filter: invert(1) brightness(1.4);
        }
        
        .midnight-map .leaflet-popup-close-button {
          color: hsl(0 0% 95%) !important;
          filter: invert(1);
        }
      `}</style>
    </section>
  );
};

export default MemberNetwork;
