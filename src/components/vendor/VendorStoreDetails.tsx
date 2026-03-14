import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";

interface StoreDetailsProps {
  partnerId: string;
  initialData: any;
  onSaved: () => void;
}

const COUNTRIES = [
  "South Africa", "United Arab Emirates", "Jamaica", "United States",
  "United Kingdom", "Netherlands", "Thailand", "Canada", "Germany",
  "Spain", "Portugal", "Ghana", "Nigeria", "Australia",
];

const VendorStoreDetails = ({ partnerId, initialData, onSaved }: StoreDetailsProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: initialData?.name || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    region: initialData?.region || "",
    country: initialData?.country || "South Africa",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    website: initialData?.website || "",
    vibe: initialData?.vibe || "",
    atmosphere: initialData?.atmosphere || "",
    logo_url: initialData?.logo_url || "",
    latitude: initialData?.latitude ?? "",
    longitude: initialData?.longitude ?? "",
    member_discount: initialData?.member_discount || "",
    exclusive_access: initialData?.exclusive_access || "",
    special_events: initialData?.special_events || "",
  });

  const handleSave = async () => {
    if (!form.name || !form.address || !form.city) {
      toast({ title: "Required fields", description: "Name, address, and city are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const lat = form.latitude === "" ? null : parseFloat(String(form.latitude));
      const lng = form.longitude === "" ? null : parseFloat(String(form.longitude));

      const { error } = await supabase
        .from("alpha_partners")
        .update({
          name: form.name,
          address: form.address,
          city: form.city,
          region: form.region,
          country: form.country || "South Africa",
          phone: form.phone || null,
          email: form.email || null,
          website: form.website || null,
          vibe: form.vibe || null,
          atmosphere: form.atmosphere || null,
          logo_url: form.logo_url || null,
          latitude: lat,
          longitude: lng,
          member_discount: form.member_discount || null,
          exclusive_access: form.exclusive_access || null,
          special_events: form.special_events || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", partnerId);

      if (error) throw error;
      toast({ title: "Saved", description: "Store details updated. Changes are live on the map." });
      onSaved();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">Store Details</h2>
        <Button variant="sage" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Basic Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Store Name *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Vibe</label>
              <Input value={form.vibe} onChange={(e) => setForm({ ...form, vibe: e.target.value })} placeholder="e.g., Premium Dispensary" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Atmosphere</label>
              <Textarea value={form.atmosphere} onChange={(e) => setForm({ ...form, atmosphere: e.target.value })} rows={3} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Logo URL</label>
              <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Location</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Address *</label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">City *</label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Country</label>
                <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  {form.country === "South Africa" ? "Province" : "Region"}
                </label>
                <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Latitude 📍</label>
                <Input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Longitude 📍</label>
                <Input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Phone</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Email</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Website</label>
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Alpha Member Perks</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Member Discount</label>
              <Input value={form.member_discount} onChange={(e) => setForm({ ...form, member_discount: e.target.value })} placeholder="e.g., 10% off all purchases" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Exclusive Access</label>
              <Input value={form.exclusive_access} onChange={(e) => setForm({ ...form, exclusive_access: e.target.value })} placeholder="e.g., Priority seating" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Special Events</label>
              <Input value={form.special_events} onChange={(e) => setForm({ ...form, special_events: e.target.value })} placeholder="e.g., Monthly tastings" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorStoreDetails;
