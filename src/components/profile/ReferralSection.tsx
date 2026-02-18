import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ReferralSectionProps {
  referralCode: string | null;
  referralCount: number;
  diaryPoints: number;
}

const ReferralSection = ({ referralCode, referralCount, diaryPoints }: ReferralSectionProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!referralCode) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral code copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-8 p-5 rounded-2xl border border-border/50 bg-card/30">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-secondary" />
        <h3 className="font-display font-semibold text-foreground">Referral Program</h3>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/30 mb-4">
        <code className="text-foreground font-mono font-bold tracking-wider">{referralCode}</code>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="shrink-0">
          {copied ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 rounded-xl bg-secondary/5 border border-secondary/20">
          <p className="text-lg font-bold text-foreground">{referralCount}</p>
          <p className="text-xs text-muted-foreground">Total Referrals</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-gold/5 border border-gold/20">
          <p className="text-lg font-bold text-gold">{diaryPoints}</p>
          <p className="text-xs text-muted-foreground">Points Earned</p>
        </div>
      </div>
    </div>
  );
};

export default ReferralSection;
