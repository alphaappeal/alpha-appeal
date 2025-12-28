import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";

interface TierCardProps {
  name: string;
  price: number | null;
  originalPrice?: number;
  promoPrice?: number;
  promoText?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  ctaText?: string;
  isApplication?: boolean;
  onSelect: () => void;
}

const TierCard = ({
  name,
  price,
  originalPrice,
  promoPrice,
  promoText,
  description,
  features,
  highlighted = false,
  badge,
  ctaText = "Select",
  isApplication = false,
  onSelect,
}: TierCardProps) => {
  return (
    <div
      className={cn(
        "relative rounded-2xl p-6 md:p-8 transition-all duration-500 group flex flex-col h-full",
        "border backdrop-blur-xl",
        highlighted
          ? "bg-card/80 border-secondary border-glow-sage scale-[1.02] md:scale-105 z-10"
          : isApplication
          ? "bg-gradient-to-br from-gold/10 to-card/80 border-gold/50 hover:border-gold"
          : "bg-card/40 border-border/50 hover:border-secondary/50 hover:bg-card/60"
      )}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-secondary text-secondary-foreground text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
            {badge}
          </span>
        </div>
      )}

      {isApplication && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gold text-gold-foreground text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
            <Crown className="w-3 h-3" />
            Exclusive
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className={cn(
          "font-display text-2xl md:text-3xl font-semibold mb-2",
          isApplication ? "text-gradient-gold" : "text-foreground"
        )}>
          {name}
        </h3>
        <p className="text-muted-foreground text-sm md:text-base">{description}</p>
      </div>

      <div className="text-center mb-8">
        {price === null ? (
          <div className="py-4">
            <span className="font-display text-2xl md:text-3xl font-semibold text-gold">
              By Application
            </span>
          </div>
        ) : price === 0 ? (
          <div className="flex items-baseline justify-center gap-1">
            <span className={cn(
              "font-display font-bold text-4xl md:text-5xl text-foreground"
            )}>
              Free
            </span>
          </div>
        ) : (
          <>
            {promoPrice && (
              <div className="mb-2">
                <span className="text-secondary text-sm font-medium">{promoText}</span>
              </div>
            )}
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-muted-foreground text-lg">R</span>
              <span className={cn(
                "font-display font-bold",
                highlighted ? "text-5xl md:text-6xl text-gradient-sage" : "text-4xl md:text-5xl text-foreground"
              )}>
                {price}
              </span>
            </div>
            <span className="text-muted-foreground text-sm">/month</span>
          </>
        )}
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-sm md:text-base">
            <div className={cn(
              "rounded-full p-1 mt-0.5 shrink-0",
              highlighted ? "bg-secondary/20" : isApplication ? "bg-gold/20" : "bg-muted"
            )}>
              <Check className={cn(
                "w-3 h-3",
                highlighted ? "text-secondary" : isApplication ? "text-gold" : "text-muted-foreground"
              )} />
            </div>
            <span className="text-foreground/90">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={highlighted ? "sage" : isApplication ? "gold" : "glass"}
        size="lg"
        className="w-full mt-auto"
        onClick={onSelect}
      >
        {ctaText}
      </Button>
    </div>
  );
};

export default TierCard;
