import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/integrations/supabase/client";
import alphaLogo from "@/assets/alpha-logo-light.png";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isAdmin, loading: adminLoading } = useAdminCheck();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
            <a href="#pricing-section" onClick={(e) => { e.preventDefault(); document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Membership
            </a>
            <a href="#philosophy-section" onClick={(e) => { e.preventDefault(); document.getElementById('philosophy-section')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Philosophy
            </a>
            <a href="#member-network-section" onClick={(e) => { e.preventDefault(); document.getElementById('member-network-section')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              Community
            </a>
            {!adminLoading && isAdmin && (
              <Link to="/admin" className="text-secondary hover:text-secondary/80 transition-colors text-sm font-medium flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <Link to="/welcome">
                <Button variant="sage" size="sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
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
              </>
            )}
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
                href="#pricing-section" 
                className="text-foreground py-2 font-medium"
                onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                Membership
              </a>
              <a 
                href="#philosophy-section" 
                className="text-foreground py-2 font-medium"
                onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); document.getElementById('philosophy-section')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                Philosophy
              </a>
              <a 
                href="#member-network-section" 
                className="text-foreground py-2 font-medium"
                onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); document.getElementById('member-network-section')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                Community
              </a>
              {!adminLoading && isAdmin && (
                <Link 
                  to="/admin" 
                  className="text-secondary py-2 font-medium flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
              <div className="flex gap-3 pt-4 border-t border-border/30">
                {isLoggedIn ? (
                  <Link to="/welcome" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="sage" className="w-full">Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">Sign In</Button>
                    </Link>
                    <Link to="/signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="sage" className="w-full">Join Alpha</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
