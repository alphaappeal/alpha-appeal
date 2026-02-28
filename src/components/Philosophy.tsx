import { Leaf, Music, Users, Sparkles } from "lucide-react";

const values = [
  {
    icon: Leaf,
    title: "Elevated Quality",
    description: "We source only the finest products, ensuring every item meets our exacting standards of quality and craftsmanship.",
  },
  {
    icon: Music,
    title: "Cultural Connection",
    description: "Music, art, and lifestyle converge in our curated experiences. We celebrate the culture that inspires us.",
  },
  {
    icon: Users,
    title: "Community First",
    description: "More than a brand, we're a movement. Connect with like-minded individuals who share your values.",
  },
  {
    icon: Sparkles,
    title: "Premium Experience",
    description: "From unboxing to everyday use, every touchpoint is designed to deliver an exceptional experience.",
  },
];

const Philosophy = () => {
  return (
    <section id="philosophy-section" className="py-20 md:py-32 bg-card/50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <span className="inline-block text-gold text-sm font-medium tracking-[0.3em] uppercase mb-4">
            Our Philosophy
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            More Than a Brand,
            <span className="text-gradient-gold"> A Lifestyle</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Alpha Appeal isn't just about products. It's about elevating every aspect 
            of your daily ritual into something extraordinary.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {values.map((value, index) => (
            <div
              key={value.title}
              className="group p-6 md:p-8 rounded-2xl bg-glass border border-border/30 hover:border-secondary/50 transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
                <value.icon className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {value.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        {/* Quote Section */}
        <div className="mt-20 md:mt-28 max-w-4xl mx-auto text-center">
          <blockquote className="relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-6xl text-secondary/20 font-display">
              "
            </div>
            <p className="font-display text-2xl md:text-3xl lg:text-4xl font-medium text-foreground leading-relaxed italic">
              We don't just sell products. We curate experiences that 
              <span className="text-gradient-sage"> inspire a lifestyle</span> of intention and elevation.
            </p>
            <footer className="mt-8">
              <div className="text-foreground font-medium">The Alpha Team</div>
              <div className="text-muted-foreground text-sm">Johannesburg, South Africa</div>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
};

export default Philosophy;
