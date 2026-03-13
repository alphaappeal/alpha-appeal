import { useState } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PromoCodeInputProps {
  onValidCode: (code: string) => void;
  userId?: string;
}

const PromoCodeInput = ({ onValidCode, userId }: PromoCodeInputProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const { toast } = useToast();

  const validateCode = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setStatus("idle");

    try {
      // Check if code exists and is valid
      const { data: promoCode, error } = await supabase
        .from("promo_codes")
        .select("*")
        .ilike("code", code.trim())
        .eq("active", true)
        .maybeSingle();

      if (error) throw error;

      if (!promoCode) {
        setStatus("invalid");
        toast({
          title: "Invalid code",
          description: "This promo code doesn't exist or has expired.",
          variant: "destructive"
        });
        return;
      }

      // Check if code has uses remaining
      if (promoCode.current_uses >= promoCode.max_uses) {
        setStatus("invalid");
        toast({
          title: "Code exhausted",
          description: "This promo code has reached its maximum uses.",
          variant: "destructive"
        });
        return;
      }

      // Check if user already used this code
      if (userId) {
        const { data: existingRedemption } = await supabase
          .from("promo_code_redemptions")
          .select("id")
          .eq("user_id", userId)
          .ilike("promo_code", code.trim())
          .maybeSingle();

        if (existingRedemption) {
          setStatus("invalid");
          toast({
            title: "Already redeemed",
            description: "You've already used this promo code.",
            variant: "destructive"
          });
          return;
        }
      }

      setStatus("valid");
      toast({
        title: "Promo code accepted!",
        description: "You've unlocked private access to Alpha."
      });
      onValidCode(code.trim().toUpperCase());

    } catch (error: any) {
      console.error("Promo validation error:", error);
      setStatus("invalid");
      toast({
        title: "Error",
        description: "Failed to validate code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Enter promo code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setStatus("idle");
            }}
            className={`uppercase ${
              status === "valid" ? "border-secondary" : 
              status === "invalid" ? "border-destructive" : ""
            }`}
            disabled={loading || status === "valid"}
          />
          {status === "valid" && (
            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
          )}
          {status === "invalid" && (
            <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-destructive" />
          )}
        </div>
        <Button
          onClick={validateCode}
          disabled={loading || !code.trim() || status === "valid"}
          variant="sage"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
        </Button>
      </div>
      {status === "valid" && (
        <p className="text-sm text-secondary">✓ Code applied - private access unlocked.</p>
      )}
    </div>
  );
};

export default PromoCodeInput;