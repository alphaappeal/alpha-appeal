import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, ShoppingBag, Home, Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoLight from "@/assets/alpha-logo-light.png";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestOrder = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      // Fetch the most recent order for this user
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        // Update status to paid (PayFast returned user here)
        await supabase
          .from("orders")
          .update({ payment_status: "paid", paid_at: new Date().toISOString() })
          .eq("id", data.id)
          .eq("payment_status", "pending");

        setOrderDetails({ ...data, payment_status: "paid" });
      }
      setLoading(false);
    };

    fetchLatestOrder();
  }, []);

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
        <title>Order Confirmed | Alpha</title>
        <meta name="description" content="Your Alpha order has been confirmed." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 md:p-6 border-b border-border/50">
          <div className="container mx-auto flex items-center justify-center">
            <Link to="/">
              <img src={logoLight} alt="Alpha" className="h-8" />
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-secondary" />
            </div>

            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground mb-8">
              Thank you for your purchase. Your order is being processed.
            </p>

            {orderDetails && (
              <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 mb-8 text-left">
                <h2 className="font-display text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                  Order Details
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Order Number</span>
                    <span className="text-foreground font-mono text-sm">{orderDetails.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Amount</span>
                    <span className="text-secondary font-bold">R{Number(orderDetails.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Status</span>
                    <span className="text-secondary font-medium capitalize">{orderDetails.payment_status}</span>
                  </div>
                  {orderDetails.product_name && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Item</span>
                      <span className="text-foreground text-sm">{orderDetails.product_name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button variant="sage" size="lg" className="w-full" asChild>
                <Link to="/deliveries">
                  <Truck className="w-4 h-4 mr-2" />
                  Track Delivery
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link to="/shop">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
              <Button variant="ghost" size="lg" className="w-full" asChild>
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default CheckoutSuccess;
