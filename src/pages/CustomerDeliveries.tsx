import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  ArrowLeft, Package, Truck, CheckCircle, Clock, Loader2, MapPin, Phone,
  MessageCircle, Star, Navigation, Share2, Download, RefreshCw, User,
  Calendar, DollarSign, TrendingUp, AlertCircle, Info, ExternalLink,
} from "lucide-react";
import logoLight from "@/assets/alpha-logo-light.png";
import BottomNav from "@/components/BottomNav";

const statusConfig = {
  pending: { icon: Clock, label: "Order Placed", color: "text-amber-500", bg: "bg-amber-500/10" },
  assigned: { icon: User, label: "Driver Assigned", color: "text-blue-500", bg: "bg-blue-500/10" },
  in_transit: { icon: Truck, label: "In Transit", color: "text-purple-500", bg: "bg-purple-500/10" },
  picked_up: { icon: Package, label: "Picked Up", color: "text-indigo-500", bg: "bg-indigo-500/10" },
  delivered: { icon: CheckCircle, label: "Delivered", color: "text-green-500", bg: "bg-green-500/10" },
  failed: { icon: AlertCircle, label: "Failed", color: "text-red-500", bg: "bg-red-500/10" },
};

// Composite type for delivery with all joined data
type DeliveryWithDetails = Database['public']['Tables']['user_deliveries']['Row'] & {
  orders: {
    order_number: string;
    product_name: string;
    amount: number;
  } | null;
  alpha_partners: {
    name: string;
    phone: string | null;
  } | null;
  driver: {
    rating: number | null;
    vehicle_type: string | null;
    vehicle_plate: string | null;
    profile_photo_url: string | null;
  }[];
};

const DeliveriesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<DeliveryWithDetails[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryWithDetails | null>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  const loadDeliveries = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login", { state: { redirect: "/deliveries" } });
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("user_deliveries")
        .select(`
          *,
          orders(order_number, product_name, amount),
          alpha_partners(name, phone),
          driver:delivery_drivers(
            rating,
            vehicle_type,
            vehicle_plate,
            profile_photo_url
          )
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDeliveries(data || []);
    } catch (error: any) {
      console.error("Error loading deliveries:", error);
      toast({
        title: "Error",
        description: "Failed to load deliveries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [navigate, toast]);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  // Real-time subscription for live updates
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      const channel = supabase
        .channel(`deliveries-${data.user.id}`)
        .on("postgres_changes", {
          event: "UPDATE",
          schema: "public",
          table: "user_deliveries",
          filter: `user_id=eq.${data.user.id}`,
        }, (payload) => {
          // Show toast for status changes
          const newStatus = payload.new.status;
          const oldStatus = payload.old?.status;
          
          if (newStatus !== oldStatus) {
            const statusInfo = statusConfig[newStatus as keyof typeof statusConfig];
            toast({
              title: statusInfo?.label || "Delivery Update",
              description: `Your order status has been updated to ${statusInfo?.label.toLowerCase()}`,
            });
            
            // Reload to get full details
            loadDeliveries();
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    checkSession();
  }, [toast, loadDeliveries]);

  const handleContactDriver = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleMessageDriver = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank');
  };

  const handleShareTracking = async (delivery: DeliveryWithDetails) => {
    const shareData = {
      title: 'Track My Delivery',
      text: `Track my Alpha delivery: ${delivery.orders?.order_number}`,
      url: delivery.tracking_url || window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared!",
          description: "Tracking link shared successfully",
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareData.url);
      toast({
        title: "Copied!",
        description: "Tracking link copied to clipboard",
      });
    }
  };

  const activeDeliveries = deliveries.filter(d => 
    !["delivered", "failed"].includes(d.status)
  );
  
  const pastDeliveries = deliveries.filter(d => 
    ["delivered", "failed"].includes(d.status)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Deliveries | Alpha</title>
        <meta name="description" content="Track your Alpha deliveries in real-time." />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={() => navigate("/profile")} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="font-display text-lg font-semibold text-foreground">My Deliveries</h1>
            <Link to="/">
              <img src={logoLight} alt="Alpha" className="h-6" />
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Empty State */}
          {deliveries.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                No deliveries yet
              </h2>
              <p className="text-muted-foreground text-sm mb-8">
                Place an order and track it here in real-time
              </p>
              <Button onClick={() => navigate("/shop")}>
                Browse Shop
              </Button>
            </div>
          ) : (
            <>
              {/* Active Deliveries */}
              {activeDeliveries.length > 0 && (
                <section>
                  <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Active ({activeDeliveries.length})
                  </h2>
                  <div className="space-y-4">
                    {activeDeliveries.map((delivery) => (
                      <ActiveDeliveryCard
                        key={delivery.id}
                        delivery={delivery}
                        onViewTracking={() => {
                          setSelectedDelivery(delivery);
                          setShowTrackingModal(true);
                        }}
                        onContactDriver={handleContactDriver}
                        onMessageDriver={handleMessageDriver}
                        onShare={() => handleShareTracking(delivery)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Past Deliveries */}
              {pastDeliveries.length > 0 && (
                <section>
                  <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    History ({pastDeliveries.length})
                  </h2>
                  <div className="space-y-3">
                    {pastDeliveries.map((delivery) => (
                      <PastDeliveryCard
                        key={delivery.id}
                        delivery={delivery}
                        onReorder={() => navigate("/shop")}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        <BottomNav />
      </div>

      {/* Live Tracking Modal */}
      {showTrackingModal && selectedDelivery && (
        <LiveTrackingModal
          delivery={selectedDelivery}
          onClose={() => setShowTrackingModal(false)}
          onContactDriver={handleContactDriver}
          onMessageDriver={handleMessageDriver}
        />
      )}
    </>
  );
};

// ─── Active Delivery Card ──────────────────────────────────────────────────
const ActiveDeliveryCard = ({ 
  delivery, 
  onViewTracking,
  onContactDriver,
  onMessageDriver,
  onShare 
}: { 
  delivery: DeliveryWithDetails;
  onViewTracking: () => void;
  onContactDriver: (phone: string) => void;
  onMessageDriver: (phone: string) => void;
  onShare: () => void;
}) => {
  const StatusIcon = statusConfig[delivery.status as keyof typeof statusConfig]?.icon || Clock;
  const status = statusConfig[delivery.status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <Card className="border-l-4 border-l-secondary">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full ${status.bg} flex items-center justify-center`}>
              <StatusIcon className={`w-5 h-5 ${status.color}`} />
            </div>
            <div>
              <Badge className={status.bg}>{status.label}</Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(delivery.created_at), "MMM d, h:mm a")}
              </p>
            </div>
          </div>
          {delivery.eta_minutes && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Estimated Arrival</p>
              <p className="text-lg font-bold text-foreground">{delivery.eta_minutes} min</p>
            </div>
          )}
        </div>

        <h3 className="font-semibold text-lg mb-2">
          {delivery.orders?.product_name || delivery.orders?.order_number}
        </h3>

        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <div>
            <span className="text-muted-foreground">From:</span>
            <span className="ml-2 font-medium">{delivery.alpha_partners?.name || "N/A"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">To:</span>
            <span className="ml-2 font-medium truncate block">
              {delivery.delivery_address || "N/A"}
            </span>
          </div>
        </div>

        {/* Driver Info */}
        {delivery.driver_name && (
          <div className="bg-muted/30 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{delivery.driver_name}</p>
                  {delivery.driver[0]?.vehicle_type && (
                    <p className="text-xs text-muted-foreground capitalize">
                      {delivery.driver[0]?.vehicle_type}
                      {delivery.driver[0]?.vehicle_plate && ` • ${delivery.driver[0]?.vehicle_plate}`}
                    </p>
                  )}
                </div>
              </div>
              {delivery.driver[0]?.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{delivery.driver[0]?.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Contact Buttons */}
            <div className="flex gap-2 mt-3">
              {delivery.driver_phone && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onContactDriver(delivery.driver_phone!)}
                    className="flex-1"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMessageDriver(delivery.driver_phone!)}
                    className="flex-1"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="default"
                onClick={onViewTracking}
                className="flex-1"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Track Live
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {delivery.tracking_url && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.open(delivery.tracking_url!, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Shipday Track
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onShare} className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button size="sm" variant="ghost" onClick={onViewTracking}>
            <MapPin className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Past Delivery Card ──────────────────────────────────────────────────
const PastDeliveryCard = ({ 
  delivery, 
  onReorder 
}: { 
  delivery: DeliveryWithDetails;
  onReorder: () => void;
}) => {
  const StatusIcon = statusConfig[delivery.status as keyof typeof statusConfig]?.icon || CheckCircle;
  const status = statusConfig[delivery.status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <Card className="opacity-75">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-4 h-4 ${status.color}`} />
            <span className="text-sm font-medium">{status.label}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {format(new Date(delivery.created_at), "MMM d, yyyy")}
          </span>
        </div>
        
        <h3 className="font-medium text-sm mb-2">
          {delivery.orders?.product_name || delivery.orders?.order_number}
        </h3>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">Total:</span>
            <span className="ml-2 font-semibold">
              R{(Number(delivery.orders?.amount || 0) + Number(delivery.delivery_fee || 0)).toFixed(2)}
            </span>
          </div>
          <Button size="sm" variant="outline" onClick={onReorder}>
            Reorder
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Live Tracking Modal ──────────────────────────────────────────────────
const LiveTrackingModal = ({
  delivery,
  onClose,
  onContactDriver,
  onMessageDriver,
}: {
  delivery: DeliveryWithDetails;
  onClose: () => void;
  onContactDriver: (phone: string) => void;
  onMessageDriver: (phone: string) => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-background w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Live Tracking</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Progress Bar */}
          <div className="relative">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary transition-all duration-500"
                style={{ width: getProgressPercentage(delivery.status) + "%" }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Placed</span>
              <span>Pickup</span>
              <span>On the way</span>
              <span>Delivered</span>
            </div>
          </div>

          {/* Current Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-secondary" />
                <span className="font-semibold">
                  {statusConfig[delivery.status as keyof typeof statusConfig]?.label || "In Progress"}
                </span>
              </div>
              {delivery.estimated_delivery && (
                <p className="text-sm text-muted-foreground">
                  Estimated arrival: {format(new Date(delivery.estimated_delivery), "h:mm a")}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Driver Details */}
          {delivery.driver_name && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{delivery.driver_name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="capitalize">{delivery.driver[0]?.vehicle_type || "N/A"}</span>
                      {delivery.driver[0]?.vehicle_plate && (
                        <>
                          <span>•</span>
                          <span>{delivery.driver[0]?.vehicle_plate}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {delivery.driver[0]?.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{delivery.driver[0]?.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {delivery.driver_phone && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => onContactDriver(delivery.driver_phone!)}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => onMessageDriver(delivery.driver_phone!)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Details */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Delivery Address</p>
                <p className="font-medium">{delivery.delivery_address || "N/A"}</p>
              </div>
              
              {delivery.delivery_instructions && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Instructions</p>
                  <p className="font-medium">{delivery.delivery_instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R{Number(delivery.orders?.amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>R{Number(delivery.delivery_fee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span>
                    R{(
                      Number(delivery.orders?.amount || 0) +
                      Number(delivery.delivery_fee || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proof of Delivery */}
          {(delivery.pod_photo_url || delivery.pod_signature_url) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Proof of Delivery</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {delivery.pod_photo_url && (
                  <div className="mb-3">
                    <img 
                      src={delivery.pod_photo_url} 
                      alt="Delivery proof" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                {delivery.pod_signature_url && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Signature</p>
                    <img 
                      src={delivery.pod_signature_url} 
                      alt="Signature" 
                      className="w-full h-24 object-contain border rounded-lg p-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate progress percentage
function getProgressPercentage(status: string): number {
  const progress = {
    pending: 10,
    assigned: 25,
    in_transit: 50,
    picked_up: 75,
    delivered: 100,
    failed: 0,
  };
  return progress[status as keyof typeof progress] || 0;
}

export default DeliveriesPage;
