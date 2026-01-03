import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/signup");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("name, email, phone")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile) {
        setFormData({
          name: profile.name || "",
          email: profile.email || session.user.email || "",
          phone: profile.phone || "",
        });
      } else {
        setFormData({
          name: "",
          email: session.user.email || "",
          phone: "",
        });
      }

      setLoading(false);
    };
    loadProfile();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("users")
      .update({
        name: formData.name,
        phone: formData.phone,
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

        <main className="container mx-auto px-4 py-6">
          <div className="p-6 rounded-2xl bg-card/50 border border-border/50 space-y-6">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                className="mt-2 bg-background"
              />
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
              <p className="text-xs text-muted-foreground mt-1">
                Contact support to change your email address
              </p>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+27 XX XXX XXXX"
                className="mt-2 bg-background"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
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