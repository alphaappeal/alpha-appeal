import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, MapPin, Phone, Clock, Star, Gift, Shield, 
  ExternalLink, Calendar, CheckCircle, Globe, Mail, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';

interface PartnerData {
  id: string;
  name: string;
  partner_since: string | null;
  alpha_status: string | null;
  address: string;
  city: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours_weekdays: string | null;
  hours_saturday: string | null;
  hours_sunday: string | null;
  currently_open: boolean | null;
  vibe: string | null;
  specialties: string[] | null;
  atmosphere: string | null;
  hero_image: string | null;
  logo_url: string | null;
  member_discount: string | null;
  exclusive_access: string | null;
  special_events: string | null;
  amenities: string[] | null;
  payment_methods: string[] | null;
  rating_overall: number | null;
  review_count: number | null;
  featured: boolean | null;
  has_delivery: boolean | null;
  open_for_reservations: boolean | null;
}

const isCurrentlyOpen = (partner: PartnerData): boolean => {
  const now = new Date();
  const day = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  let todayHours: string | null;
  if (day === 0) todayHours = partner.hours_sunday;
  else if (day === 6) todayHours = partner.hours_saturday;
  else todayHours = partner.hours_weekdays;

  if (!todayHours || todayHours.toLowerCase() === 'closed') return false;

  const timeMatch = todayHours.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
  if (!timeMatch) return false;

  const openTime = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
  const closeTime = parseInt(timeMatch[3]) * 60 + parseInt(timeMatch[4]);
  return currentTime >= openTime && currentTime <= closeTime;
};

