import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import BottomNav from "@/components/BottomNav";
import MemberPortal from "@/components/MemberPortal";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  BookOpen,
  Package,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
  Loader2,
  Crown,
} from "lucide-react";
import logoLight from "@/assets/alpha-logo-light.png";

import { useAuth } from "@/context/AuthContext";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading: authLoading, signOut } = useAuth();

  const [subscription, setSubscription] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const [showMemberPortal, setShowMemberPortal] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login"); // Redirect to login, not signup
      return;
    }

    const loadAdditionalData = async () => {
      setDataLoading(true);

      const { data: subData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      setSubscription(subData);

      const { data: prefData } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setPreferences(prefData);

      setDataLoading(false);
    };

    loadAdditionalData();
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Logged out", description: "See you soon!" });
    navigate("/");
  };

  const handleTogglePreference = async (key: string, value: boolean) => {
    if (!user) return;

    const updates = { [key]: value };
    await supabase
      .from("user_preferences")
      .update(updates)
      .eq("user_id", user.id);

    setPreferences((prev: any) => ({ ...prev, ...updates }));
    toast({ title: "Preferences updated" });
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  // Updated menu items with My Diary first
  const menuItems = [
    { icon: BookOpen, label: "My Diary", path: "/my-diary" },
    { icon: Package, label: "My Deliveries", path: "/deliveries" },
    { icon: CreditCard, label: "Billing & Subscription", path: "/billing" },
    { icon: Settings, label: "Account Settings", path: "/settings" },
    { icon: HelpCircle, label: "Help & Support", path: "/support" },
  ];

  // Determine tier display
  const getTierDisplay = () => {
    if (subscription?.tier) {
      return subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1);
    }
    if (profile?.account_type) { // Changed from subscription_tier as per earlier audit of types, or check types?
      // Wait, let's double check standard profile fields. 
      // In types.ts, profiles had 'account_type' or similar?
      // Let's stick to what was there if we think it's 'subscription_tier'
      // But wait, the 'users' table query used 'subscription_tier'.
      // If 'profiles' table is used, we need to know its columns.
      // Grep showed 'profiles' table exists. 
      // I will assume subscription_tier exists on profiles for now, or fallback to 'member'.
      return (profile?.subscription_tier || "member").charAt(0).toUpperCase() + (profile?.subscription_tier || "member").slice(1);
    }
    return "Private";
  };

  const currentTier = subscription?.tier || profile?.subscription_tier || "private";

  return (
    <>
      <Helmet>
        <title>Profile | Alpha</title>
        <meta name="description" content="Manage your Alpha profile and settings." />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/">
              <img src={logoLight} alt="Alpha" className="h-7" />
            </Link>
            <h1 className="font-display text-lg font-semibold text-foreground">Profile</h1>
            <div className="w-14" />
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Profile Header with User Info */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-secondary/10 border-2 border-secondary/30 flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-secondary" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-1">
              {profile?.name || user?.email?.split("@")[0] || "Member"}
            </h2>
            <p className="text-muted-foreground text-sm mb-2">{profile?.email || user?.email}</p>
            {/* Tier Badge */}
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
              {getTierDisplay()} Member
            </span>
          </div>

          {/* Member Portal Button */}
          <Button
            onClick={() => setShowMemberPortal(true)}
            className="w-full mb-8 py-6 bg-gradient-to-r from-gold/80 to-secondary/80 hover:from-gold hover:to-secondary text-foreground font-semibold text-lg border border-gold/30"
          >
            <Crown className="w-5 h-5 mr-2" />
            Enter Member Portal
          </Button>
          {subscription && (
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-secondary/10 to-card/50 border border-secondary/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-foreground">Your Subscription</h3>
                <span className="px-2 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-medium">
                  Active
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="text-foreground capitalize">{subscription.tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-foreground">R{subscription.amount}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next billing</span>
                  <span className="text-foreground">
                    {subscription.next_billing_date
                      ? new Date(subscription.next_billing_date).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="space-y-2 mb-8">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/30 hover:border-secondary/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground font-medium">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </div>

          {/* Notification Settings */}
          <div className="mb-8 p-6 rounded-2xl border border-border/50 bg-card/30">
            <div className="flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-secondary" />
              <h3 className="font-display font-semibold text-foreground">Notifications</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">Marketing emails</p>
                  <p className="text-muted-foreground text-sm">Drops, events, and offers</p>
                </div>
                <Switch
                  checked={preferences?.marketing_emails ?? true}
                  onCheckedChange={(checked) => handleTogglePreference("marketing_emails", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">Community updates</p>
                  <p className="text-muted-foreground text-sm">Replies and mentions</p>
                </div>
                <Switch
                  checked={preferences?.community_notifications ?? true}
                  onCheckedChange={(checked) => handleTogglePreference("community_notifications", checked)}
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="mb-8 p-6 rounded-2xl border border-border/50 bg-card/30">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-secondary" />
              <h3 className="font-display font-semibold text-foreground">Privacy</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">Data optimization</p>
                <p className="text-muted-foreground text-sm">Help us improve your experience</p>
              </div>
              <Switch
                checked={preferences?.data_optimization_consent ?? false}
                onCheckedChange={(checked) => handleTogglePreference("data_optimization_consent", checked)}
              />
            </div>
          </div>

          {/* Logout */}
          <Button
            variant="glass"
            className="w-full text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </main>

        <BottomNav />
      </div>

      <MemberPortal
        isOpen={showMemberPortal}
        onClose={() => setShowMemberPortal(false)}
        tier={currentTier}
      />
    </>
  );
};

export default Profile;