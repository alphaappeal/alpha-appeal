import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import BottomNav from "@/components/BottomNav";
import MemberPortal from "@/components/MemberPortal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  User, BookOpen, Package, CreditCard, Settings, LogOut,
  ChevronRight, Bell, Shield, HelpCircle, Loader2, Crown,
  Star, Leaf, Wallet, Users, Flame, Palette, BookHeart,
} from "lucide-react";
import logoLight from "@/assets/alpha-logo-light.png";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [showMemberPortal, setShowMemberPortal] = useState(false);
  const [starredStrains, setStarredStrains] = useState<any[]>([]);
  const [starredArt, setStarredArt] = useState<any[]>([]);
  const [starredCulture, setStarredCulture] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState({ code: "", count: 0 });

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }
      setUser(session.user);

      const [profileRes, subRes, walletRes] = await Promise.all([
        supabase.from("users").select("*").eq("id", session.user.id).maybeSingle(),
        supabase.from("subscriptions").select("*").eq("user_id", session.user.id).eq("status", "active").maybeSingle(),
        supabase.from("user_wallet").select("*").eq("user_id", session.user.id).maybeSingle(),
      ]);

      setProfile(profileRes.data);
      setSubscription(subRes.data);
      setWallet(walletRes.data);

      // Fetch starred strains
      const { data: strainInteractions } = await supabase
        .from("post_interactions")
        .select("strain_id")
        .eq("user_id", session.user.id)
        .eq("interaction_type", "star")
        .not("strain_id", "is", null);

      if (strainInteractions && strainInteractions.length > 0) {
        const strainIds = strainInteractions.map(i => i.strain_id).filter(Boolean) as string[];
        const { data: strains } = await supabase.from("strains").select("id, name, slug, type").in("id", strainIds);
        setStarredStrains(strains || []);
      }

      // Fetch starred art
      const { data: artInteractions } = await supabase
        .from("art_interactions")
        .select("post_id")
        .eq("user_id", session.user.id)
        .eq("interaction_type", "star");

      if (artInteractions && artInteractions.length > 0) {
        const artIds = artInteractions.map(i => i.post_id).filter(Boolean) as string[];
        const { data: arts } = await supabase.from("art_posts").select("id, title, artist_name").in("id", artIds);
        setStarredArt(arts || []);
      }

      // Fetch starred culture
      const { data: cultureInteractions } = await supabase
        .from("culture_interactions")
        .select("post_id")
        .eq("user_id", session.user.id)
        .eq("interaction_type", "star");

      if (cultureInteractions && cultureInteractions.length > 0) {
        const cultureIds = cultureInteractions.map(i => i.post_id).filter(Boolean) as string[];
        const { data: cultures } = await supabase.from("culture_posts").select("id, title, category").in("id", cultureIds);
        setStarredCulture(cultures || []);
      }

      // Fetch referral stats
      const { data: refCode } = await supabase.from("referral_codes").select("code").eq("user_id", session.user.id).eq("active", true).maybeSingle();
      const { count: refCount } = await supabase.from("referrals").select("id", { count: "exact", head: true }).eq("referrer_id", session.user.id);
      setReferralStats({ code: refCode?.code || "", count: refCount || 0 });

      setLoading(false);
    };
    loadProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out", description: "See you soon!" });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  const menuItems = [
    { icon: BookOpen, label: "My Diary", path: "/my-diary" },
    { icon: Package, label: "My Deliveries", path: "/deliveries" },
    { icon: CreditCard, label: "Billing & Subscription", path: "/billing" },
    { icon: Settings, label: "Account Settings", path: "/settings" },
    { icon: HelpCircle, label: "Help & Support", path: "/support" },
  ];

  const currentTier = subscription?.tier || profile?.tier || "promo";
  const getTierDisplay = () => {
    if (subscription?.tier) return subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1);
    if (profile?.tier) return profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1);
    return "Member";
  };

  return (
    <>
      <Helmet>
        <title>Profile | Alpha</title>
        <meta name="description" content="Manage your Alpha profile and settings." />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/"><img src={logoLight} alt="Alpha" className="h-7" /></Link>
            <h1 className="font-display text-lg font-semibold text-foreground">Profile</h1>
            <div className="w-14" />
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-secondary/10 border-2 border-secondary/30 flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-secondary" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-1">
              {profile?.full_name || profile?.username || user?.email?.split("@")[0] || "Member"}
            </h2>
            {profile?.username && <p className="text-muted-foreground text-sm mb-1">@{profile.username}</p>}
            <p className="text-muted-foreground text-sm mb-2">{profile?.email || user?.email}</p>
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
              {getTierDisplay()} Member
            </span>
            {profile?.concierge_eligible && (
              <span className="inline-block ml-2 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-medium">
                Concierge
              </span>
            )}
          </div>

          {/* Member Portal Button */}
          <Button onClick={() => setShowMemberPortal(true)} className="w-full mb-6 py-6 bg-gradient-to-r from-gold/80 to-secondary/80 hover:from-gold hover:to-secondary text-foreground font-semibold text-lg border border-gold/30">
            <Crown className="w-5 h-5 mr-2" />
            Enter Member Portal
          </Button>

          {/* Wallet & Diary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-card/50 border border-border/50 text-center">
              <Wallet className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">R{(wallet?.credit_balance || 0).toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Wallet Balance</p>
            </div>
            <div className="p-4 rounded-2xl bg-card/50 border border-border/50 text-center">
              <Flame className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">{profile?.streak_count || 0}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="p-4 rounded-2xl bg-card/50 border border-border/50 text-center">
              <Star className="w-6 h-6 text-gold mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">{profile?.diary_points || 0}</p>
              <p className="text-xs text-muted-foreground">Diary Points</p>
            </div>
            <div className="p-4 rounded-2xl bg-card/50 border border-border/50 text-center">
              <Users className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">{referralStats.count}</p>
              <p className="text-xs text-muted-foreground">Referrals</p>
            </div>
          </div>

          {/* Referral Code */}
          {referralStats.code && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-secondary/10 to-card/50 border border-secondary/30 text-center">
              <p className="text-sm text-muted-foreground mb-1">Your Referral Code</p>
              <p className="text-lg font-bold text-secondary font-mono">{referralStats.code}</p>
            </div>
          )}

          {/* Subscription Info */}
          {subscription && (
            <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-secondary/10 to-card/50 border border-secondary/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-foreground">Your Subscription</h3>
                <span className="px-2 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-medium">Active</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span className="text-foreground capitalize">{subscription.tier}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="text-foreground">R{subscription.amount}/month</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Next billing</span><span className="text-foreground">{subscription.next_billing_date ? new Date(subscription.next_billing_date).toLocaleDateString() : "N/A"}</span></div>
              </div>
            </div>
          )}

          {/* Starred Strains */}
          {starredStrains.length > 0 && (
            <StarredSection title="Starred Strains" icon={<Leaf className="w-5 h-5 text-secondary" />} items={starredStrains} onItemClick={(s) => navigate(`/strain/${s.slug || s.id}`)} getSubtext={(s) => s.type} />
          )}

          {/* Starred Art */}
          {starredArt.length > 0 && (
            <StarredSection title="Starred Art" icon={<Palette className="w-5 h-5 text-purple-400" />} items={starredArt} onItemClick={() => navigate("/community")} getSubtext={(a) => a.artist_name} />
          )}

          {/* Starred Culture */}
          {starredCulture.length > 0 && (
            <StarredSection title="Starred Culture" icon={<BookHeart className="w-5 h-5 text-pink-400" />} items={starredCulture} onItemClick={() => navigate("/community")} getSubtext={(c) => c.category} />
          )}

          {/* Menu Items */}
          <div className="space-y-2 mb-8">
            {menuItems.map((item) => (
              <button key={item.path} onClick={() => navigate(item.path)} className="w-full flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/30 hover:border-secondary/50 transition-all">
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground font-medium">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </div>

          {/* Logout */}
          <Button variant="glass" className="w-full text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </main>

        <BottomNav />
      </div>

      <MemberPortal isOpen={showMemberPortal} onClose={() => setShowMemberPortal(false)} tier={currentTier} />
    </>
  );
};

const StarredSection = ({ title, icon, items, onItemClick, getSubtext }: {
  title: string;
  icon: React.ReactNode;
  items: any[];
  onItemClick: (item: any) => void;
  getSubtext: (item: any) => string;
}) => (
  <div className="mb-6 p-6 rounded-2xl border border-border/50 bg-card/30">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h3 className="font-display font-semibold text-foreground">{title}</h3>
      <span className="text-xs text-muted-foreground">({items.length})</span>
    </div>
    <div className="space-y-2">
      {items.map((item) => (
        <button key={item.id} onClick={() => onItemClick(item)} className="w-full flex items-center justify-between p-3 rounded-lg border border-border/30 bg-card/20 hover:border-secondary/50 transition-all">
          <div className="flex items-center gap-3">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-foreground font-medium text-sm">{item.name || item.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground capitalize">{getSubtext(item)}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </button>
      ))}
    </div>
  </div>
);

export default Profile;
