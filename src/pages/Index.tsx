import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import TierSection from "@/components/TierSection";
import SocialProof from "@/components/SocialProof";
import Philosophy from "@/components/Philosophy";
import MemberNetwork from "@/components/MemberNetwork";
import Footer from "@/components/Footer";
import ConsentModal from "@/components/ConsentModal";
import { Store, ArrowRight } from "lucide-react";

const Index = () => {
  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        navigate("/profile", { replace: true });
      } else {
        setChecking(false);
      }
    };
    checkAuthAndSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (checking) return null;

  return (
    <>
      <Helmet>
        <title>Alpha Appeal | Live with Intention. Move with Culture.</title>
          <meta 
            name="description" 
            content="Join the world's most intentional lifestyle movement. Art you can wear. Music you can live in. Culture you can feel. Premium curated experiences delivered monthly." 
          />
          <meta name="keywords" content="lifestyle, subscription, premium, luxury, music, fashion, wellness, culture, cannabis" />
        <meta property="og:title" content="Alpha Appeal | Premium Lifestyle Movement" />
        <meta property="og:description" content="Art you can wear. Music you can live in. Culture you can feel. Join the movement." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://alpha-appeal.co.za" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <HowItWorks />
          <TierSection />
          <MemberNetwork />
          <SocialProof />
          <Philosophy />
          
          {/* Vendor CTA Section */}
          <section className="py-20 bg-gradient-to-br from-secondary/5 via-card to-secondary/5 border-t border-border/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                  <Store className="w-10 h-10 text-secondary" />
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                  Partner With Alpha
                </h2>
                <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
                  Are you a cannabis retailer, wellness provider, or lifestyle brand? Join our network of verified partners and access thousands of engaged members.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  {isLoggedIn ? (
                    <Button variant="sage" size="lg" onClick={() => navigate("/vendor/signup")} className="gap-2">
                      <Store className="w-5 h-5" />
                      Apply for Vendor Access
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  ) : (
                    <>
                      <Button variant="sage" size="lg" onClick={() => navigate("/signup")} className="gap-2">
                        <Store className="w-5 h-5" />
                        Sign Up to Apply
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                      <Button variant="outline" size="lg" onClick={() => navigate("/vendor/signup")}>
                        Learn More
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-muted-foreground text-sm mt-6">
                  Already a vendor?{" "}
                  <a href="/vendor" className="text-secondary hover:underline font-medium">
                    Access Vendor Portal
                  </a>
                </p>
              </div>
            </div>
          </section>
        </main>
        <Footer />
        <ConsentModal />
      </div>
    </>
  );
};

export default Index;
