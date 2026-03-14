import { Instagram, Twitter, Youtube } from "lucide-react";
import alphaLogo from "@/assets/alpha-logo-light.png";

const Footer = () => {
  return (
    <footer className="bg-card/80 border-t border-border/30 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <img 
              src={alphaLogo} 
              alt="Alpha Appeal" 
              className="h-8 w-auto mb-6"
            />
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              The premier cannabis lifestyle subscription. 
              Curated products, premium experiences.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-all"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Membership</h4>
            <ul className="space-y-3">
              <li><a href="#tiers" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Essential Tier</a></li>
              <li><a href="#tiers" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Elite Tier</a></li>
              <li><a href="#tiers" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Private Tier</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Gift a Membership</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#philosophy" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Our Story</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Contact Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Careers</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Press</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="/legal#terms" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Terms & Conditions</a></li>
              <li><a href="/legal#privacy" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="/legal#disclaimer" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Disclaimers</a></li>
              <li><a href="/legal#contact" className="text-muted-foreground hover:text-secondary transition-colors text-sm">Contact Legal</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Alpha Appeal. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-muted-foreground text-sm">
                🇿🇦 Made in South Africa
              </span>
              <span className="text-destructive/80 text-xs px-3 py-1 rounded-full border border-destructive/30 bg-destructive/10">
                21+ Only
              </span>
            </div>
          </div>
          <div className="text-center pt-4 border-t border-border/20">
            <p className="text-muted-foreground/60 text-xs">
              ⚠️ For Educational Purposes Only | Not Medical Advice | Cannabis laws vary by jurisdiction
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
