import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Save, Loader2, AlertCircle, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import logoLight from "@/assets/alpha-logo-light.png";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [originalUsername, setOriginalUsername] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    phone_number: "",
    delivery_address: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/signup"); return; }

      const { data: profile } = await supabase
        .from("users")
        .select("full_name, username, phone_number, delivery_address")
        .eq("id", session.user.id)
        .maybeSingle();

      const uname = profile?.username || "";
      setOriginalUsername(uname);
      setFormData({
        full_name: profile?.full_name || "",
        username: uname,
        email: session.user.email || "",
        phone_number: profile?.phone_number || "",
        delivery_address: profile?.delivery_address || "",
      });
      setLoading(false);
    };
    loadProfile();
  }, [navigate]);

  // Username uniqueness check with debounce
  useEffect(() => {
    if (!formData.username || formData.username === originalUsername) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("users")
        .select("id")
        .eq("username", formData.username.trim().toLowerCase())
        .maybeSingle();
      setUsernameStatus(data ? "taken" : "available");
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.username, originalUsername]);

  const handleSave = async () => {
    if (usernameStatus === "taken") {
      toast({ title: "Username taken", description: "Please choose a different username", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("users")
      .update({
        full_name: formData.full_name.trim(),
        username: formData.username.trim().toLowerCase(),
        phone_number: formData.phone_number.trim(),
        delivery_address: formData.delivery_address.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id);

    if (error) {
      toast({ title: "Error", description: error.message || "Failed to save changes", variant: "destructive" });
    } else {
      setOriginalUsername(formData.username.trim().toLowerCase());
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

        <main className="container mx-auto px-4 py-6">
          <div className="p-6 rounded-2xl bg-card/50 border border-border/50 space-y-6">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Your name"
                className="mt-2 bg-background"
              />
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.replace(/\s/g, "").toLowerCase() })}
                  placeholder="your_username"
                  className="mt-2 bg-background pr-10"
                />
                {usernameStatus === "checking" && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 mt-1" />
                )}
                {usernameStatus === "available" && (
                  <Check className="w-4 h-4 text-secondary absolute right-3 top-1/2 -translate-y-1/2 mt-1" />
                )}
                {usernameStatus === "taken" && (
                  <AlertCircle className="w-4 h-4 text-destructive absolute right-3 top-1/2 -translate-y-1/2 mt-1" />
                )}
              </div>
              {usernameStatus === "taken" && (
                <p className="text-xs text-destructive mt-1">This username is already taken</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="mt-2 bg-background opacity-50"
              />
              <p className="text-xs text-muted-foreground mt-1">Contact support to change your email</p>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="+27 XX XXX XXXX"
                className="mt-2 bg-background"
              />
            </div>

            <div>
              <Label htmlFor="delivery_address">Delivery Address</Label>
              <Input
                id="delivery_address"
                value={formData.delivery_address}
                onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                placeholder="Your delivery address"
                className="mt-2 bg-background"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || usernameStatus === "taken"}
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </main>

        <BottomNav />
      </div>
    </>
  );
};

export default Settings;
