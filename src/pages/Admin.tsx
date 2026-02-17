import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useToast } from "@/hooks/use-toast";
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
  Leaf,
  Store,
  Activity,
} from "lucide-react";
import StrainsTab from "@/components/admin/StrainsTab";
import PartnersTab from "@/components/admin/PartnersTab";
import SystemActivityTab from "@/components/admin/SystemActivityTab";
import logoLight from "@/assets/alpha-logo-light.png";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  
  const [users, setUsers] = useState<any[]>([]);
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
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadUsers(),
      loadSubscriptions(),
      loadOrders(),
      loadApplications(),
      loadDiaryEntries(),
      loadProducts(),
      loadLocations(),
    ]);
    setLoading(false);
  };

  const loadUsers = async () => {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    if (error) console.error("Error loading users:", error.message);
    setUsers(data || []);
  };

  const loadSubscriptions = async () => {
    const { data, error } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false });
    if (error) console.error("Error loading subscriptions:", error.message);
    setSubscriptions(data || []);
  };

  const loadOrders = async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) console.error("Error loading orders:", error.message);
    setOrders(data || []);
  };

  const loadApplications = async () => {
    const { data, error } = await supabase.from("private_member_applications").select("*").order("created_at", { ascending: false });
    if (error) console.error("Error loading applications:", error.message);
    setApplications(data || []);
  };

  const loadDiaryEntries = async () => {
    const { data, error } = await supabase.from("diary_entries").select("*").order("created_at", { ascending: false });
    if (error) console.error("Error loading diary entries:", error.message);
    setDiaryEntries(data || []);
  };

  const loadProducts = async () => {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) console.error("Error loading products:", error.message);
    setProducts(data || []);
  };

  const loadLocations = async () => {
    const { data, error } = await supabase.from("map_locations").select("*").order("created_at", { ascending: false });
    if (error) console.error("Error loading locations:", error.message);
    setLocations(data || []);
  };

  const handleApplicationStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("private_member_applications")
      .update({ 
        application_status: status,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Application ${status}` });
      loadApplications();
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      active: { variant: "default", icon: CheckCircle },
      pending: { variant: "secondary", icon: Clock },
      cancelled: { variant: "destructive", icon: XCircle },
      approved: { variant: "default", icon: CheckCircle },
      rejected: { variant: "destructive", icon: XCircle },
      completed: { variant: "default", icon: CheckCircle },
      failed: { variant: "destructive", icon: XCircle },
    };
    const config = variants[status] || { variant: "outline" as const, icon: Clock };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (adminLoading || loading) {
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
              <Link to="/" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Link to="/">
                <img src={logoLight} alt="Alpha" className="h-7" />
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1">
                <Shield className="w-3 h-3" />
                Admin
              </Badge>
              <Button variant="ghost" size="sm" onClick={loadAllData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage users, subscriptions, and content</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{users.length}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {subscriptions.filter((s) => s.status === "active").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Active Subs</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{orders.length}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {applications.filter((a) => a.application_status === "pending").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending Apps</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-card/50 border border-border/50 p-1 flex-wrap h-auto">
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" /> Users
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="gap-2">
                <CreditCard className="w-4 h-4" /> Subscriptions
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <Package className="w-4 h-4" /> Orders
              </TabsTrigger>
              <TabsTrigger value="applications" className="gap-2">
                <FileText className="w-4 h-4" /> Applications
              </TabsTrigger>
              <TabsTrigger value="strains" className="gap-2">
                <Leaf className="w-4 h-4" /> Strains
              </TabsTrigger>
              <TabsTrigger value="partners" className="gap-2">
                <Store className="w-4 h-4" /> Partners
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-2">
                <BookOpen className="w-4 h-4" /> Content
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Activity className="w-4 h-4" /> Activity
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tier</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/10">
                          <td className="p-4 text-foreground font-medium">{user.name || user.full_name || user.username || "Unknown"}</td>
                          <td className="p-4 text-muted-foreground">{user.email || "N/A"}</td>
                          <td className="p-4">
                            <Badge variant="secondary" className="capitalize">
                              {user.subscription_tier || "free"}
                            </Badge>
                          </td>
                          <td className="p-4">{getStatusBadge(user.status || "active")}</td>
                          <td className="p-4 text-muted-foreground text-sm">
                            {user.created_at ? formatDate(user.created_at) : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Subscriptions Tab */}
            <TabsContent value="subscriptions" className="space-y-4">
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
                      {subscriptions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-muted/10">
                          <td className="p-4">
                            <div>
                              <p className="text-foreground font-medium">User</p>
                              <p className="text-muted-foreground text-sm font-mono text-xs truncate">{sub.user_id || "N/A"}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="secondary" className="capitalize">{sub.tier}</Badge>
                          </td>
                          <td className="p-4 text-foreground">R{sub.amount ?? 0}</td>
                          <td className="p-4">{getStatusBadge(sub.status || "pending")}</td>
                          <td className="p-4 text-muted-foreground text-sm">
                            {sub.next_billing_date ? formatDate(sub.next_billing_date) : "N/A"}
                          </td>
                        </tr>
                      ))}
                      {subscriptions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            No subscriptions yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order #</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Product</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-muted/10">
                          <td className="p-4 text-foreground font-mono text-sm">{order.order_number || "N/A"}</td>
                          <td className="p-4">
                            <div>
                              <p className="text-muted-foreground text-sm font-mono text-xs truncate">{order.user_id || "N/A"}</p>
                            </div>
                          </td>
                          <td className="p-4 text-foreground">{order.product_name || "Subscription"}</td>
                          <td className="p-4 text-foreground">R{order.amount ?? 0}</td>
                          <td className="p-4">{getStatusBadge(order.payment_status || "pending")}</td>
                          <td className="p-4 text-muted-foreground text-sm">
                            {order.created_at ? formatDate(order.created_at) : "N/A"}
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground">
                            No orders yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Applications Tab */}
            <TabsContent value="applications" className="space-y-4">
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="p-6 rounded-xl border border-border/50 bg-card/30">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground">Applicant</h3>
                        <p className="text-muted-foreground text-sm font-mono text-xs truncate">{app.user_id || "N/A"}</p>
                      </div>
                      {getStatusBadge(app.application_status || "pending")}
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Motivation:</p>
                      <p className="text-foreground">{app.motivation}</p>
                    </div>

                    {app.interests && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-1">Interests:</p>
                        <p className="text-foreground">{app.interests}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-border/30">
                      <span className="text-muted-foreground text-sm">
                        Submitted: {app.submitted_at ? formatDate(app.submitted_at) : "N/A"}
                      </span>
                      
                      {app.application_status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleApplicationStatus(app.id, "rejected")}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            variant="sage"
                            size="sm"
                            onClick={() => handleApplicationStatus(app.id, "approved")}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {applications.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground rounded-xl border border-border/50">
                    No applications yet
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Strains Tab */}
            <TabsContent value="strains">
              <StrainsTab />
            </TabsContent>

            {/* Partners Tab */}
            <TabsContent value="partners">
              <PartnersTab />
            </TabsContent>

            {/* System Activity Tab */}
            <TabsContent value="activity">
              <SystemActivityTab />
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              {/* Diary Entries */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-secondary" />
                  <h3 className="font-display font-semibold text-foreground">Diary Entries</h3>
                  <Badge variant="secondary">{diaryEntries.length}</Badge>
                </div>
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/30">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Title</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Published</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {diaryEntries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-muted/10">
                            <td className="p-4 text-foreground font-medium">{entry.title}</td>
                            <td className="p-4">
                              <Badge variant="outline">{entry.category || "General"}</Badge>
                            </td>
                            <td className="p-4">
                              {entry.published ? (
                                <Badge variant="default">Published</Badge>
                              ) : (
                                <Badge variant="secondary">Draft</Badge>
                              )}
                            </td>
                            <td className="p-4 text-muted-foreground text-sm">
                              {entry.created_at ? formatDate(entry.created_at) : "N/A"}
                            </td>
                          </tr>
                        ))}
                        {diaryEntries.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-muted-foreground">
                              No diary entries yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag className="w-5 h-5 text-secondary" />
                  <h3 className="font-display font-semibold text-foreground">Products</h3>
                  <Badge variant="secondary">{products.length}</Badge>
                </div>
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/30">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Price</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">In Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {products.map((product) => (
                          <tr key={product.id} className="hover:bg-muted/10">
                            <td className="p-4 text-foreground font-medium">{product.name}</td>
                            <td className="p-4">
                              <Badge variant="outline">{product.category || "General"}</Badge>
                            </td>
                            <td className="p-4 text-foreground">R{product.price}</td>
                            <td className="p-4">
                              {product.in_stock ? (
                                <Badge variant="default">In Stock</Badge>
                              ) : (
                                <Badge variant="destructive">Out of Stock</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                        {products.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-muted-foreground">
                              No products yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Locations */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-secondary" />
                  <h3 className="font-display font-semibold text-foreground">Map Locations</h3>
                  <Badge variant="secondary">{locations.length}</Badge>
                </div>
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/30">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">City</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Active</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {locations.map((location) => (
                          <tr key={location.id} className="hover:bg-muted/10">
                            <td className="p-4 text-foreground font-medium">{location.name}</td>
                            <td className="p-4">
                              <Badge variant="outline" className="capitalize">{location.type}</Badge>
                            </td>
                            <td className="p-4 text-muted-foreground">{location.city || "N/A"}</td>
                            <td className="p-4">
                              {location.active ? (
                                <Badge variant="default">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                        {locations.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-muted-foreground">
                              No locations yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default Admin;
