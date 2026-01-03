import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MapPin, Store, Users, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import FloatingMenuButton, { MenuItem } from "@/components/FloatingMenuButton";
import TimedPopup from "@/components/TimedPopup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MapLocation {
  id: string;
  name: string;
  type: string;
  address: string | null;
  city: string | null;
  province: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface PopupState {
  isOpen: boolean;
  title: string;
  message: string;
}

const locationTypes = [
  { id: "all", label: "All", icon: MapPin },
  { id: "store", label: "Canna Stores", icon: Store },
  { id: "partner", label: "Partners", icon: Users },
];

const Map = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [popup, setPopup] = useState<PopupState>({ isOpen: false, title: "", message: "" });

  const showPopup = (title: string, message: string) => {
    setPopup({ isOpen: true, title, message });
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/signup");
        return;
      }
      fetchLocations();
    };
    checkAuth();
  }, [navigate]);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from("map_locations")
      .select("*")
      .eq("active", true);

    if (!error && data) {
      setLocations(data);
      setFilteredLocations(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    let filtered = locations;
    
    if (activeFilter !== "all") {
      filtered = filtered.filter((loc) => loc.type === activeFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (loc) =>
          loc.name.toLowerCase().includes(query) ||
          loc.city?.toLowerCase().includes(query) ||
          loc.province?.toLowerCase().includes(query)
      );
    }
    
    setFilteredLocations(filtered);
  }, [activeFilter, searchQuery, locations]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "store":
        return "bg-secondary/20 text-secondary border-secondary/30";
      case "partner":
        return "bg-accent/20 text-accent-foreground border-accent/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <>
      <Helmet>
        <title>Map | Alpha</title>
        <meta name="description" content="Discover Alpha locations, events, and partners near you." />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-display font-bold text-foreground mb-4">Discover</h1>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>

            {/* Filter Pills - Events removed, Stores renamed to Canna Stores */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {locationTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={activeFilter === type.id ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(type.id)}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap",
                    activeFilter === type.id && "bg-secondary text-secondary-foreground"
                  )}
                >
                  <type.icon className="w-4 h-4" />
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
        </header>

        <FloatingMenuButton>
          <MenuItem onClick={() => showPopup("Add A Store", "Suggest your favourite store where you are already a member for ease of ordering and managing your memberships")}>
            Add A Store
          </MenuItem>
          <MenuItem onClick={() => showPopup("Events", "Stay up to date with upcoming events and experiences")}>
            Events
          </MenuItem>
        </FloatingMenuButton>

        {/* Map Placeholder */}
        <div className="h-48 bg-card/50 border-b border-border flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Interactive map coming soon</p>
          </div>
        </div>

        {/* Locations List */}
        <main className="container mx-auto px-4 py-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-card/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No locations found</h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Locations will appear here soon"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:bg-card/80 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-foreground">{location.name}</h3>
                    <Badge variant="outline" className={getTypeColor(location.type)}>
                      {location.type === "store" ? "Canna Store" : location.type}
                    </Badge>
                  </div>
                  {location.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {location.description}
                    </p>
                  )}
                  {(location.address || location.city) && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {[location.address, location.city, location.province]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        <BottomNav />
      </div>

      {popup.isOpen && (
        <TimedPopup
          title={popup.title}
          message={popup.message}
          duration={10}
          onClose={() => setPopup({ ...popup, isOpen: false })}
        />
      )}
    </>
  );
};

export default Map;