import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { 
  Package, 
  Music, 
  Users, 
  ShoppingBag, 
  Instagram, 
  Twitter, 
  ArrowRight,
  Sparkles,
  Calendar,
  Gift
} from "lucide-react";
import logoLight from "@/assets/alpha-logo-light.png";

const Welcome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);
  const [profile, setProfile] = useState<Tables<'users'> | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }
      // Returning users go straight to profile
      navigate("/profile");
      setUser(session.user);

      // Get profile
      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();
      
      setProfile(profileData);
    };
    getUser();
  }, [navigate]);

  const features = [
    {
      icon: Package,
      title: "Your First Kit",
      description: "Your curated kit is being prepared and will ship soon.",
      action: "Track Delivery",
      path: "/profile",
      color: "secondary",
    },
    {
      icon: Music,
      title: "Exclusive Playlists",
      description: "Curated sounds to elevate your daily rituals.",
      action: "Listen Now",
      path: "/music",
      color: "secondary",
    },
    {
      icon: ShoppingBag,
      title: "Member Shop",
      description: "Access exclusive drops and limited editions.",
      action: "Browse Shop",
      path: "/shop",
      color: "secondary",
    },
    {
      icon: Users,
      title: "Community",
      description: "Connect with like-minded lifestyle enthusiasts.",
      action: "Join Discussion",
      path: "/community",
      color: "secondary",
    },
  ];

  const upcomingEvents = [
    { date: "Jan 15", title: "New Drop: Winter Collection", type: "Drop" },
    { date: "Jan 22", title: "Virtual Wellness Session", type: "Event" },
    { date: "Feb 1", title: "February Kit Ships", type: "Kit" },
  ];

  return (
    <>
      <Helmet>
        <title>Welcome to Alpha | Your Journey Begins</title>
        <meta name="description" content="Welcome to Alpha. Explore your membership benefits." />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/">
              <img src={logoLight} alt="Alpha" className="h-7" />
            </Link>
            <div className="flex items-center gap-4">
              {profile && (
                <span className="text-sm text-muted-foreground">
                  {profile.subscription_tier && (
                    <span className="px-2 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium capitalize">
                      {profile.subscription_tier}
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Welcome Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 mb-6">
              <Sparkles className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Welcome to Alpha, {profile?.name?.split(" ")[0] || "Member"}
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Your journey into intentional living starts now. Here's what's waiting for you.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {features.map((feature, index) => (
              <button
                key={index}
                onClick={() => navigate(feature.path)}
                className="group p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-secondary/50 transition-all duration-300 text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {feature.description}
                </p>
                <span className="text-secondary text-sm font-medium">
                  {feature.action}
                </span>
              </button>
            ))}
          </div>

          {/* Upcoming Events */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary" />
                Coming Up
              </h2>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card/30 border border-border/30"
                >
                  <div className="text-center min-w-[60px]">
                    <span className="text-secondary font-medium text-sm">{event.date}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{event.title}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                    {event.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-4">Follow Alpha</p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://instagram.com/alpha"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-card/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-secondary hover:border-secondary/50 transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/alpha"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-card/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-secondary hover:border-secondary/50 transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    </>
  );
};

export default Welcome;
