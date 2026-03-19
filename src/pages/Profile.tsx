import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import BottomNav from "@/components/BottomNav";
import MemberPortal from "@/components/MemberPortal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfileData } from "@/hooks/useProfileData";
import ProfileHeader from "@/components/profile/ProfileHeader";
import GalaxyDashboard from "@/components/profile/GalaxyDashboard";
import ReferralSection from "@/components/profile/ReferralSection";
import DeliveriesPreview from "@/components/profile/DeliveriesPreview";
import {
  BookOpen,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
  Loader2,
  Crown,
  Store,
} from "lucide-react";
import { useStreakTracker } from "@/hooks/useStreakTracker";
import { useAdminAlerts } from "@/hooks/useAdminAlerts";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useVendorCheck } from "@/hooks/useVendorCheck";
import logoLight from "@/assets/alpha-logo-light.png";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    user, profile, subscription, preferences, wallet,
    referralCode, referralCount,
    starredStrains, starredArt, starredCulture, starredCultureItems,
    deliveries, loading, refreshWallet,
  } = useProfileData();
  const [showMemberPortal, setShowMemberPortal] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<any>(null);
  const { isAdmin } = useAdminCheck();
  const { isVendor, loading: vendorLoading } = useVendorCheck();

  const currentTier = subscription?.tier || profile?.tier || "private";

  // Track visit streak
  useStreakTracker(user?.id);

  // Admin alerts
  const { unreadCount: alertUnread, alerts: adminAlerts, markRead: markAlertRead } = useAdminAlerts(user?.id, currentTier);

  useEffect(() => {
    if (preferences) setLocalPrefs(preferences);
  }, [preferences]);

  const handleTogglePreference = async (key: string, value: boolean) => {
    if (!user) return;
    const updates = { [key]: value };
    await supabase.from("user_preferences").update(updates).eq("user_id", user.id);
    setLocalPrefs((prev: any) => ({ ...prev, ...updates }));
    toast({ title: "Preferences updated" });
  };

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

  // currentTier already declared above loading check

  const menuItems = [
    { icon: BookOpen, label: "My Diary", path: "/my-diary" },
    { icon: CreditCard, label: "Billing & Subscription", path: "/billing" },
    { icon: Settings, label: "Account Settings", path: "/settings" },
    { icon: HelpCircle, label: "Help & Support", path: "/support" },
  ];

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
            <button onClick={() => {}} className="relative p-2">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {alertUnread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {alertUnread > 9 ? "9+" : alertUnread}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Admin FAB rendered below via fixed position */}

          {/* Profile Header with Stats */}
          <ProfileHeader
            profile={profile}
            user={user}
            subscription={subscription}
            wallet={wallet}
            referralCount={referralCount}
          />

          {/* Member Portal Button */}
          <Button
            onClick={() => setShowMemberPortal(true)}
            className="w-full mb-8 py-6 bg-gradient-to-r from-gold/80 to-secondary/80 hover:from-gold hover:to-secondary text-foreground font-semibold text-lg border border-gold/30"
          >
            <Crown className="w-5 h-5 mr-2" />
            Enter Member Portal
          </Button>

          {/* Admin Alerts */}
          {adminAlerts.filter(a => !a.seen).length > 0 && (
            <div className="mb-8 space-y-2">
              {adminAlerts.filter(a => !a.seen).slice(0, 3).map((alert: any) => (
                <button
                  key={alert.id}
                  onClick={() => markAlertRead(alert.id)}
                  className="w-full text-left p-4 rounded-xl border border-gold/30 bg-gold/5 hover:bg-gold/10 transition-all"
                >
                  <p className="font-medium text-foreground text-sm">{alert.title}</p>
                  {alert.message && <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>}
                </button>
              ))}
            </div>
          )}

          {/* Subscription Info */}
          {subscription ? (
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-secondary/10 to-card/50 border border-secondary/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-foreground">Your Subscription</h3>
                <span className="px-2 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-medium">Active</span>
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
          ) : currentTier === "pending_private" || profile?.application_status === "submitted" ? (
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-card/50 border border-amber-500/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-semibold text-foreground">Private Application</h3>
                <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">Under Review</span>
              </div>
              <p className="text-muted-foreground text-sm">Your Private tier application is being reviewed by our team. You'll be notified once a decision is made.</p>
            </div>
          ) : null}

          {/* Galaxy Dashboard */}
          <GalaxyDashboard
            starredStrains={starredStrains}
            starredArt={starredArt}
            starredCulture={starredCulture}
            starredCultureItems={starredCultureItems}
            userId={user?.id}
          />

          {/* Referral Section */}
          <ReferralSection
            referralCode={referralCode}
            referralCount={referralCount}
            diaryPoints={profile?.diary_points ?? 0}
          />

          {/* Menu Items with Deliveries inline */}
          <div className="space-y-2 mb-8">
            <DeliveriesPreview
              deliveries={deliveries}
              conciergeEligible={profile?.concierge_eligible ?? false}
            />
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
                  checked={localPrefs?.marketing_emails ?? true}
                  onCheckedChange={(checked) => handleTogglePreference("marketing_emails", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">Community updates</p>
                  <p className="text-muted-foreground text-sm">Replies and mentions</p>
                </div>
                <Switch
                  checked={localPrefs?.community_notifications ?? true}
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
                checked={localPrefs?.data_optimization_consent ?? false}
                onCheckedChange={(checked) => handleTogglePreference("data_optimization_consent", checked)}
              />
            </div>
          </div>

          {/* Logout */}
          <Button
            variant="outline"
            className="w-full text-destructive hover:bg-destructive/10 border-destructive/30"
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
        userId={user?.id}
        onWalletUpdate={() => user?.id && refreshWallet(user.id)}
      />

      {/* Admin FAB — bottom-right, above bottom nav */}
      {isAdmin && (
        <button
          onClick={() => navigate("/admin")}
          className="fixed bottom-24 right-5 z-50 w-12 h-12 rounded-full bg-secondary text-secondary-foreground shadow-lg flex items-center justify-center hover:bg-secondary/90 transition-all border border-secondary/30"
          aria-label="Admin Dashboard"
        >
          <Shield className="w-5 h-5" />
        </button>
      )}

      {/* Vendor FAB — bottom-right, above admin FAB if both exist */}
      {!vendorLoading && isVendor && (
        <button
          onClick={() => navigate("/vendor")}
          className="fixed bottom-24 right-20 z-50 w-12 h-12 rounded-full bg-secondary text-secondary-foreground shadow-lg flex items-center justify-center hover:bg-secondary/90 transition-all border border-secondary/30"
          aria-label="Vendor Dashboard"
        >
          <Store className="w-5 h-5" />
        </button>
      )}
    </>
  );
};

export default Profile;
