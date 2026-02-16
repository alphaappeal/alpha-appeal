import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import logoLight from "@/assets/alpha-logo-light.png";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    phone_number: "",
    delivery_address: "",
    notify_orders: true,
    notify_promotions: true,
    notify_events: true,
    profile_public: false,
    show_activity: true,
  });

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }

      const { data: profile } = await supabase
        .from("users")
        .select("full_name, username, phone_number, delivery_address, notify_orders, notify_promotions, notify_events, profile_public, show_activity")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile) {
        setFormData({
          full_name: profile.full_name || "",
          username: profile.username || "",
          email: session.user.email || "",
          phone_number: profile.phone_number || "",
          delivery_address: profile.delivery_address || "",
          notify_orders: profile.notify_orders ?? true,
          notify_promotions: profile.notify_promotions ?? true,
          notify_events: profile.notify_events ?? true,
          profile_public: profile.profile_public ?? false,
          show_activity: profile.show_activity ?? true,
        });
      } else {
        setFormData(prev => ({ ...prev, email: session.user.email || "" }));
      }
      setLoading(false);
    };
    loadProfile();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Validate username uniqueness if changed
    if (formData.username) {
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("username", formData.username)
        .neq("id", session.user.id)
        .maybeSingle();

      if (existing) {
        toast({ title: "Username taken", description: "Please choose a different username", variant: "destructive" });
        setSaving(false);
        return;
      }
    }

    const { error } = await supabase
      .from("users")
      .update({
        full_name: formData.full_name,
        username: formData.username || null,
        phone_number: formData.phone_number || null,
        delivery_address: formData.delivery_address || null,
        notify_orders: formData.notify_orders,
        notify_promotions: formData.notify_promotions,
        notify_events: formData.notify_events,
        profile_public: formData.profile_public,
        show_activity: formData.show_activity,
      })
      .eq("id", session.user.id);

    if (error) {
      toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
    } else {
      toast({ title: "Settings saved", description: "Your profile has been updated" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Account Settings | Alpha</title>
        <meta name="description" content="Manage your Alpha account settings." />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={() => navigate("/profile")} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="font-display text-lg font-semibold text-foreground">Settings</h1>
            <Link to="/">
              <img src={logoLight} alt="Alpha" className="h-6" />
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Personal Info */}
          <div className="p-6 rounded-2xl bg-card/50 border border-border/50 space-y-4">
            <h2 className="font-display font-semibold text-foreground mb-2">Personal Info</h2>
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="Your name" className="mt-2 bg-background" />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="@username" className="mt-2 bg-background" />
              <p className="text-xs text-muted-foreground mt-1">Must be unique</p>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} disabled className="mt-2 bg-background opacity-50" />
              <p className="text-xs text-muted-foreground mt-1">Contact support to change your email</p>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} placeholder="+27 XX XXX XXXX" className="mt-2 bg-background" />
            </div>
            <div>
              <Label htmlFor="address">Delivery Address</Label>
              <Input id="address" value={formData.delivery_address} onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })} placeholder="Your delivery address" className="mt-2 bg-background" />
            </div>
          </div>

          {/* Notifications */}
          <div className="p-6 rounded-2xl bg-card/50 border border-border/50 space-y-4">
            <h2 className="font-display font-semibold text-foreground mb-2">Notifications</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">Order updates</p>
                <p className="text-muted-foreground text-sm">Shipping & delivery alerts</p>
              </div>
              <Switch checked={formData.notify_orders} onCheckedChange={(v) => setFormData({ ...formData, notify_orders: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">Promotions</p>
                <p className="text-muted-foreground text-sm">Drops, events & offers</p>
              </div>
              <Switch checked={formData.notify_promotions} onCheckedChange={(v) => setFormData({ ...formData, notify_promotions: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">Events</p>
                <p className="text-muted-foreground text-sm">Community events & meetups</p>
              </div>
              <Switch checked={formData.notify_events} onCheckedChange={(v) => setFormData({ ...formData, notify_events: v })} />
            </div>
          </div>

          {/* Privacy */}
          <div className="p-6 rounded-2xl bg-card/50 border border-border/50 space-y-4">
            <h2 className="font-display font-semibold text-foreground mb-2">Privacy</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">Public profile</p>
                <p className="text-muted-foreground text-sm">Allow others to see your profile</p>
              </div>
              <Switch checked={formData.profile_public} onCheckedChange={(v) => setFormData({ ...formData, profile_public: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">Show activity</p>
                <p className="text-muted-foreground text-sm">Display your community activity</p>
              </div>
              <Switch checked={formData.show_activity} onCheckedChange={(v) => setFormData({ ...formData, show_activity: v })} />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </main>

        <BottomNav />
      </div>
    </>
  );
};

export default Settings;
