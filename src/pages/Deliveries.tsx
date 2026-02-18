import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, Loader2, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import logoLight from "@/assets/alpha-logo-light.png";

const statusConfig: Record<string, { icon: any; label: string; color: string }> = {
  pending: { icon: Clock, label: "Pending", color: "text-muted-foreground" },
  shipped: { icon: Truck, label: "Shipped", color: "text-blue-400" },
  in_transit: { icon: Truck, label: "In Transit", color: "text-blue-400" },
  delivered: { icon: CheckCircle, label: "Delivered", color: "text-secondary" },
};

const Deliveries = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/signup"); return; }

      const { data } = await supabase
        .from("user_deliveries")
        .select("*, orders(order_number, amount, product_name)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      setDeliveries(data || []);
      setLoading(false);
    };
    load();
  }, [navigate]);

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
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">No deliveries yet</h2>
              <p className="text-muted-foreground text-sm mb-8">Your delivery history will appear here</p>
              <Button onClick={() => navigate("/shop")} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <ShoppingBag className="w-4 h-4 mr-2" /> Browse Shop
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveries.map((d) => {
                const status = statusConfig[d.status || "pending"] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <div key={d.id} className="p-4 rounded-xl border border-border/50 bg-card/30">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-foreground font-medium text-sm">
                          {d.orders?.product_name || d.orders?.order_number || "Order"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {d.created_at ? format(new Date(d.created_at), "MMM d, yyyy") : "—"}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1.5 ${status.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-xs font-medium">{status.label}</span>
                      </div>
                    </div>
                    {d.tracking_number && (
                      <div className="flex justify-between text-xs mt-2">
                        <span className="text-muted-foreground">Tracking</span>
                        <span className="text-foreground font-mono">{d.tracking_number}</span>
                      </div>
                    )}
                    {d.provider && (
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-muted-foreground">Provider</span>
                        <span className="text-foreground">{d.provider}</span>
                      </div>
                    )}
                    {d.concierge && (
                      <span className="inline-block mt-2 text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full">Concierge</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </>
  );
};

export default Deliveries;
