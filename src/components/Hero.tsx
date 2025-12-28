import { Button } from "@/components/ui/button";
import { ArrowDown, Play } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20 md:pt-0">
        <div className="max-w-4xl mx-auto text-center">
          {/* Tagline */}
          <div className="animate-fade-up opacity-0 animation-delay-100">
            <span className="inline-block text-secondary text-sm md:text-base font-medium tracking-[0.3em] uppercase mb-6">
              A Full-Sensory Lifestyle Movement
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="animate-fade-up opacity-0 animation-delay-200 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Live with Intention.
            <span className="block text-gradient-sage">Move with Culture.</span>
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-up opacity-0 animation-delay-300 text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Art you can wear. Music you can live in. Culture you can feel.
            Join South Africa's most intentional lifestyle community.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up opacity-0 animation-delay-400 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <a href="#tiers">Join Alpha</a>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <a href="#how-it-works">
                <Play className="w-4 h-4 mr-2" />
                How It Works
              </a>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="animate-fade-up opacity-0 animation-delay-500 mt-16 flex items-center justify-center gap-8 md:gap-12">
            <div className="text-center">
              <div className="font-display text-2xl md:text-3xl font-bold text-foreground">2,500+</div>
              <div className="text-muted-foreground text-xs md:text-sm">Members</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <div className="font-display text-2xl md:text-3xl font-bold text-foreground">18+</div>
              <div className="text-muted-foreground text-xs md:text-sm">Only</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <div className="font-display text-2xl md:text-3xl font-bold text-foreground">SA</div>
              <div className="text-muted-foreground text-xs md:text-sm">Exclusive</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <a 
            href="#how-it-works" 
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-secondary transition-colors"
          >
            <span className="text-xs tracking-widest uppercase">Explore</span>
            <ArrowDown className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
