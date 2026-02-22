import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CreditCard, Shield, Lock, ArrowLeft } from "lucide-react";
import logoLight from "@/assets/alpha-logo-light.png";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payfastData, setPayfastData] = useState<Record<string, string> | null>(null);
  const [payfastUrl, setPayfastUrl] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  const cart: CartItem[] = (location.state as any)?.cart || [];
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (cart.length === 0) {
      navigate("/shop");
      return;
    }
    setLoading(false);
  }, [cart, navigate]);

  const handleCheckout = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login", { state: { redirect: "/shop" } });
        return;
      }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const baseUrl = window.location.origin;

      const response = await supabase.functions.invoke("create-payfast-checkout", {
        body: {
          items: cart.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          return_url: `${baseUrl}/checkout/success`,
          cancel_url: `${baseUrl}/shop`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Checkout failed");
      }

      const data = response.data;
      setPayfastUrl(data.payfast_url);
      setPayfastData(data.payfast_data);
      setOrderNumber(data.order_number);

      // Auto-submit the form after state updates
      setTimeout(() => {
        formRef.current?.submit();
      }, 100);
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
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
        <title>Checkout | Alpha</title>
        <meta name="description" content="Complete your Alpha purchase securely with PayFast." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="p-4 md:p-6 border-b border-border/50">
          <div className="container mx-auto flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link to="/">
              <img src={logoLight} alt="Alpha" className="h-8" />
            </Link>
            <div className="w-5" />
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 flex items-start justify-center p-4 pt-8 pb-12">
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Checkout</h1>
              <p className="text-muted-foreground">Review your order & pay securely</p>
            </div>

            {/* Order Summary */}
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 mb-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-foreground font-medium text-sm">{item.name}</p>
                      <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-foreground font-semibold text-sm">
                      R{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border/50">
                <span className="text-foreground font-bold text-lg">Total</span>
                <span className="text-secondary font-bold text-xl">R{cartTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Security Badges */}
            <div className="flex items-center justify-center gap-6 mb-6 py-4 bg-card/30 rounded-xl border border-border/30">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Lock className="w-4 h-4" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Shield className="w-4 h-4" />
                <span>Protected</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <CreditCard className="w-4 h-4" />
                <span>PayFast</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm text-center">
                {error}
              </div>
            )}

            {/* Pay Button */}
            <Button
              variant="sage"
              size="lg"
              className="w-full py-6 text-lg"
              onClick={handleCheckout}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay R{cartTotal.toLocaleString()} with PayFast
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              By completing this purchase, you agree to our{" "}
              <Link to="/legal" className="text-secondary hover:underline">Terms & Conditions</Link>.
            </p>
          </div>
        </main>
      </div>

      {/* Hidden PayFast form for Simple Integration */}
      {payfastData && payfastUrl && (
        <form ref={formRef} action={payfastUrl} method="POST" className="hidden">
          {Object.entries(payfastData).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        </form>
      )}
    </>
  );
};

export default Checkout;
