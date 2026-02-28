import { AlphaPartner, isPartnerOpen } from "@/data/alphaPartners";
import { MapPin, Phone, Clock, Navigation, Star, Gift, Shield, Calendar, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

interface MapDrawerProps {
  partner: AlphaPartner | null;
  onClose: () => void;
}

const PartnerDetails = ({ partner, onClose }: { partner: AlphaPartner; onClose: () => void }) => {
  const navigate = useNavigate();

  const getDirections = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${partner.coordinates[0]},${partner.coordinates[1]}`, "_blank");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">{partner.name}</h2>
          <p className="text-secondary text-sm">{partner.vibe}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <Star className="w-5 h-5 text-secondary fill-secondary" />
            <span className="font-bold text-foreground">{partner.rating.overall}</span>
          </div>
          <p className="text-xs text-muted-foreground">{partner.rating.reviews} reviews</p>
        </div>
      </div>

      <p className="text-muted-foreground text-sm">{partner.atmosphere}</p>

      {/* Perks */}
      <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-5 h-5 text-secondary" />
          <span className="font-semibold text-foreground text-sm">Alpha Member Perks</span>
        </div>
        <div className="space-y-2 text-sm">
          {[partner.alphaPerks.memberDiscount, partner.alphaPerks.exclusiveAccess, partner.alphaPerks.specialEvents].map((perk, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-secondary">•</span>
              <span className="text-muted-foreground">{perk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Specialties */}
      <div className="flex flex-wrap gap-2">
        {partner.specialties.map((s, i) => (
          <span key={i} className="bg-secondary/20 text-secondary text-xs px-3 py-1.5 rounded-lg border border-secondary/30">{s}</span>
        ))}
      </div>

      {/* Contact */}
      <div className="space-y-2">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
          <span>{partner.address}</span>
        </div>
        {partner.contact.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-secondary flex-shrink-0" />
            <a href={`tel:${partner.contact.phone}`} className="text-secondary hover:underline">{partner.contact.phone}</a>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 text-secondary flex-shrink-0" />
          <span>{partner.hours.weekdays}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-2">
        {partner.openForReservations && (
          <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Calendar className="w-4 h-4 mr-2" /> Reserve Visit
          </Button>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={getDirections}>
            <Navigation className="w-4 h-4 mr-2" /> Directions
          </Button>
          <Button variant="outline" onClick={() => window.location.href = `tel:${partner.contact.phone}`}>
            <Phone className="w-4 h-4 mr-2" /> Call
          </Button>
        </div>
        <Button variant="ghost" onClick={() => navigate(`/partner/${partner.id}`)} className="w-full text-secondary hover:text-secondary/80 hover:bg-secondary/10">
          View Full Details <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="pt-4 border-t border-border text-center">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-secondary" /> Verified Alpha Partner since {partner.partnerSince}
        </p>
      </div>
    </div>
  );
};

const MapDrawer = ({ partner, onClose }: MapDrawerProps) => {
  const isMobile = useIsMobile();

  if (!partner) return null;

  // Mobile: pull-up drawer
  if (isMobile) {
    return (
      <Drawer open={!!partner} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{partner.name}</DrawerTitle>
            <DrawerDescription>{partner.vibe}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">
            <PartnerDetails partner={partner} onClose={onClose} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: side panel
  return (
    <div className="absolute bottom-6 right-4 w-[420px] bg-card/95 backdrop-blur rounded-2xl z-[1000] border-2 border-secondary shadow-2xl max-h-[70vh] overflow-hidden">
      <div className="relative">
        <div className="relative h-32 bg-muted flex items-center justify-center">
          <img
            src={partner.logoUrl || partner.images.hero}
            alt={partner.name}
            className="max-w-full max-h-full object-contain p-4"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-background/60 backdrop-blur p-2 rounded-full text-foreground hover:bg-background/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto max-h-[calc(70vh-128px)]">
          <PartnerDetails partner={partner} onClose={onClose} />
        </div>
      </div>
    </div>
  );
};

export default MapDrawer;
