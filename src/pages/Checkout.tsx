import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CreditCard, Shield, Lock, ArrowLeft, Coins } from "lucide-react";
import logoLight from "@/assets/alpha-logo-light.png";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface WalletData {
  credit_balance: number;
  token_balance: number;
}

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payfastData, setPayfastData] = useState<Record<string, string> | null>(null);
  const [payfastUrl, setPayfastUrl] = useState("");
  const [wallet, setWallet] = useState<WalletData>({ credit_balance: 0, token_balance: 0 });
  const [useCoins, setUseCoins] = useState(false);
  const [useCredits, setUseCredits] = useState(false);

  const cart: CartItem[] = (location.state as any)?.cart || [];
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Compute deductions
  const coinDeduction = useCoins ? Math.min(wallet.token_balance, cartTotal) : 0;
  const remainingAfterCoins = cartTotal - coinDeduction;
  const creditDeduction = useCredits ? Math.min(wallet.credit_balance, remainingAfterCoins) : 0;
  const finalAmount = remainingAfterCoins - creditDeduction;

  useEffect(() => {
    if (cart.length === 0) {
      navigate("/shop");
      return;
    }

    const loadWallet = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from("user_wallet")
          .select("credit_balance, token_balance")
          .eq("user_id", session.user.id)
          .single();
        if (data) setWallet(data);
      }
      setLoading(false);
    };
    loadWallet();
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

      // If fully covered by balance, create order directly without PayFast
      if (finalAmount <= 0) {
        // Deduct balances atomically via edge function or direct updates
        if (coinDeduction > 0) {
          await supabase
            .from("user_wallet")
            .update({ token_balance: wallet.token_balance - coinDeduction })
            .eq("user_id", session.user.id);
        }
        if (creditDeduction > 0) {
          await supabase
            .from("user_wallet")
            .update({ credit_balance: wallet.credit_balance - creditDeduction })
            .eq("user_id", session.user.id);
        }

        // Create order
        const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
        const { data: order, error: orderErr } = await supabase.from("orders").insert({
          user_id: session.user.id,
          order_number: orderNumber,
          amount: cartTotal,
          payment_status: "completed",
          payment_method: "wallet",
          order_type: "one_time",
          product_name: cart.map((i) => i.name).join(", "),
          paid_at: new Date().toISOString(),
        }).select("id").single();

        if (orderErr) throw new Error(orderErr.message);

        // Insert order items (triggers stock decrement)
        if (order) {
          await supabase.from("order_items").insert(
            cart.map((item) => ({
              order_id: order.id,
              product_id: item.id,
              quantity: item.quantity,
              price_at_purchase: item.price,
            }))
          );
        }

        toast({ title: "Order placed! 🎉", description: `Order ${orderNumber} completed.` });
        navigate("/checkout/success", { state: { orderNumber } });
        return;
      }

      // PayFast flow for remaining amount
      const baseUrl = window.location.origin;
      const response = await supabase.functions.invoke("create-payfast-checkout", {
        body: {
          items: cart.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          coin_deduction: coinDeduction,
          credit_deduction: creditDeduction,
          final_amount: finalAmount,
          return_url: `${baseUrl}/checkout/success`,
          cancel_url: `${baseUrl}/shop`,
        },
      });

      if (response.error) throw new Error(response.error.message || "Checkout failed");

      const data = response.data;
      setPayfastUrl(data.payfast_url);
      setPayfastData(data.payfast_data);

      setTimeout(() => { formRef.current?.submit(); }, 100);
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
        <meta name="description" content="Complete your Alpha purchase securely." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 md:p-6 border-b border-border/50">
          <div className="container mx-auto flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link to="/"><img src={logoLight} alt="Alpha" className="h-8" /></Link>
            <div className="w-5" />
          </div>
        </header>

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
                    <p className="text-foreground font-semibold text-sm">R{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border/50">
                <span className="text-foreground font-bold text-lg">Subtotal</span>
                <span className="text-foreground font-bold text-lg">R{cartTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Balance Section */}
            {(wallet.token_balance > 0 || wallet.credit_balance > 0) && (
              <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 mb-6 space-y-4">
                <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                  <Coins className="w-5 h-5 text-secondary" /> Apply Balance
                </h2>

                {wallet.token_balance > 0 && (
                  <label className="flex items-center justify-between p-3 rounded-xl border border-border/30 cursor-pointer hover:bg-muted/20">
                    <div>
                      <p className="text-foreground text-sm font-medium">Use Coins</p>
                      <p className="text-muted-foreground text-xs">{wallet.token_balance} coins available</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={useCoins}
                      onChange={(e) => setUseCoins(e.target.checked)}
                      className="w-5 h-5 accent-secondary"
                    />
                  </label>
                )}

                {wallet.credit_balance > 0 && (
                  <label className="flex items-center justify-between p-3 rounded-xl border border-border/30 cursor-pointer hover:bg-muted/20">
                    <div>
                      <p className="text-foreground text-sm font-medium">Use Account Credit</p>
                      <p className="text-muted-foreground text-xs">R{wallet.credit_balance} available</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={useCredits}
                      onChange={(e) => setUseCredits(e.target.checked)}
                      className="w-5 h-5 accent-secondary"
                    />
                  </label>
                )}

                {(coinDeduction > 0 || creditDeduction > 0) && (
                  <div className="space-y-1 pt-2 border-t border-border/30 text-sm">
                    {coinDeduction > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Coin Deduction</span>
                        <span className="text-secondary">-R{coinDeduction.toLocaleString()}</span>
                      </div>
                    )}
                    {creditDeduction > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Credit Deduction</span>
                        <span className="text-secondary">-R{creditDeduction.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-foreground font-bold pt-2">
                      <span>Amount Due</span>
                      <span className="text-secondary">R{finalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security Badges */}
            <div className="flex items-center justify-center gap-6 mb-6 py-4 bg-card/30 rounded-xl border border-border/30">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Lock className="w-4 h-4" /><span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Shield className="w-4 h-4" /><span>Protected</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <CreditCard className="w-4 h-4" /><span>PayFast</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <Button variant="sage" size="lg" className="w-full py-6 text-lg" onClick={handleCheckout} disabled={submitting}>
              {submitting ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processing...</>
              ) : finalAmount <= 0 ? (
                <><Coins className="w-5 h-5 mr-2" />Pay with Balance</>
              ) : (
                <><CreditCard className="w-5 h-5 mr-2" />Pay R{finalAmount.toLocaleString()} with PayFast</>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              By completing this purchase, you agree to our{" "}
              <Link to="/legal" className="text-secondary hover:underline">Terms & Conditions</Link>.
            </p>
          </div>
        </main>
      </div>

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
