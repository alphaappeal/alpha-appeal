import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import alphaLogo from "@/assets/alpha-logo-light.png";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={alphaLogo} 
              alt="Alpha Appeal" 
              className="h-8 md:h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#tiers" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Membership
            </a>
            <a href="#philosophy" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Philosophy
            </a>
            <a href="#community" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Community
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="sage" size="sm">
                Join Alpha
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/30 animate-fade-in">
            <nav className="flex flex-col gap-4">
              <a 
                href="#tiers" 
                className="text-foreground py-2 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Membership
              </a>
              <a 
                href="#philosophy" 
                className="text-foreground py-2 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Philosophy
              </a>
              <a 
                href="#community" 
                className="text-foreground py-2 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Community
              </a>
              <div className="flex gap-3 pt-4 border-t border-border/30">
                <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">Sign In</Button>
                </Link>
                <Link to="/signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="sage" className="w-full">Join Alpha</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
