import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Alpha has completely changed how I approach my daily rituals. The quality is unmatched.",
    author: "Themba M.",
    role: "Elite Member",
    location: "Johannesburg",
  },
  {
    quote: "The community aspect is what keeps me coming back. It's more than products, it's a lifestyle.",
    author: "Sarah K.",
    role: "Essential Member",
    location: "Cape Town",
  },
  {
    quote: "From the unboxing experience to the curated playlists, every detail is intentional.",
    author: "Michael O.",
    role: "Private Member",
    location: "Durban",
  },
];

const featuredIn = [
  { name: "GQ South Africa", opacity: "opacity-40" },
  { name: "Vogue", opacity: "opacity-30" },
  { name: "Highsnobiety", opacity: "opacity-40" },
  { name: "Complex", opacity: "opacity-35" },
];

const SocialProof = () => {
  return (
    <section className="py-20 md:py-28 bg-card/30 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Featured In */}
        <div className="text-center mb-16">
          <span className="text-muted-foreground text-sm uppercase tracking-widest mb-8 block">
            Featured In
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {featuredIn.map((brand) => (
              <span
                key={brand.name}
                className={`font-display text-xl md:text-2xl text-foreground ${brand.opacity} hover:opacity-60 transition-opacity`}
              >
                {brand.name}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-24 h-px bg-border mx-auto mb-16" />

        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            What Our Members Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Join thousands of lifestyle enthusiasts who've elevated their daily experience.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative p-6 md:p-8 rounded-2xl bg-card/50 border border-border/30 backdrop-blur-sm hover:border-secondary/30 transition-all duration-500 animate-fade-up opacity-0"
              style={{ animationDelay: `${(index + 1) * 150}ms`, animationFillMode: 'forwards' }}
            >
              <Quote className="w-8 h-8 text-secondary/30 mb-4" />
              
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>

              <p className="text-foreground/90 text-sm md:text-base leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </p>

              <div className="border-t border-border/30 pt-4">
                <div className="font-medium text-foreground">{testimonial.author}</div>
                <div className="text-muted-foreground text-sm">
                  {testimonial.role} • {testimonial.location}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { value: "2,500+", label: "Active Members" },
            { value: "98%", label: "Satisfaction Rate" },
            { value: "12K+", label: "Kits Delivered" },
          ].map((stat, index) => (
            <div key={index} className="text-center p-4">
              <div className="font-display text-2xl md:text-4xl font-bold text-gradient-sage mb-1">
                {stat.value}
              </div>
              <div className="text-muted-foreground text-xs md:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
