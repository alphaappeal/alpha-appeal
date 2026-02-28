import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  CreditCard,
  Package,
  FileText,
  MapPin,
  BookOpen,
  ShoppingBag,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  ArrowLeft,
  RefreshCw,
  Palette,
  Store,
  Activity,
  Truck,
} from "lucide-react";
import PartnersTab from "@/components/admin/PartnersTab";
import SystemActivityTab from "@/components/admin/SystemActivityTab";
import ProductsTab from "@/components/admin/ProductsTab";
import CultureTab from "@/components/admin/CultureTab";
import DeliveriesTab from "@/components/admin/DeliveriesTab";
import logoLight from "@/assets/alpha-logo-light.png";

// ─── helpers ───────────────────────────────────────────────────────────
const fmt = (d: string | null) => {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
};

const statusBadge = (status: string) => {
  const map: Record<string, { v: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
    active: { v: "default", icon: CheckCircle },
    pending: { v: "secondary", icon: Clock },
    cancelled: { v: "destructive", icon: XCircle },
    approved: { v: "default", icon: CheckCircle },
    rejected: { v: "destructive", icon: XCircle },
    completed: { v: "default", icon: CheckCircle },
    processing: { v: "secondary", icon: Clock },
    "in delivery": { v: "secondary", icon: Clock },
    failed: { v: "destructive", icon: XCircle },
  };
  const c = map[status?.toLowerCase()] || { v: "outline" as const, icon: Clock };
  const Icon = c.icon;
  return (
    <Badge variant={c.v} className="gap-1 capitalize">
      <Icon className="w-3 h-3" />
      {status || "unknown"}
    </Badge>
  );
};

