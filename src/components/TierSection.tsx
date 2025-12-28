import TierCard from "@/components/TierCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const tiers = [
  {
    name: "Free",
    price: 0,
    description: "Start your journey",
    features: [
      "Limited community access",
      "Preview content",
      "Email updates",
      "Public events calendar",
    ],
    ctaText: "Join Free",
    paymentType: "free" as const,
  },
  {
    name: "Essential",
    price: 99,
    description: "Curated lifestyle, monthly",
    features: [
      "Alpha Essential Kit monthly",
      "Curated lifestyle accessories",
      "Full community access",
      "Music playlists & drops",
      "Event previews",
      "Member-only content",
    ],
    highlighted: true,
    badge: "Most Popular",
    ctaText: "Get Essential",
    paymentType: "essential" as const,
    payfastLink: "https://payf.st/eot4j",
  },
  {
    name: "Elite",
    price: 499,
    originalPrice: 499,
    promoPrice: 99,
    promoText: "First month R99",
    description: "The ultimate Alpha experience",
    features: [
      "Everything in Essential",
      "Alpha Elite Experience kit",
      "Luxury-grade accessories",
      "Limited-edition fashion items",
      "VIP event access",
      "Priority drops",
      "Personal concierge",
    ],
    ctaText: "Go Elite",
    paymentType: "elite" as const,
  },
  {
    name: "Private",
    price: null,
    description: "By invitation only",
    features: [
      "Everything in Elite",
      "Exclusive private community",
      "Bespoke product requests",
      "Direct founder access",
      "Investment opportunities",
      "Private events",
    ],
    ctaText: "Apply for Access",
    paymentType: "private" as const,
    isApplication: true,
  },
];

const TierSection = () => {
  const navigate = useNavigate();

  const handleSelectTier = (tier: typeof tiers[0]) => {
    if (tier.paymentType === "free") {
      navigate("/signup?tier=free");
    } else if (tier.paymentType === "private") {
      navigate("/signup?tier=private&apply=true");
    } else {
      navigate(`/signup?tier=${tier.paymentType}`);
    }
  };

  return (
    <section id="tiers" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-radial from-secondary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <span className="inline-block text-secondary text-sm font-medium tracking-[0.3em] uppercase mb-4">
            Choose Your Path
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Join the
            <span className="text-gradient-sage"> Movement</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every tier unlocks curated experiences, exclusive content, 
            and access to a community that moves with intention.
          </p>
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {tiers.map((tier, index) => (
            <div 
              key={tier.name}
              className="animate-fade-up opacity-0"
              style={{ animationDelay: `${(index + 1) * 100}ms`, animationFillMode: 'forwards' }}
            >
              <TierCard
                {...tier}
                onSelect={() => handleSelectTier(tier)}
              />
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center space-y-2">
          <p className="text-muted-foreground text-sm">
            All memberships include free shipping within South Africa. Cancel anytime.
          </p>
          <p className="text-muted-foreground text-xs">
            By joining, you confirm you are 18+ and agree to our{" "}
            <a href="/terms" className="text-secondary hover:underline">Terms & Conditions</a>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TierSection;
