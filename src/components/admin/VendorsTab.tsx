import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, UserPlus, Check, X, Trash2, Loader2, Store, Users, Clock,
} from "lucide-react";

interface VendorApplication {
  id: string;
  user_id: string | null;
  store_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role_requested: string;
  message: string | null;
  status: string;
  created_at: string;
  store_name?: string;
}

interface VendorAccount {
  id: string;
  user_id: string;
  partner_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
  store_name?: string;
  user_email?: string;
}

const VendorsTab = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [vendors, setVendors] = useState<VendorAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  // Manual vendor add
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [partners, setPartners] = useState<{ id: string; name: string }[]>([]);
  const [addForm, setAddForm] = useState({ user_email: "", partner_id: "", role: "manager" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadApplications(), loadVendors(), loadPartners()]);
    setLoading(false);
  };

  const loadApplications = async () => {
    const { data } = await supabase
      .from("vendor_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      // Enrich with store names
      const storeIds = [...new Set(data.map((a: any) => a.store_id))];
      const { data: stores } = await supabase
        .from("alpha_partners")
        .select("id, name")
        .in("id", storeIds);
      const storeMap = new Map((stores || []).map((s: any) => [s.id, s.name]));

      setApplications(
        data.map((a: any) => ({ ...a, store_name: storeMap.get(a.store_id) || "Unknown" }))
      );
    }
  };

  const loadVendors = async () => {
    const { data } = await supabase
      .from("vendor_accounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      const partnerIds = [...new Set(data.map((v: any) => v.partner_id))];
      const userIds = [...new Set(data.map((v: any) => v.user_id))];

      const { data: stores } = await supabase
        .from("alpha_partners")
        .select("id, name")
        .in("id", partnerIds);
      const storeMap = new Map((stores || []).map((s: any) => [s.id, s.name]));

      const { data: users } = await supabase
        .from("users")
        .select("id, email")
        .in("id", userIds);
      const userMap = new Map((users || []).map((u: any) => [u.id, u.email]));

      setVendors(
        data.map((v: any) => ({
          ...v,
          store_name: storeMap.get(v.partner_id) || "Unknown",
          user_email: userMap.get(v.user_id) || v.user_id?.slice(0, 8),
        }))
      );
    }
  };

  const loadPartners = async () => {
    const { data } = await supabase.from("alpha_partners").select("id, name").order("name");
    setPartners((data as any[]) || []);
  };

  const handleApprove = async (app: VendorApplication) => {
    setProcessing(app.id);
    try {
      // If user_id is provided, create vendor account
      if (app.user_id) {
        const { error: insertError } = await supabase.from("vendor_accounts").insert({
          user_id: app.user_id,
          partner_id: app.store_id,
          role: app.role_requested,
          is_active: true,
        });
        if (insertError) throw insertError;
      }

      // Update application status
      const { error } = await supabase
        .from("vendor_applications")
        .update({ status: "approved", reviewed_at: new Date().toISOString() })
        .eq("id", app.id);
      if (error) throw error;

      toast({ title: "Approved", description: `${app.full_name} has been approved as vendor` });
      loadAll();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (app: VendorApplication) => {
    setProcessing(app.id);
    try {
      const { error } = await supabase
        .from("vendor_applications")
        .update({ status: "rejected", reviewed_at: new Date().toISOString() })
        .eq("id", app.id);
      if (error) throw error;
      toast({ title: "Rejected", description: `Application from ${app.full_name} rejected` });
      loadAll();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  const handleRemoveVendor = async (vendorId: string) => {
    if (!confirm("Remove this vendor's access?")) return;
    try {
      const { error } = await supabase
        .from("vendor_accounts")
        .update({ is_active: false })
        .eq("id", vendorId);
      if (error) throw error;
      toast({ title: "Removed", description: "Vendor access revoked" });
      loadAll();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleAddVendor = async () => {
    if (!addForm.user_email || !addForm.partner_id) {
      toast({ title: "Missing fields", description: "Email and store are required", variant: "destructive" });
      return;
    }
    setAdding(true);
    try {
      // Look up user by email
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("email", addForm.user_email)
        .single();
      if (!userData) throw new Error("User not found with that email");

      const { error } = await supabase.from("vendor_accounts").insert({
        user_id: userData.id,
        partner_id: addForm.partner_id,
        role: addForm.role,
        is_active: true,
      });
      if (error) throw error;

      toast({ title: "Vendor added", description: `${addForm.user_email} assigned to store` });
      setShowAddDialog(false);
      setAddForm({ user_email: "", partner_id: "", role: "manager" });
      loadAll();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const pendingApps = applications.filter((a) => a.status === "pending");
  const filteredVendors = vendors.filter(
    (v) =>
      v.is_active &&
      ((v.store_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.user_email || "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="applications">
        <TabsList>
          <TabsTrigger value="applications" className="gap-2">
            <Clock className="w-4 h-4" />
            Applications
            {pendingApps.length > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs px-1.5">{pendingApps.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-2">
            <Users className="w-4 h-4" />
            Active Vendors
          </TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          {pendingApps.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Store className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>No pending vendor applications</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{app.full_name}</p>
                          <p className="text-xs text-muted-foreground">{app.email}</p>
                          {app.phone && <p className="text-xs text-muted-foreground">{app.phone}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <Store className="w-3 h-3" />
                          {app.store_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize text-sm">{app.role_requested}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="sage"
                            onClick={() => handleApprove(app)}
                            disabled={processing === app.id}
                          >
                            {processing === app.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={() => handleReject(app)}
                            disabled={processing === app.id}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Past applications */}
          {applications.filter((a) => a.status !== "pending").length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Past Applications</h3>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Store</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications
                      .filter((a) => a.status !== "pending")
                      .slice(0, 20)
                      .map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="text-sm">{app.full_name}</TableCell>
                          <TableCell className="text-sm">{app.store_name}</TableCell>
                          <TableCell>
                            <Badge variant={app.status === "approved" ? "default" : "destructive"} className="capitalize text-xs">
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(app.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Active Vendors Tab */}
        <TabsContent value="active" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="sage" onClick={() => setShowAddDialog(true)} className="gap-2">
              <UserPlus className="w-4 h-4" /> Add Vendor
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-card/50 border border-border/50">
              <p className="text-2xl font-bold text-foreground">{vendors.filter((v) => v.is_active).length}</p>
              <p className="text-xs text-muted-foreground">Active Vendors</p>
            </div>
            <div className="p-4 rounded-xl bg-card/50 border border-border/50">
              <p className="text-2xl font-bold text-foreground">
                {new Set(vendors.filter((v) => v.is_active).map((v) => v.partner_id)).size}
              </p>
              <p className="text-xs text-muted-foreground">Stores with Vendors</p>
            </div>
            <div className="p-4 rounded-xl bg-card/50 border border-border/50">
              <p className="text-2xl font-bold text-foreground">{pendingApps.length}</p>
              <p className="text-xs text-muted-foreground">Pending Applications</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Since</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="text-sm font-medium">{vendor.user_email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Store className="w-3 h-3" />
                        {vendor.store_name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize text-sm">{vendor.role}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(vendor.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleRemoveVendor(vendor.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredVendors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No active vendors found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Vendor Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vendor Manually</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">User Email *</label>
              <Input
                value={addForm.user_email}
                onChange={(e) => setAddForm({ ...addForm, user_email: e.target.value })}
                placeholder="user@email.com"
              />
              <p className="text-xs text-muted-foreground mt-1">User must already have an account</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Store *</label>
              <Select value={addForm.partner_id} onValueChange={(v) => setAddForm({ ...addForm, partner_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select store" /></SelectTrigger>
                <SelectContent>
                  {partners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Role</label>
              <Select value={addForm.role} onValueChange={(v) => setAddForm({ ...addForm, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button variant="sage" onClick={handleAddVendor} disabled={adding}>
              {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Add Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorsTab;
