import TierCard from "@/components/TierCard";
import { useToast } from "@/hooks/use-toast";

const tiers = [
  {
    name: "Essential",
    price: 299,
    description: "Perfect for the curious connoisseur",
    features: [
      "Monthly curated product sample",
      "Access to member-only drops",
      "Community forum access",
      "Digital content library",
      "Monthly newsletter",
    ],
  },
  {
    name: "Elite",
    price: 599,
    description: "For the dedicated enthusiast",
    features: [
      "Everything in Essential",
      "Full-size monthly product kit",
      "Exclusive music playlist access",
      "Priority customer support",
      "Early access to new products",
      "Member events invitations",
    ],
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Private",
    price: 1499,
    description: "The ultimate Alpha experience",
    features: [
      "Everything in Elite",
      "Premium luxury product kit",
      "Quarterly limited edition drops",
      "Personal lifestyle concierge",
      "VIP event access",
      "Custom product requests",
      "Private community access",
    ],
  },
];

const TierSection = () => {
  const { toast } = useToast();

  const handleSelectTier = (tierName: string) => {
    toast({
      title: "Age Verification Required",
      description: `You must be 18+ to join ${tierName}. Full signup coming soon!`,
    });
  };

  return (
    <section id="tiers" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-radial from-secondary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <span className="inline-block text-secondary text-sm font-medium tracking-[0.3em] uppercase mb-4">
            Memberships
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Choose Your
            <span className="text-gradient-sage"> Experience</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every tier unlocks a world of curated products, exclusive content, 
            and community access. Start your journey today.
          </p>
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, index) => (
            <div 
              key={tier.name}
              className="animate-fade-up opacity-0"
              style={{ animationDelay: `${(index + 1) * 150}ms`, animationFillMode: 'forwards' }}
            >
              <TierCard
                {...tier}
                onSelect={() => handleSelectTier(tier.name)}
              />
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm">
            All memberships include free shipping within South Africa. 
            Cancel anytime. Must be 18+ to join.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TierSection;
