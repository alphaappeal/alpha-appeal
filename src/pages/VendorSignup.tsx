import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Store, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import logoLight from "@/assets/alpha-logo-light.png";

interface PartnerOption {
  id: string;
  name: string;
  city: string;
  region: string;
  country: string;
}

const VendorSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    store_id: "",
    role_requested: "manager",
    message: "",
  });

  useEffect(() => {
    const loadPartners = async () => {
      const { data } = await supabase
        .from("alpha_partners")
        .select("id, name, city, region, country")
        .order("name");
      setPartners((data as PartnerOption[]) || []);
      setLoading(false);
    };
    loadPartners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.store_id) {
      toast({ title: "Required fields", description: "Please fill in name, email, and select a store", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("vendor_applications").insert({
        user_id: user?.id || null,
        store_id: formData.store_id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        role_requested: formData.role_requested,
        message: formData.message || null,
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Helmet><title>Application Submitted | Alpha Appeal</title></Helmet>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-8 pb-8 space-y-4">
              <CheckCircle className="w-16 h-16 text-secondary mx-auto" />
              <h2 className="font-display text-2xl font-bold text-foreground">Application Submitted</h2>
              <p className="text-muted-foreground">
                Your vendor application has been received. Our team will review it and get back to you within 24-48 hours.
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" onClick={() => navigate("/")}>Home</Button>
                <Button variant="sage" onClick={() => navigate("/login")}>Log In</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Vendor Signup | Alpha Appeal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link to="/"><img src={logoLight} alt="Alpha" className="h-7" /></Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Become a Vendor</h1>
            <p className="text-muted-foreground">
              Apply to manage your Alpha partner store. Once approved, you'll have access to manage products, hours, and orders.
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Full Name *</label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Email *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+27..."
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Select Store *</label>
                  {loading ? (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading stores...
                    </div>
                  ) : (
                    <Select
                      value={formData.store_id}
                      onValueChange={(value) => setFormData({ ...formData, store_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a partner store" />
                      </SelectTrigger>
                      <SelectContent>
                        {partners.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} — {p.city}, {p.country !== "South Africa" ? p.country : p.region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Requested Role</label>
                  <Select
                    value={formData.role_requested}
                    onValueChange={(value) => setFormData({ ...formData, role_requested: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Why should we approve you?</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your relationship with this store..."
                    rows={3}
                  />
                </div>

                <Button type="submit" variant="sage" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Store className="w-4 h-4 mr-2" />}
                  Submit Application
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Already have access? <Link to="/vendor" className="text-secondary hover:underline">Go to Vendor Portal</Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default VendorSignup;