const PartnerDetail = () => {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPartner = async () => {
      if (!partnerId) { setNotFound(true); setLoading(false); return; }

      const { data, error } = await supabase
        .from('alpha_partners')
        .select('*')
        .eq('id', partnerId)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        setPartner(data as PartnerData);
      }
      setLoading(false);
    };
    fetchPartner();
  }, [partnerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (notFound || !partner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">Partner Not Found</h1>
          <Button onClick={() => navigate('/map')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Partner Network
          </Button>
        </div>
      </div>
    );
  }

  const isOpen = isCurrentlyOpen(partner);
  const alphaStatus = partner.alpha_status || 'verified';

  const getDirections = () => {
    if (partner.latitude && partner.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${partner.latitude},${partner.longitude}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partner.address + ', ' + partner.city)}`, '_blank');
    }
  };

  return (
    <>
      <Helmet>
        <title>{partner.name} | Alpha Appeal Partner Network</title>
        <meta name="description" content={`${partner.atmosphere || partner.vibe || ''} - Alpha Appeal verified partner in ${partner.city}.`} />
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        {/* Hero Section */}
        <div className="relative h-80 bg-muted flex items-center justify-center">
          <img 
            src={partner.logo_url || partner.hero_image || '/placeholder.svg'} 
            alt={partner.name}
            className="max-w-[280px] max-h-[200px] object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          <button
            onClick={() => navigate('/map')}
            className="absolute top-6 left-6 flex items-center gap-2 text-foreground hover:text-gold transition-colors z-10"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Partner Network</span>
          </button>

          <div className="absolute bottom-8 left-6 right-6 max-w-4xl mx-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                {alphaStatus === 'exclusive' && (
                  <span className="inline-block bg-gradient-to-r from-gold to-secondary text-background text-sm font-bold px-4 py-1.5 rounded-full mb-3">
                    ⭐ ALPHA EXCLUSIVE PARTNER
                  </span>
                )}
                {alphaStatus === 'featured' && (
                  <span className="inline-block bg-secondary text-secondary-foreground text-sm font-bold px-4 py-1.5 rounded-full mb-3">
                    FEATURED PARTNER
                  </span>
                )}
                {alphaStatus === 'verified' && (
                  <span className="inline-flex items-center gap-1 bg-muted text-foreground text-sm font-semibold px-4 py-1.5 rounded-full mb-3 border border-border">
                    <Shield className="w-4 h-4 text-gold" />
                    VERIFIED
                  </span>
                )}
                
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">{partner.name}</h1>
                {partner.vibe && <p className="text-lg text-gold font-semibold mb-3">{partner.vibe}</p>}
                
                <div className="flex items-center gap-4 flex-wrap">
                  {(partner.rating_overall ?? 0) > 0 && (
                    <div className="flex items-center gap-2 bg-background/60 backdrop-blur px-3 py-1.5 rounded-lg">
                      <Star className="w-5 h-5 text-gold fill-gold" />
                      <span className="text-foreground font-bold">{partner.rating_overall}</span>
                      <span className="text-muted-foreground text-sm">({partner.review_count || 0} reviews)</span>
                    </div>
                  )}
                  
                  {isOpen ? (
                    <span className="bg-green-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg">● OPEN NOW</span>
                  ) : (
                    <span className="bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1.5 rounded-lg">CLOSED</span>
                  )}
                  
                  {partner.partner_since && (
                    <span className="bg-background/60 backdrop-blur text-muted-foreground text-sm px-3 py-1.5 rounded-lg">
                      Partner since {partner.partner_since}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Alpha Member Perks */}
              {(partner.member_discount || partner.exclusive_access || partner.special_events) && (
                <section className="bg-gradient-to-br from-secondary/10 to-gold/10 border-2 border-secondary/30 rounded-2xl p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary to-gold rounded-full flex items-center justify-center">
                      <Gift className="w-6 h-6 text-background" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">Member Benefits</h2>
                      <p className="text-gold text-sm">Exclusive perks for Alpha members</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {partner.member_discount && (
                      <div className="bg-background/50 backdrop-blur rounded-xl p-5 border border-secondary/20">
                        <p className="text-sm text-muted-foreground mb-2">Discount</p>
                        <p className="text-base font-bold text-foreground">{partner.member_discount}</p>
                      </div>
                    )}
                    {partner.exclusive_access && (
                      <div className="bg-background/50 backdrop-blur rounded-xl p-5 border border-secondary/20">
                        <p className="text-sm text-muted-foreground mb-2">Exclusive Access</p>
                        <p className="text-base font-bold text-foreground">{partner.exclusive_access}</p>
                      </div>
                    )}
                    {partner.special_events && (
                      <div className="bg-background/50 backdrop-blur rounded-xl p-5 border border-secondary/20">
                        <p className="text-sm text-muted-foreground mb-2">Special Events</p>
                        <p className="text-base font-bold text-foreground">{partner.special_events}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-secondary/20">
                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                      <Shield className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                      <span>Simply show your Alpha membership card or app to redeem these exclusive benefits</span>
                    </p>
                  </div>
                </section>
              )}

              {/* About */}
              <section className="bg-card rounded-2xl p-6 md:p-8 border border-border">
                <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">About This Location</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{partner.atmosphere || 'Premium Alpha partner location.'}</p>
                
                {partner.specialties && partner.specialties.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {partner.specialties.map((specialty, idx) => (
                        <span key={idx} className="bg-secondary/20 text-secondary px-4 py-2 rounded-lg border border-secondary/30 font-semibold text-sm">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Amenities & Payment */}
              {((partner.amenities && partner.amenities.length > 0) || (partner.payment_methods && partner.payment_methods.length > 0)) && (
                <section className="bg-card rounded-2xl p-6 md:p-8 border border-border">
                  <div className="grid md:grid-cols-2 gap-8">
                    {partner.amenities && partner.amenities.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4">Amenities</h3>
                        <div className="space-y-2">
                          {partner.amenities.map((amenity, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                              <CheckCircle className="w-4 h-4 text-gold" />
                              <span>{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {partner.payment_methods && partner.payment_methods.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4">Payment Options</h3>
                        <div className="space-y-2">
                          {partner.payment_methods.map((method, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>{method}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Hours */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-gold" />
                  <h3 className="text-lg font-bold text-foreground">Hours</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mon - Fri</span>
                    <span className="text-foreground font-semibold">{partner.hours_weekdays || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saturday</span>
                    <span className="text-foreground font-semibold">{partner.hours_saturday || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="text-foreground font-semibold">{partner.hours_sunday || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Contact & Location</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground text-sm">{partner.address}</span>
                  </div>
                  {partner.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gold flex-shrink-0" />
                      <a href={`tel:${partner.phone}`} className="text-gold hover:text-gold/80 text-sm transition-colors">
                        {partner.phone}
                      </a>
                    </div>
                  )}
                  {partner.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gold flex-shrink-0" />
                      <a href={`mailto:${partner.email}`} className="text-gold hover:text-gold/80 text-sm transition-colors">
                        {partner.email}
                      </a>
                    </div>
                  )}
                  {partner.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gold flex-shrink-0" />
                      <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold/80 text-sm transition-colors flex items-center gap-1">
                        Website <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-2">
                  <Button onClick={getDirections} className="w-full bg-gradient-to-r from-secondary to-gold text-background hover:opacity-90">
                    Get Directions
                  </Button>
                  {partner.open_for_reservations && (
                    <Button variant="outline" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Reserve a Visit
                    </Button>
                  )}
                </div>
              </div>

              {/* Verified Badge */}
              <div className="bg-gradient-to-br from-card to-muted rounded-2xl p-6 border-2 border-gold/20 text-center">
                <Shield className="w-12 h-12 text-gold mx-auto mb-3" />
                <h4 className="font-display font-bold text-foreground mb-2">Verified Partner</h4>
                <p className="text-sm text-muted-foreground">
                  This location has been verified and approved by Alpha Appeal
                </p>
              </div>

              {partner.has_delivery && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center">
                  <p className="text-green-500 font-semibold text-sm">🚗 Delivery Available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </>
  );
};

export default PartnerDetail;
