import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CreditCard, Shield, Lock } from "lucide-react";
import logoLight from "@/assets/alpha-logo-light.png";
import { Link } from "react-router-dom";

const tiers: Record<string, { name: string; price: number; promoPrice?: number; payfastLink: string }> = {
  essential: {
    name: "Essential",
    price: 99,
    payfastLink: "https://payf.st/eot4j",
  },
  elite: {
    name: "Elite",
    price: 499,
    promoPrice: 99,
    payfastLink: "",
  },
};

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const tier = searchParams.get("tier") as keyof typeof tiers;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate(`/signup?tier=${tier}`);
        return;
      }
      setUser(session.user);
      setLoading(false);
    };
    checkUser();
  }, [navigate, tier]);

  const tierData = tiers[tier];

  if (!tierData) {
    navigate("/");
    return null;
  }

  const handlePayment = () => {
    // Redirect to Payfast
    if (tierData.payfastLink) {
      window.location.href = tierData.payfastLink;
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
        <title>Checkout | Alpha {tierData.name}</title>
        <meta name="description" content={`Complete your Alpha ${tierData.name} membership payment.`} />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="p-4 md:p-6 border-b border-border/50">
          <div className="container mx-auto flex items-center justify-center">
            <Link to="/">
              <img src={logoLight} alt="Alpha" className="h-8" />
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-4 pb-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Complete Your Order
              </h1>
              <p className="text-muted-foreground">
                Secure checkout powered by PayFast
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 md:p-8">
              {/* Order Summary */}
              <div className="border-b border-border/50 pb-6 mb-6">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                  Order Summary
                </h2>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-foreground font-medium">Alpha {tierData.name}</p>
                    <p className="text-muted-foreground text-sm">Monthly Subscription</p>
                  </div>
                  <div className="text-right">
                    {tierData.promoPrice ? (
                      <>
                        <p className="text-foreground font-bold text-xl">R{tierData.promoPrice}</p>
                        <p className="text-muted-foreground text-xs line-through">R{tierData.price}/mo</p>
                        <p className="text-secondary text-xs">First month only</p>
                      </>
                    ) : (
                      <p className="text-foreground font-bold text-xl">R{tierData.price}/mo</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Badges */}
              <div className="flex items-center justify-center gap-6 mb-6 py-4 bg-muted/30 rounded-xl">
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

              {/* Payment Button */}
              <Button
                variant="sage"
                size="lg"
                className="w-full"
                onClick={handlePayment}
                disabled={!tierData.payfastLink}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {tierData.payfastLink ? "Pay Now with PayFast" : "Payment Coming Soon"}
              </Button>

              {!tierData.payfastLink && (
                <p className="text-center text-muted-foreground text-sm mt-4">
                  Payment integration is being configured. Please check back soon.
                </p>
              )}
            </div>

            <div className="text-center mt-6">
              <p className="text-xs text-muted-foreground">
                By completing this purchase, you agree to our{" "}
                <Link to="/terms" className="text-secondary hover:underline">Terms & Conditions</Link>.
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Checkout;
