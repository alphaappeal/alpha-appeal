import { UserPlus, Layers, Package } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Join the Movement",
    description: "Create your account and become part of the Alpha community in under 2 minutes.",
  },
  {
    icon: Layers,
    title: "Choose Your Tier",
    number: "02",
    description: "Select the experience that fits your lifestyle. Free, Essential, Elite, or Private.",
  },
  {
    icon: Package,
    number: "03",
    title: "Receive & Experience",
    description: "Monthly curated kits, exclusive content, and VIP access delivered to your door.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-secondary text-sm font-medium tracking-[0.3em] uppercase mb-4">
            Simple & Seamless
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            How It
            <span className="text-gradient-sage"> Works</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative text-center group animate-fade-up opacity-0"
              style={{ animationDelay: `${(index + 1) * 150}ms`, animationFillMode: 'forwards' }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-secondary/50 to-transparent" />
              )}
              
              {/* Step Number */}
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-card border border-border/50 group-hover:border-secondary/50 transition-all duration-500 mb-6 relative">
                <step.icon className="w-10 h-10 text-secondary" />
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary text-secondary-foreground text-sm font-bold flex items-center justify-center">
                  {step.number}
                </span>
              </div>

              <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
