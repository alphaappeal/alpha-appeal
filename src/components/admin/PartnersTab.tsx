import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Star,
  MapPin,
  Loader2,
  Save,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AlphaPartner {
  id: string;
  name: string;
  partner_since: string;
  alpha_status: "verified" | "featured" | "exclusive";
  address: string;
  city: string;
  region: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  hours_weekdays: string | null;
  hours_saturday: string | null;
  hours_sunday: string | null;
  currently_open: boolean;
  vibe: string | null;
  specialties: string[] | null;
  atmosphere: string | null;
  hero_image: string | null;
  member_discount: string | null;
  exclusive_access: string | null;
  special_events: string | null;
  amenities: string[] | null;
  payment_methods: string[] | null;
  rating_overall: number;
  review_count: number;
  featured: boolean;
  has_delivery: boolean;
  open_for_reservations: boolean;
  created_at: string;
}

type PartnerFormData = Partial<AlphaPartner> & { specialties_text?: string };

const PartnersTab = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [partners, setPartners] = useState<AlphaPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPartner, setEditingPartner] = useState<AlphaPartner | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const emptyPartner: PartnerFormData = {
    name: "",
    partner_since: new Date().getFullYear().toString(),
    alpha_status: "verified",
    address: "",
    city: "",
    region: "",
    country: "South Africa",
    latitude: null,
    longitude: null,
    phone: "",
    email: "",
    website: "",
    logo_url: "",
    vibe: "",
    atmosphere: "",
    member_discount: "",
    exclusive_access: "",
    special_events: "",
    hero_image: "",
    currently_open: true,
    featured: false,
    has_delivery: false,
    open_for_reservations: true,
    hours_weekdays: "09:00 - 18:00",
    hours_saturday: "10:00 - 17:00",
    hours_sunday: "Closed",
    specialties_text: "",
  };

  const [formData, setFormData] = useState<PartnerFormData>(emptyPartner);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("alpha_partners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPartners((data as AlphaPartner[]) || []);
    } catch (err: any) {
      toast({
        title: "Error loading partners",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const parseCoord = (val: any): number | null => {
    if (val === null || val === undefined || val === "") return null;
    const num = parseFloat(String(val));
    return isNaN(num) ? null : num;
  };

  const parseSpecialties = (text: string | undefined): string[] | null => {
    if (!text || !text.trim()) return null;
    return text.split(",").map((s) => s.trim()).filter(Boolean);
  };

  const buildPayload = () => ({
    name: formData.name!,
    partner_since: formData.partner_since || new Date().getFullYear().toString(),
    alpha_status: formData.alpha_status,
    address: formData.address!,
    city: formData.city!,
    region: formData.region!,
    country: formData.country || 'South Africa',
    latitude: parseCoord(formData.latitude),
    longitude: parseCoord(formData.longitude),
    phone: formData.phone || null,
    email: formData.email || null,
    website: formData.website || null,
    logo_url: formData.logo_url || null,
    vibe: formData.vibe || null,
    atmosphere: formData.atmosphere || null,
    member_discount: formData.member_discount || null,
    exclusive_access: formData.exclusive_access || null,
    special_events: formData.special_events || null,
    hero_image: formData.hero_image || null,
    specialties: parseSpecialties(formData.specialties_text),
    currently_open: formData.currently_open ?? true,
    featured: formData.featured ?? false,
    has_delivery: formData.has_delivery ?? false,
    open_for_reservations: formData.open_for_reservations ?? true,
    hours_weekdays: formData.hours_weekdays || null,
    hours_saturday: formData.hours_saturday || null,
    hours_sunday: formData.hours_sunday || null,
  });

  const handleSavePartner = async () => {
    if (!formData.name || !formData.address || !formData.city || !formData.region) {
      toast({
        title: "Missing required fields",
        description: "Please fill in name, address, city, and region",
        variant: "destructive",
      });
      return;
    }

    // Validate coordinate ranges
    const lat = parseCoord(formData.latitude);
    const lng = parseCoord(formData.longitude);
    if (lat !== null && (lat < -90 || lat > 90)) {
      toast({
        title: "Invalid latitude",
        description: "Latitude must be between -90 and 90",
        variant: "destructive",
      });
      return;
    }
    if (lng !== null && (lng < -180 || lng > 180)) {
      toast({
        title: "Invalid longitude",
        description: "Longitude must be between -180 and 180",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();

      if (editingPartner) {
        const { error } = await supabase
          .from("alpha_partners")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", editingPartner.id);

        if (error) throw error;
        toast({ title: "Success", description: "Partner updated successfully" });
      } else {
        const { error } = await supabase.from("alpha_partners").insert([payload]);

        if (error) throw error;
        toast({ title: "Success", description: "Partner created successfully" });
      }

      setEditingPartner(null);
      setIsAddDialogOpen(false);
      setFormData(emptyPartner);
      loadPartners();
    } catch (err: any) {
      toast({
        title: "Error saving partner",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePartner = async (partnerId: string) => {
    if (!confirm("Are you sure you want to delete this partner? This cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase.from("alpha_partners").delete().eq("id", partnerId);

      if (error) throw error;
      toast({ title: "Success", description: "Partner deleted successfully" });
      loadPartners();
    } catch (err: any) {
      toast({
        title: "Error deleting partner",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (partner: AlphaPartner) => {
    setEditingPartner(partner);
    setFormData({
      ...partner,
      specialties_text: partner.specialties?.join(", ") || "",
    });
  };

  const openAddDialog = () => {
    setEditingPartner(null);
    setFormData(emptyPartner);
    setIsAddDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingPartner(null);
    setIsAddDialogOpen(false);
    setFormData(emptyPartner);
  };

  const filteredPartners = partners.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      exclusive: "default",
      featured: "secondary",
      verified: "outline",
    };
    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status === "exclusive" && "⭐ "}
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search partners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="sage" onClick={openAddDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Partner
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card/50 border border-border/50">
          <p className="text-2xl font-bold text-foreground">{partners.length}</p>
          <p className="text-xs text-muted-foreground">Total Partners</p>
        </div>
        <div className="p-4 rounded-xl bg-card/50 border border-border/50">
          <p className="text-2xl font-bold text-foreground">
            {partners.filter((p) => p.alpha_status === "exclusive").length}
          </p>
          <p className="text-xs text-muted-foreground">Exclusive</p>
        </div>
        <div className="p-4 rounded-xl bg-card/50 border border-border/50">
          <p className="text-2xl font-bold text-foreground">
            {partners.filter((p) => p.featured).length}
          </p>
          <p className="text-xs text-muted-foreground">Featured</p>
        </div>
        <div className="p-4 rounded-xl bg-card/50 border border-border/50">
          <p className="text-2xl font-bold text-foreground">
            {partners.length > 0
              ? (partners.reduce((acc, p) => acc + (p.rating_overall || 0), 0) / partners.length).toFixed(1)
              : "0.0"}
          </p>
          <p className="text-xs text-muted-foreground">Avg Rating</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Partner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Map</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPartners.map((partner) => (
              <TableRow key={partner.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{partner.name}</p>
                    <p className="text-sm text-muted-foreground">{partner.vibe}</p>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(partner.alpha_status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <MapPin className="w-3 h-3" />
                    {partner.city}, {partner.region}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{partner.rating_overall || 0}</span>
                    <span className="text-muted-foreground text-sm">
                      ({partner.review_count || 0})
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {partner.latitude && partner.longitude ? (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-600/30">📍 On map</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-destructive border-destructive/30">⚠ No coords</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(partner)}
                      className="text-secondary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/partner/${partner.id}`)}
                      className="text-muted-foreground"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePartner(partner.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredPartners.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No partners found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={!!editingPartner || isAddDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPartner ? `Edit Partner: ${editingPartner.name}` : "Add New Partner"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground mb-1 block">Partner Name *</label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter partner name"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Alpha Status</label>
              <Select
                value={formData.alpha_status || "verified"}
                onValueChange={(value: "verified" | "featured" | "exclusive") =>
                  setFormData({ ...formData, alpha_status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="exclusive">Exclusive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Partner Since</label>
              <Input
                value={formData.partner_since || ""}
                onChange={(e) => setFormData({ ...formData, partner_since: e.target.value })}
                placeholder="e.g., 2024"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Vibe</label>
              <Input
                value={formData.vibe || ""}
                onChange={(e) => setFormData({ ...formData, vibe: e.target.value })}
                placeholder="e.g., Cafe & Lounge"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Website</label>
              <Input
                value={formData.website || ""}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground mb-1 block">Address *</label>
              <Input
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full street address"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">City *</label>
              <Input
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City name"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Region *</label>
              <Select
                value={formData.region || "Gauteng"}
                onValueChange={(value) => setFormData({ ...formData, region: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gauteng">Gauteng</SelectItem>
                  <SelectItem value="Western Cape">Western Cape</SelectItem>
                  <SelectItem value="KwaZulu-Natal">KwaZulu-Natal</SelectItem>
                  <SelectItem value="Eastern Cape">Eastern Cape</SelectItem>
                  <SelectItem value="Free State">Free State</SelectItem>
                  <SelectItem value="Mpumalanga">Mpumalanga</SelectItem>
                  <SelectItem value="Limpopo">Limpopo</SelectItem>
                  <SelectItem value="North West">North West</SelectItem>
                  <SelectItem value="Northern Cape">Northern Cape</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Coordinates — critical for map visibility */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Latitude 📍</label>
              <Input
                type="number"
                step="any"
                value={formData.latitude ?? ""}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value === "" ? null : parseFloat(e.target.value) as any })}
                placeholder="e.g., -26.2041"
              />
              <p className="text-xs text-muted-foreground mt-1">Required for map display</p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Longitude 📍</label>
              <Input
                type="number"
                step="any"
                value={formData.longitude ?? ""}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value === "" ? null : parseFloat(e.target.value) as any })}
                placeholder="e.g., 28.0473"
              />
              <p className="text-xs text-muted-foreground mt-1">Required for map display</p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Phone</label>
              <Input
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+27 11 XXX XXXX"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Email</label>
              <Input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="partner@email.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground mb-1 block">Atmosphere</label>
              <Textarea
                value={formData.atmosphere || ""}
                onChange={(e) => setFormData({ ...formData, atmosphere: e.target.value })}
                placeholder="Describe the vibe and experience..."
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Member Discount</label>
              <Input
                value={formData.member_discount || ""}
                onChange={(e) => setFormData({ ...formData, member_discount: e.target.value })}
                placeholder="e.g., 10% off all purchases"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Exclusive Access</label>
              <Input
                value={formData.exclusive_access || ""}
                onChange={(e) => setFormData({ ...formData, exclusive_access: e.target.value })}
                placeholder="e.g., Priority seating"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Special Events</label>
              <Input
                value={formData.special_events || ""}
                onChange={(e) => setFormData({ ...formData, special_events: e.target.value })}
                placeholder="e.g., Monthly tasting sessions"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Specialties</label>
              <Input
                value={formData.specialties_text || ""}
                onChange={(e) => setFormData({ ...formData, specialties_text: e.target.value })}
                placeholder="Comma-separated, e.g., Edibles, CBD, Sativa"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground mb-1 block">Hero Image URL</label>
              <Input
                value={formData.hero_image || ""}
                onChange={(e) => setFormData({ ...formData, hero_image: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground mb-1 block">Logo URL</label>
              <Input
                value={formData.logo_url || ""}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="flex flex-wrap gap-4 md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.currently_open || false}
                  onChange={(e) => setFormData({ ...formData, currently_open: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm">Currently Open</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured || false}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm">Featured</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.has_delivery || false}
                  onChange={(e) => setFormData({ ...formData, has_delivery: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm">Has Delivery</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.open_for_reservations || false}
                  onChange={(e) =>
                    setFormData({ ...formData, open_for_reservations: e.target.checked })
                  }
                  className="rounded border-border"
                />
                <span className="text-sm">Open for Reservations</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button variant="sage" onClick={handleSavePartner} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {editingPartner ? "Save Changes" : "Create Partner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnersTab;
