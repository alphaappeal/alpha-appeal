import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, CreditCard, Coins, XCircle, Loader2, Sparkles, Crown, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import logoLight from "@/assets/alpha-logo-light.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const TIERS = [
  {
    name: "Starter",
    price: "R99",
    icon: Sparkles,
    features: ["Monthly lifestyle kit", "Community access", "Basic rewards"],
    accent: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30",
    iconColor: "text-emerald-400",
    badgeBg: "bg-emerald-500/10 text-emerald-400",
  },
  {
    name: "Professional",
    price: "R299",
    icon: Crown,
    features: ["Premium kits", "Priority support", "VIP events access"],
    accent: "from-secondary/20 to-secondary/5 border-secondary/30",
    iconColor: "text-secondary",
    badgeBg: "bg-secondary/10 text-secondary",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "R499",
    icon: Shield,
    features: ["Luxury accessories", "Concierge service", "All-access pass"],
    accent: "from-purple-500/20 to-purple-600/5 border-purple-500/30",
    iconColor: "text-purple-400",
    badgeBg: "bg-purple-500/10 text-purple-400",
  },
];

const COIN_AMOUNTS = [
  { value: 50, label: "50 Coins", price: "R50" },
  { value: 100, label: "100 Coins", price: "R95" },
  { value: 250, label: "250 Coins", price: "R220" },
  { value: 500, label: "500 Coins", price: "R400" },
];

const Billing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [coinModalOpen, setCoinModalOpen] = useState(false);
  const [requestingTier, setRequestingTier] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/signup"); return; }

      setUserId(session.user.id);

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

  const handleRequestTierChange = async (tierName: string) => {
    if (!userId) return;
    setRequestingTier(tierName);

    const { error } = await supabase.from("activity_logs").insert({
      user_id: userId,
      activity_type: "tier_change_request",
      description: `User requested tier change to ${tierName}`,
      metadata: { requested_tier: tierName },
    });

    setRequestingTier(null);

    if (error) {
      toast({ title: "Error", description: "Failed to send request. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Request sent to Admin", description: `Your request to switch to ${tierName} has been logged.` });
    }
  };

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

        <main className="container mx-auto px-4 py-6 space-y-8">
          {/* Current Subscription Summary */}
          {subscription && (
            <div className="p-5 rounded-2xl bg-card/50 border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-secondary" />
                <h2 className="font-display font-semibold text-foreground">Active Plan</h2>
                <span className="ml-auto px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs font-medium">
                  Active
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Plan</p>
                  <p className="text-foreground font-medium capitalize">{subscription.tier}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Amount</p>
                  <p className="text-foreground font-medium">R{subscription.amount}/mo</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Next billing</p>
                  <p className="text-foreground font-medium">
                    {subscription.next_billing_date
                      ? format(new Date(subscription.next_billing_date), "MMM d")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tier Tiles */}
          <div>
            <h2 className="font-display font-semibold text-foreground mb-4">Choose Your Tier</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TIERS.map((tier) => {
                const Icon = tier.icon;
                const isCurrentTier = subscription?.tier?.toLowerCase() === tier.name.toLowerCase();
                return (
                  <div
                    key={tier.name}
                    className={`relative p-5 rounded-[20px] bg-gradient-to-br ${tier.accent} border backdrop-blur-sm transition-all hover:scale-[1.02]`}
                  >
                    {tier.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">
                        Popular
                      </span>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-xl ${tier.badgeBg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-foreground">{tier.name}</h3>
                        <p className="text-muted-foreground text-xs">{tier.price}/month</p>
                      </div>
                    </div>
                    <ul className="space-y-1.5 mb-4">
                      {tier.features.map((f) => (
                        <li key={f} className="text-muted-foreground text-xs flex items-center gap-1.5">
                          <span className={`w-1 h-1 rounded-full ${tier.iconColor} bg-current`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      size="sm"
                      variant={isCurrentTier ? "secondary" : "outline"}
                      className="w-full"
                      disabled={isCurrentTier || requestingTier === tier.name}
                      onClick={() => handleRequestTierChange(tier.name)}
                    >
                      {requestingTier === tier.name ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isCurrentTier ? (
                        "Current Plan"
                      ) : (
                        "Request Tier Change"
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => setCoinModalOpen(true)}
            >
              <Coins className="w-4 h-4" />
              Add Coins
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

      {/* Add Coins Modal */}
      <Dialog open={coinModalOpen} onOpenChange={setCoinModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-secondary" />
              Purchase Coins
            </DialogTitle>
            <DialogDescription>Select a coin amount to top up your wallet.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {COIN_AMOUNTS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setCoinModalOpen(false);
                  toast({ title: "Coming soon", description: `${opt.label} purchase launching soon.` });
                }}
                className="p-4 rounded-xl border border-border/50 bg-card/50 hover:border-secondary/50 transition-all text-center"
              >
                <Coins className="w-6 h-6 text-secondary mx-auto mb-2" />
                <p className="text-foreground font-semibold">{opt.label}</p>
                <p className="text-muted-foreground text-xs">{opt.price}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Billing;
