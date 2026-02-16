import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Package, ShoppingBag, Truck, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import logoLight from "@/assets/alpha-logo-light.png";

const Deliveries = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<any[]>([]);

  useEffect(() => {
    const loadDeliveries = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }

      // Fetch from user_deliveries
      const { data } = await supabase
        .from("user_deliveries")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      setDeliveries(data || []);
      setLoading(false);
    };
    loadDeliveries();
  }, [navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-secondary/20 text-secondary";
      case "shipped": return "bg-blue-500/20 text-blue-400";
      case "processing": return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

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
        <meta name="description" content="Track your Alpha deliveries." />
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

        <main className="container mx-auto px-4 py-6">
          {deliveries.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                No deliveries yet
              </h2>
              <p className="text-muted-foreground text-sm mb-8">
                Your delivery history will appear here once you make a purchase
              </p>
              <Button onClick={() => navigate("/shop")} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse Shop
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="p-5 rounded-2xl bg-card/50 border border-border/50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-foreground font-medium">
                          Order Delivery
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {delivery.created_at && format(new Date(delivery.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(delivery.status || "pending")}>
                      {delivery.status || "pending"}
                    </Badge>
                  </div>

                  {delivery.tracking_number && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>Tracking: {delivery.tracking_number}</span>
                    </div>
                  )}

                  {delivery.provider && (
                    <p className="text-sm text-muted-foreground">
                      Provider: {delivery.provider}
                    </p>
                  )}

                  {delivery.estimated_delivery && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ETA: {format(new Date(delivery.estimated_delivery), "MMM d, yyyy")}
                    </p>
                  )}

                  {delivery.concierge && (
                    <Badge variant="outline" className="mt-2 border-secondary/50 text-secondary">
                      Concierge Pickup
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </>
  );
};

export default Deliveries;
