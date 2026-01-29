import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, CreditCard, Plus, TrendingUp, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import logoLight from "@/assets/alpha-logo-light.png";

const Billing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Tables<'subscriptions'> | null>(null);
  const [orders, setOrders] = useState<Tables<'orders'>[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/signup");
        return;
      }

      const { data: subData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("status", "active")
        .maybeSingle();
      setSubscription(subData);

      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setOrders(orderData || []);

      setLoading(false);
    };
    loadData();
  }, [navigate]);

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", subscription.id);

    if (error) {
      toast({ title: "Error", description: "Failed to cancel subscription", variant: "destructive" });
    } else {
      toast({ title: "Subscription cancelled", description: "We're sorry to see you go" });
      setSubscription(null);
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
        <title>Billing & Subscription | Alpha</title>
        <meta name="description" content="Manage your Alpha subscription and billing." />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={() => navigate("/profile")} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="font-display text-lg font-semibold text-foreground">Billing</h1>
            <Link to="/">
              <img src={logoLight} alt="Alpha" className="h-6" />
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Current Subscription */}
          <div className="p-6 rounded-2xl bg-card/50 border border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-secondary" />
              <h2 className="font-display font-semibold text-foreground">Current Subscription</h2>
            </div>

            {subscription ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="text-foreground font-medium capitalize">{subscription.tier}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-foreground font-medium">R{subscription.amount}/month</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Next billing</span>
                  <span className="text-foreground">
                    {subscription.next_billing_date
                      ? format(new Date(subscription.next_billing_date), "MMM d, yyyy")
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <span className="px-2 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-medium">
                    Active
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">No active subscription</p>
                <Button onClick={() => navigate("/signup")} className="bg-secondary text-secondary-foreground">
                  View Plans
                </Button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => toast({ title: "Coming soon", description: "Credits feature launching soon" })}
            >
              <Plus className="w-4 h-4" />
              Add Credits
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => navigate("/signup")}
            >
              <TrendingUp className="w-4 h-4" />
              Upgrade Plan
            </Button>
            {subscription && (
              <Button
                variant="outline"
                className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                onClick={handleCancelSubscription}
              >
                <XCircle className="w-4 h-4" />
                Cancel Subscription
              </Button>
            )}
          </div>

          {/* Transaction History */}
          <div className="p-6 rounded-2xl bg-card/50 border border-border/50">
            <h2 className="font-display font-semibold text-foreground mb-4">Transaction History</h2>
            
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-foreground font-medium text-sm">{order.product_name || order.order_type}</p>
                      <p className="text-muted-foreground text-xs">
                        {format(new Date(order.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground font-medium">R{order.amount}</p>
                      <p className={`text-xs ${order.payment_status === "completed" ? "text-secondary" : "text-muted-foreground"}`}>
                        {order.payment_status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <BottomNav />
      </div>
    </>
  );
};

export default Billing;