const TableSkeleton = ({ cols = 4, rows = 5 }: { cols?: number; rows?: number }) => (
  <div className="rounded-xl border border-border/50 overflow-hidden">
    <div className="p-4 space-y-3">
      {[...Array(rows)].map((_, r) => (
        <div key={r} className="flex gap-4">
          {[...Array(cols)].map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

const EmptyState = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-border/50 bg-card/20">
    <Icon className="w-10 h-10 text-muted-foreground/40 mb-3" />
    <p className="text-muted-foreground text-sm">No {label} found</p>
  </div>
);

// ─── main ──────────────────────────────────────────────────────────────
const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useAdminCheck();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast({ title: "Access Denied", description: "Admin privileges required.", variant: "destructive" });
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate, toast]);

  // ── profile lookup map for joins ──
  const profileMap = new Map<string, { name: string; email: string }>();
  profiles.forEach((p) => {
    profileMap.set(p.id, {
      name: p.full_name || p.username || "Unknown",
      email: p.email || "",
    });
  });

  const resolveUser = (userId: string | null) => {
    if (!userId) return { name: "N/A", email: "" };
    return profileMap.get(userId) || { name: "User", email: userId.slice(0, 8) + "…" };
  };

  // ── data loaders ──
  const loadProfiles = useCallback(async () => {
    const { data, error } = await supabase.from("profiles").select("id, full_name, username, email, tier, created_at, role").order("created_at", { ascending: false });
    if (error) console.error("profiles:", error.message);
    setProfiles(data || []);
  }, []);

  const loadSubscriptions = useCallback(async () => {
    const { data, error } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false });
    if (error) console.error("subscriptions:", error.message);
    setSubscriptions(data || []);
  }, []);

  const loadOrders = useCallback(async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) console.error("orders:", error.message);
    setOrders(data || []);
  }, []);

  const loadApplications = useCallback(async () => {
    const { data, error } = await supabase.from("private_member_applications").select("*").order("created_at", { ascending: false });
    if (error) console.error("applications:", error.message);
    setApplications(data || []);
  }, []);

  const loadDiary = useCallback(async () => {
    const { data, error } = await supabase.from("diary_entries").select("*").order("created_at", { ascending: false });
    if (error) console.error("diary:", error.message);
    setDiaryEntries(data || []);
  }, []);

  const loadProducts = useCallback(async () => {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) console.error("products:", error.message);
    setProducts(data || []);
  }, []);

  const loadLocations = useCallback(async () => {
    const { data, error } = await supabase.from("map_locations").select("*").order("created_at", { ascending: false });
    if (error) console.error("locations:", error.message);
    setLocations(data || []);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadProfiles(), loadSubscriptions(), loadOrders(), loadApplications(), loadDiary(), loadProducts(), loadLocations()]);
    setLoading(false);
  }, [loadProfiles, loadSubscriptions, loadOrders, loadApplications, loadDiary, loadProducts, loadLocations]);

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin, loadAll]);

  // ── actions ──
  const handleApplicationStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("private_member_applications")
      .update({ application_status: status, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Application ${status}` });
      loadApplications();
    }
  };

  const handleOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Order updated to ${newStatus}` });
      loadOrders();
    }
  };

  // ── filtering ──
  const filteredProfiles = profiles.filter(
    (p) =>
      (p.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── product categories ──
  const productCategories = [...new Set(products.map((p) => p.category || "Uncategorized"))].sort();

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Alpha</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Link to="/">
                <img src={logoLight} alt="Alpha" className="h-7" />
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1">
                <Shield className="w-3 h-3" /> Admin
              </Badge>
              <Button variant="ghost" size="sm" onClick={loadAll} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-1">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Manage users, orders, content &amp; platform data</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, value: profiles.length, label: "Total Users", color: "text-secondary" },
              { icon: CreditCard, value: subscriptions.filter((s) => s.status === "active").length, label: "Active Subs", color: "text-secondary" },
              { icon: Package, value: orders.length, label: "Total Orders", color: "text-secondary" },
              { icon: FileText, value: applications.filter((a) => a.application_status === "pending").length, label: "Pending Apps", color: "text-secondary" },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="p-4 rounded-xl bg-card/50 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    {loading ? (
                      <Skeleton className="h-7 w-12 mb-1" />
                    ) : (
                      <p className="text-2xl font-bold text-foreground">{value}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-card/50 border border-border/50 p-1 flex-wrap h-auto gap-1">
              <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm"><Users className="w-4 h-4" /> Users</TabsTrigger>
              <TabsTrigger value="subscriptions" className="gap-1.5 text-xs sm:text-sm"><CreditCard className="w-4 h-4" /> Subs</TabsTrigger>
              <TabsTrigger value="orders" className="gap-1.5 text-xs sm:text-sm"><Package className="w-4 h-4" /> Orders</TabsTrigger>
              <TabsTrigger value="applications" className="gap-1.5 text-xs sm:text-sm"><FileText className="w-4 h-4" /> Applications</TabsTrigger>
              <TabsTrigger value="culture" className="gap-1.5 text-xs sm:text-sm"><Palette className="w-4 h-4" /> Culture</TabsTrigger>
              <TabsTrigger value="partners" className="gap-1.5 text-xs sm:text-sm"><Store className="w-4 h-4" /> Partners</TabsTrigger>
              <TabsTrigger value="products" className="gap-1.5 text-xs sm:text-sm"><ShoppingBag className="w-4 h-4" /> Products</TabsTrigger>
              <TabsTrigger value="content" className="gap-1.5 text-xs sm:text-sm"><BookOpen className="w-4 h-4" /> Content</TabsTrigger>
              <TabsTrigger value="deliveries" className="gap-1.5 text-xs sm:text-sm"><Truck className="w-4 h-4" /> Deliveries</TabsTrigger>
              <TabsTrigger value="activity" className="gap-1.5 text-xs sm:text-sm"><Activity className="w-4 h-4" /> Activity</TabsTrigger>
            </TabsList>

            {/* ═══════════ USERS ═══════════ */}
            <TabsContent value="users" className="space-y-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by name or email…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>

              {loading ? (
                <TableSkeleton cols={5} />
              ) : filteredProfiles.length === 0 ? (
                <EmptyState icon={Users} label="users" />
              ) : (
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/30">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tier</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {filteredProfiles.map((p) => (
                          <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                            <td className="p-4 text-foreground font-medium">{p.full_name || p.username || "Unknown"}</td>
                            <td className="p-4 text-muted-foreground text-sm">{p.email || "N/A"}</td>
                            <td className="p-4"><Badge variant="secondary" className="capitalize">{p.tier || "free"}</Badge></td>
                            <td className="p-4"><Badge variant="outline" className="capitalize">{p.role || "user"}</Badge></td>
                            <td className="p-4 text-muted-foreground text-sm">{fmt(p.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ═══════════ SUBSCRIPTIONS ═══════════ */}
            <TabsContent value="subscriptions" className="space-y-4">
              {loading ? (
                <TableSkeleton cols={5} />
              ) : subscriptions.length === 0 ? (
                <EmptyState icon={CreditCard} label="subscriptions" />
              ) : (
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/30">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tier</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Next Billing</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {subscriptions.map((sub) => {
                          const user = resolveUser(sub.user_id);
                          return (
                            <tr key={sub.id} className="hover:bg-muted/10 transition-colors">
                              <td className="p-4">
                                <p className="text-foreground font-medium text-sm">{user.name}</p>
                                <p className="text-muted-foreground text-xs">{user.email}</p>
                              </td>
                              <td className="p-4"><Badge variant="secondary" className="capitalize">{sub.tier}</Badge></td>
                              <td className="p-4 text-foreground">R{sub.amount ?? 0}</td>
                              <td className="p-4">{statusBadge(sub.status || "pending")}</td>
                              <td className="p-4 text-muted-foreground text-sm">{fmt(sub.next_billing_date)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ═══════════ ORDERS ═══════════ */}
            <TabsContent value="orders" className="space-y-4">
              {loading ? (
                <TableSkeleton cols={6} />
              ) : orders.length === 0 ? (
                <EmptyState icon={Package} label="orders" />
              ) : (
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/30">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order #</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Product</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {orders.map((order) => {
                          const user = resolveUser(order.user_id);
                          return (
                            <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                              <td className="p-4 text-foreground font-mono text-sm">{order.order_number || "N/A"}</td>
                              <td className="p-4">
                                <p className="text-foreground font-medium text-sm">{user.name}</p>
                                <p className="text-muted-foreground text-xs">{user.email}</p>
                              </td>
                              <td className="p-4 text-foreground text-sm">{order.product_name || "Subscription"}</td>
                              <td className="p-4 text-foreground font-medium">R{order.amount ?? 0}</td>
                              <td className="p-4">
                                <Select
                                  value={order.payment_status || "pending"}
                                  onValueChange={(v) => handleOrderStatus(order.id, v)}
                                >
                                  <SelectTrigger className="w-[140px] h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="in delivery">In Delivery</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="p-4 text-muted-foreground text-sm">{fmt(order.created_at)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ═══════════ APPLICATIONS ═══════════ */}
            <TabsContent value="applications" className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-6 rounded-xl border border-border/50 space-y-3">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : applications.length === 0 ? (
                <EmptyState icon={FileText} label="applications" />
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => {
                    const user = resolveUser(app.user_id);
                    return (
                      <div key={app.id} className="p-6 rounded-xl border border-border/50 bg-card/30">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-foreground">{user.name}</h3>
                            <p className="text-muted-foreground text-sm">{user.email}</p>
                          </div>
                          {statusBadge(app.application_status || "pending")}
                        </div>

                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground mb-1">Motivation</p>
                          <p className="text-foreground text-sm">{app.motivation}</p>
                        </div>

                        {app.interests && (
                          <div className="mb-3">
                            <p className="text-xs text-muted-foreground mb-1">Interests</p>
                            <p className="text-foreground text-sm">{app.interests}</p>
                          </div>
                        )}

                        {app.profession && (
                          <div className="mb-3">
                            <p className="text-xs text-muted-foreground mb-1">Profession</p>
                            <p className="text-foreground text-sm">{app.profession}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-border/30">
                          <span className="text-muted-foreground text-xs">Submitted: {fmt(app.submitted_at)}</span>
                          {app.application_status === "pending" && (
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleApplicationStatus(app.id, "rejected")}>
                                <XCircle className="w-4 h-4 mr-1" /> Reject
                              </Button>
                              <Button variant="default" size="sm" onClick={() => handleApplicationStatus(app.id, "approved")}>
                                <CheckCircle className="w-4 h-4 mr-1" /> Approve
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ═══════════ CULTURE (replaces Strains) ═══════════ */}
            <TabsContent value="culture">
              <CultureTab />
            </TabsContent>

            {/* ═══════════ PARTNERS ═══════════ */}
            <TabsContent value="partners">
              <PartnersTab />
            </TabsContent>

            {/* ═══════════ PRODUCTS ═══════════ */}
            <TabsContent value="products" className="space-y-6">
              <ProductsTab products={products} onRefresh={loadProducts} />

              {/* Grouped by category view */}
              {!loading && products.length > 0 && (
                <div className="space-y-6 pt-4 border-t border-border/30">
                  <h3 className="font-display font-semibold text-foreground text-lg">Products by Category</h3>
                  {productCategories.map((cat) => {
                    const catProducts = products.filter((p) => (p.category || "Uncategorized") === cat);
                    return (
                      <div key={cat} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">{cat}</Badge>
                          <span className="text-xs text-muted-foreground">{catProducts.length} items</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {catProducts.map((p) => (
                            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-card/20">
                              {p.image_url && (
                                <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-foreground text-sm font-medium truncate">{p.name}</p>
                                <p className="text-muted-foreground text-xs">R{p.price} · Stock: {p.stock_quantity ?? 0}</p>
                              </div>
                              <Badge variant={p.active ? "default" : "secondary"} className="text-[10px] shrink-0">
                                {p.active ? "Active" : "Off"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ═══════════ CONTENT (Diary + Locations) ═══════════ */}
            <TabsContent value="content" className="space-y-8">
              {/* Diary */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-secondary" />
                  <h3 className="font-display font-semibold text-foreground">Diary Entries</h3>
                  <Badge variant="secondary">{diaryEntries.length}</Badge>
                </div>

                {loading ? (
                  <TableSkeleton cols={4} />
                ) : diaryEntries.length === 0 ? (
                  <EmptyState icon={BookOpen} label="diary entries" />
                ) : (
                  <div className="rounded-xl border border-border/50 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/30">
                          <tr>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Title</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Author</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {diaryEntries.map((entry) => {
                            const author = resolveUser(entry.author_id);
                            return (
                              <tr key={entry.id} className="hover:bg-muted/10 transition-colors">
                                <td className="p-4 text-foreground font-medium text-sm">{entry.title}</td>
                                <td className="p-4 text-muted-foreground text-sm">{author.name}</td>
                                <td className="p-4"><Badge variant="outline" className="text-xs">{entry.category || "General"}</Badge></td>
                                <td className="p-4">
                                  <Badge variant={entry.published ? "default" : "secondary"} className="text-xs">
                                    {entry.published ? "Published" : "Draft"}
                                  </Badge>
                                </td>
                                <td className="p-4 text-muted-foreground text-sm">{fmt(entry.created_at)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>

              {/* Locations */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-secondary" />
                  <h3 className="font-display font-semibold text-foreground">Map Locations</h3>
                  <Badge variant="secondary">{locations.length}</Badge>
                </div>

                {loading ? (
                  <TableSkeleton cols={4} />
                ) : locations.length === 0 ? (
                  <EmptyState icon={MapPin} label="locations" />
                ) : (
                  <div className="rounded-xl border border-border/50 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/30">
                          <tr>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">City</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {locations.map((loc) => (
                            <tr key={loc.id} className="hover:bg-muted/10 transition-colors">
                              <td className="p-4 text-foreground font-medium text-sm">{loc.name}</td>
                              <td className="p-4"><Badge variant="outline" className="capitalize text-xs">{loc.type}</Badge></td>
                              <td className="p-4 text-muted-foreground text-sm">{loc.city || "N/A"}</td>
                              <td className="p-4">
                                <Badge variant={loc.active ? "default" : "secondary"} className="text-xs">
                                  {loc.active ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            </TabsContent>

            {/* ═══════════ DELIVERIES ═══════════ */}
            <TabsContent value="deliveries">
              <DeliveriesTab profileMap={profileMap} />
            </TabsContent>

            {/* ═══════════ ACTIVITY ═══════════ */}
            <TabsContent value="activity">
              <SystemActivityTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default Admin;
