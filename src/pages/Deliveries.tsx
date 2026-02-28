import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft, Package, Truck, CheckCircle, Clock, Loader2,
  ShoppingBag, MapPin, Phone, User, Navigation, Crown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import logoLight from "@/assets/alpha-logo-light.png";

const statusConfig: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  pending: { icon: Clock, label: "Pending", color: "text-muted-foreground", bg: "bg-muted/20" },
  assigned: { icon: User, label: "Driver Assigned", color: "text-blue-400", bg: "bg-blue-400/10" },
  in_transit: { icon: Truck, label: "In Transit", color: "text-blue-400", bg: "bg-blue-400/10" },
  picked_up: { icon: Package, label: "Picked Up", color: "text-amber-400", bg: "bg-amber-400/10" },
  delivered: { icon: CheckCircle, label: "Delivered", color: "text-secondary", bg: "bg-secondary/10" },
  shipped: { icon: Truck, label: "Shipped", color: "text-blue-400", bg: "bg-blue-400/10" },
  failed: { icon: Clock, label: "Failed", color: "text-destructive", bg: "bg-destructive/10" },
};

const Deliveries = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [userTier, setUserTier] = useState<string>("private");
  const [userId, setUserId] = useState<string | null>(null);

  const loadDeliveries = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/signup"); return; }
    setUserId(session.user.id);

    const [deliveriesRes, profileRes] = await Promise.all([
      supabase
        .from("user_deliveries")
        .select("*, orders(order_number, amount, product_name)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("users")
        .select("tier")
        .eq("id", session.user.id)
        .maybeSingle(),
    ]);

    setDeliveries(deliveriesRes.data || []);
    setUserTier(profileRes.data?.tier || "private");
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  // Real-time subscription for live updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("deliveries-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_deliveries",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadDeliveries();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, loadDeliveries]);

  const handleConciergeRequest = async () => {
    if (!userId) return;
    await supabase.from("activity_logs").insert({
      user_id: userId,
      activity_type: "concierge_request",
      description: "User requested concierge pickup/drop-off",
      metadata: { tier: userTier },
    });
    toast({ title: "Concierge Request Sent", description: "An admin will process your request shortly." });
  };

  const activeDeliveries = deliveries.filter(d => d.status !== "delivered" && d.status !== "failed");
  const pastDeliveries = deliveries.filter(d => d.status === "delivered" || d.status === "failed");

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
          {/* Concierge Button - Private tier only */}
          {userTier === "private" && (
            <button
              onClick={handleConciergeRequest}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-gold/20 to-secondary/20 border border-gold/30 flex items-center justify-between hover:border-gold/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-gold" />
                </div>
                <div className="text-left">
                  <p className="text-foreground font-semibold text-sm">Request Concierge</p>
                  <p className="text-muted-foreground text-xs">Pickup/Drop-off service</p>
                </div>
              </div>
              <Badge className="bg-gold/20 text-gold border-gold/30 text-[10px]">Private</Badge>
            </button>
          )}

          {/* Empty State */}
          {deliveries.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">No active deliveries</h2>
              <p className="text-muted-foreground text-sm mb-8">Place an order and your delivery tracking will appear here</p>
              <Button onClick={() => navigate("/shop")} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <ShoppingBag className="w-4 h-4 mr-2" /> Browse Shop
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
                    {activeDeliveries.map((d) => (
                      <DeliveryCard key={d.id} delivery={d} showLive />
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
                    {pastDeliveries.map((d) => (
                      <DeliveryCard key={d.id} delivery={d} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        <BottomNav />
      </div>
    </>
  );
};

// ─── Delivery Card ──────────────────────────────────────────────────
const DeliveryCard = ({ delivery: d, showLive }: { delivery: any; showLive?: boolean }) => {
  const status = statusConfig[d.status || "pending"] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className={`rounded-2xl border border-border/50 bg-card/30 overflow-hidden ${showLive ? "ring-1 ring-secondary/20" : ""}`}>
      {/* Status Banner */}
      <div className={`px-4 py-2.5 flex items-center justify-between ${status.bg}`}>
        <div className={`flex items-center gap-2 ${status.color}`}>
          <StatusIcon className="w-4 h-4" />
          <span className="text-sm font-semibold">{status.label}</span>
        </div>
        {d.eta_minutes && d.status !== "delivered" && (
          <span className="text-xs font-mono text-foreground bg-background/50 px-2 py-0.5 rounded-full">
            ETA: {d.eta_minutes} min
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Order info */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-foreground font-medium text-sm">
              {d.orders?.product_name || d.orders?.order_number || "Order"}
            </p>
            <p className="text-xs text-muted-foreground">
              {d.created_at ? format(new Date(d.created_at), "MMM d, yyyy · h:mm a") : "—"}
            </p>
          </div>
          {d.delivery_fee > 0 && (
            <span className="text-foreground font-semibold text-sm">R{d.delivery_fee}</span>
          )}
        </div>

        {/* Driver Info */}
        {d.driver_name && showLive && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/30">
            <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground font-medium text-sm">{d.driver_name}</p>
              {d.driver_phone && (
                <p className="text-muted-foreground text-xs flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {d.driver_phone}
                </p>
              )}
            </div>
            {d.tracking_url && (
              <a
                href={d.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-secondary underline"
              >
                <Navigation className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {/* Tracking details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {d.tracking_number && (
            <div className="flex flex-col">
              <span className="text-muted-foreground">Tracking</span>
              <span className="text-foreground font-mono">{d.tracking_number}</span>
            </div>
          )}
          {d.provider && (
            <div className="flex flex-col">
              <span className="text-muted-foreground">Provider</span>
              <span className="text-foreground">{d.provider}</span>
            </div>
          )}
          {d.distance_km && (
            <div className="flex flex-col">
              <span className="text-muted-foreground">Distance</span>
              <span className="text-foreground">{d.distance_km} km</span>
            </div>
          )}
        </div>

        {/* Tracking URL button */}
        {d.tracking_url && showLive && (
          <a
            href={d.tracking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2.5 rounded-xl bg-secondary/10 text-secondary text-sm font-medium hover:bg-secondary/20 transition-colors"
          >
            <MapPin className="w-4 h-4 inline mr-1.5" />
            Track on Map
          </a>
        )}

        {d.concierge && (
          <Badge className="bg-gold/20 text-gold border-gold/30 text-[10px]">Concierge</Badge>
        )}
      </div>
    </div>
  );
};

export default Deliveries;
