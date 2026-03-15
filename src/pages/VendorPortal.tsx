import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Package, Plus, Edit2, Trash2, Store, Loader2, Save, ArrowLeft,
  Check, X, DollarSign, Box, AlertCircle, LayoutDashboard, Clock,
  ShoppingBag, Truck, Settings, MapPin, ChevronRight, Menu,
} from "lucide-react";
import logoLight from "@/assets/alpha-logo-light.png";
import VendorStoreDetails from "@/components/vendor/VendorStoreDetails";
import VendorStoreHours from "@/components/vendor/VendorStoreHours";

interface VendorAccount {
  id: string;
  partner_id: string;
  role: string;
  alpha_partners: {
    id: string;
    name: string;
    alpha_status: string;
    city: string;
    region: string;
    country: string;
    hero_image: string | null;
    logo_url: string | null;
  };
}

interface PartnerProduct {
  id: string;
  partner_id: string;
  name: string;
  category: string | null;
  strain_type: string | null;
  thc_percentage: number | null;
  cbd_percentage: number | null;
  price: number | null;
  price_unit: string | null;
  description: string | null;
  image_url: string | null;
  in_stock: boolean;
  stock_quantity: number;
  effects: string[] | null;
  flavors: string[] | null;
}

type VendorSection = "dashboard" | "products" | "store-details" | "store-hours" | "orders" | "settings";

const NAV_ITEMS: { id: VendorSection; label: string; icon: any }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "store-details", label: "Store Details", icon: MapPin },
  { id: "store-hours", label: "Store Hours", icon: Clock },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "settings", label: "Settings", icon: Settings },
];

const VendorPortal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [vendorAccounts, setVendorAccounts] = useState<VendorAccount[]>([]);
  const [vendorAccount, setVendorAccount] = useState<VendorAccount | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const [products, setProducts] = useState<PartnerProduct[]>([]);
  const [editingProduct, setEditingProduct] = useState<PartnerProduct | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<VendorSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const emptyProduct: Partial<PartnerProduct> = {
    name: "", category: "flower", strain_type: "hybrid",
    thc_percentage: null, cbd_percentage: null, price: null,
    price_unit: "per gram", description: "", image_url: "",
    in_stock: true, stock_quantity: 0,
  };
  const [formData, setFormData] = useState<Partial<PartnerProduct>>(emptyProduct);

  useEffect(() => { checkVendorAccess(); }, []);

  const checkVendorAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }

      const { data: accounts, error } = await supabase
        .from("vendor_accounts")
        .select(`id, partner_id, role, alpha_partners (id, name, alpha_status, city, region, country, hero_image, logo_url)`)
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (error) {
        console.error("Vendor access query error:", error);
        setAccessError("Failed to load vendor accounts. Please try again.");
        setLoading(false);
        return;
      }

      const validAccounts = (accounts || []) as unknown as VendorAccount[];
      setVendorAccounts(validAccounts);

      if (validAccounts.length === 0) {
        setAccessError("You don't have vendor access. Contact an admin to get set up.");
        setLoading(false);
        return;
      }

      if (validAccounts.length === 1) {
        await selectStore(validAccounts[0]);
      }
      // If multiple, user picks from selector (loading stays true until they pick or we finish)
    } catch (err: any) {
      console.error("Vendor check error:", err);
      setAccessError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectStore = async (account: VendorAccount) => {
    setVendorAccount(account);
    setAccessError(null);
    await Promise.all([loadProducts(account.partner_id), loadStoreData(account.partner_id)]);
  };

  const loadStoreData = async (partnerId: string) => {
    const { data } = await supabase.from("alpha_partners").select("*").eq("id", partnerId).single();
    setStoreData(data);
  };

  const loadProducts = async (partnerId: string) => {
    const { data, error } = await supabase
      .from("partner_products")
      .select("*")
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false });
    if (!error) setProducts(data || []);
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !vendorAccount) {
      toast({ title: "Missing required fields", description: "Please fill in the product name", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formData.name, category: formData.category, strain_type: formData.strain_type,
        thc_percentage: formData.thc_percentage, cbd_percentage: formData.cbd_percentage,
        price: formData.price, price_unit: formData.price_unit, description: formData.description,
        image_url: formData.image_url, in_stock: formData.in_stock, stock_quantity: formData.stock_quantity,
      };

      if (editingProduct) {
        const { error } = await supabase.from("partner_products").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editingProduct.id);
        if (error) throw error;
        toast({ title: "Success", description: "Product updated" });
      } else {
        const { error } = await supabase.from("partner_products").insert([{ ...payload, partner_id: vendorAccount.partner_id }]);
        if (error) throw error;
        toast({ title: "Success", description: "Product created" });
      }
      closeDialog();
      loadProducts(vendorAccount.partner_id);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const { error } = await supabase.from("partner_products").delete().eq("id", productId);
      if (error) throw error;
      toast({ title: "Deleted" });
      if (vendorAccount) loadProducts(vendorAccount.partner_id);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleStock = async (product: PartnerProduct) => {
    const { error } = await supabase.from("partner_products").update({ in_stock: !product.in_stock }).eq("id", product.id);
    if (!error && vendorAccount) loadProducts(vendorAccount.partner_id);
  };

  const openEditDialog = (product: PartnerProduct) => { setEditingProduct(product); setFormData(product); };
  const openAddDialog = () => { setEditingProduct(null); setFormData(emptyProduct); setIsAddDialogOpen(true); };
  const closeDialog = () => { setEditingProduct(null); setIsAddDialogOpen(false); setFormData(emptyProduct); };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-foreground font-medium">{accessError}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/profile")}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
              </Button>
              <Button variant="sage" onClick={() => navigate("/vendor/signup")}>
                Apply for Access
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Multi-store selector
  if (!vendorAccount && vendorAccounts.length > 1) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-secondary" />
              Select a Store
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {vendorAccounts.map((account) => {
              const s = account.alpha_partners;
              return (
                <button
                  key={account.id}
                  onClick={async () => {
                    setLoading(true);
                    await selectStore(account);
                    setLoading(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:border-secondary hover:bg-muted/50 transition-all text-left"
                >
                  {s.logo_url ? (
                    <img src={s.logo_url} alt={s.name} className="w-12 h-12 rounded-lg object-contain bg-muted p-1" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <Store className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{s.name}</p>
                    <p className="text-sm text-muted-foreground">{s.city}, {s.country !== "South Africa" ? s.country : s.region}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 capitalize">{account.role}</Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!vendorAccount) return null;

  const store = vendorAccount.alpha_partners;
  const inStockCount = products.filter((p) => p.in_stock).length;
  const outOfStockCount = products.filter((p) => !p.in_stock).length;

  const formatLocation = () => {
    if (store.country && store.country !== "South Africa") {
      return `${store.city}, ${store.country}`;
    }
    return `${store.city}, ${store.region}`;
  };

  return (
    <>
      <Helmet>
        <title>{store.name} — Vendor Portal | Alpha</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-card border-r border-border flex flex-col transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="h-14 flex items-center justify-between px-4 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoLight} alt="Alpha" className="h-6" />
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Store info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              {store.logo_url && <img src={store.logo_url} alt={store.name} className="w-10 h-10 rounded-lg object-contain bg-muted p-1" />}
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">{store.name}</p>
                <p className="text-xs text-muted-foreground">{formatLocation()}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active ? "bg-secondary/10 text-secondary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-border">
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to App</span>
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
          <header className="sticky top-0 z-40 h-14 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground">
                <Menu className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-foreground">
                {NAV_ITEMS.find((n) => n.id === activeSection)?.label || "Dashboard"}
              </span>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Store className="w-3 h-3" />
              {vendorAccount.role}
            </Badge>
          </header>

          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {/* Dashboard */}
            {activeSection === "dashboard" && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground mb-1">{store.name}</h1>
                  <p className="text-muted-foreground text-sm">{formatLocation()}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <Package className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">{products.length}</p>
                          <p className="text-xs text-muted-foreground">Products</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">{inStockCount}</p>
                          <p className="text-xs text-muted-foreground">In Stock</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-destructive" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">{outOfStockCount}</p>
                          <p className="text-xs text-muted-foreground">Out of Stock</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground capitalize">{vendorAccount.role}</p>
                          <p className="text-xs text-muted-foreground">Your Role</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" onClick={() => setActiveSection("products")} className="justify-start gap-2">
                    <Package className="w-4 h-4" /> Manage Products
                  </Button>
                  <Button variant="outline" onClick={() => setActiveSection("store-hours")} className="justify-start gap-2">
                    <Clock className="w-4 h-4" /> Edit Hours
                  </Button>
                  <Button variant="outline" onClick={() => setActiveSection("store-details")} className="justify-start gap-2">
                    <MapPin className="w-4 h-4" /> Store Details
                  </Button>
                  <Button variant="outline" onClick={() => setActiveSection("orders")} className="justify-start gap-2">
                    <ShoppingBag className="w-4 h-4" /> View Orders
                  </Button>
                </div>
              </div>
            )}

            {/* Products */}
            {activeSection === "products" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold text-foreground">Products</h2>
                  <Button variant="sage" onClick={openAddDialog} className="gap-2">
                    <Plus className="w-4 h-4" /> Add Product
                  </Button>
                </div>

                {products.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Box className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No products yet</p>
                      <Button variant="sage" onClick={openAddDialog}>Add Your First Product</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <Card key={product.id} className="overflow-hidden">
                        {product.image_url && (
                          <div className="aspect-video relative">
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-foreground">{product.name}</h3>
                              <p className="text-sm text-muted-foreground capitalize">{product.category} • {product.strain_type}</p>
                            </div>
                            <Badge variant={product.in_stock ? "default" : "destructive"}>
                              {product.in_stock ? "In Stock" : "Out"}
                            </Badge>
                          </div>
                          {product.price && (
                            <p className="text-lg font-bold text-secondary mb-2">
                              R{product.price} <span className="text-sm font-normal text-muted-foreground">{product.price_unit}</span>
                            </p>
                          )}
                          {(product.thc_percentage || product.cbd_percentage) && (
                            <div className="flex gap-2 mb-3">
                              {product.thc_percentage && <Badge variant="outline" className="text-xs">THC: {product.thc_percentage}%</Badge>}
                              {product.cbd_percentage && <Badge variant="outline" className="text-xs">CBD: {product.cbd_percentage}%</Badge>}
                            </div>
                          )}
                          <div className="flex gap-2 pt-2 border-t border-border/50">
                            <Button variant="ghost" size="sm" onClick={() => toggleStock(product)}
                              className={product.in_stock ? "text-destructive" : "text-green-500"}>
                              {product.in_stock ? <><X className="w-4 h-4 mr-1" /> Mark Out</> : <><Check className="w-4 h-4 mr-1" /> Mark In</>}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)}><Edit2 className="w-4 h-4 mr-1" /> Edit</Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteProduct(product.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Store Details */}
            {activeSection === "store-details" && storeData && (
              <VendorStoreDetails
                partnerId={vendorAccount.partner_id}
                initialData={storeData}
                onSaved={() => {
                  loadStoreData(vendorAccount.partner_id);
                  checkVendorAccess();
                }}
              />
            )}

            {/* Store Hours */}
            {activeSection === "store-hours" && (
              <VendorStoreHours partnerId={vendorAccount.partner_id} />
            )}

            {/* Orders (placeholder) */}
            {activeSection === "orders" && (
              <div className="space-y-6">
                <h2 className="font-display text-xl font-semibold text-foreground">Orders</h2>
                <Card>
                  <CardContent className="py-12 text-center">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Order management coming soon</p>
                    <p className="text-xs text-muted-foreground">Orders placed through your store will appear here</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Settings */}
            {activeSection === "settings" && (
              <div className="space-y-6">
                <h2 className="font-display text-xl font-semibold text-foreground">Settings</h2>
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Account Role</p>
                      <p className="text-sm text-muted-foreground capitalize">{vendorAccount.role}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Store ID</p>
                      <p className="text-xs text-muted-foreground font-mono">{vendorAccount.partner_id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Status</p>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Product Dialog */}
      <Dialog open={!!editingProduct || isAddDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Product Name *</label>
              <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Product name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Category</label>
                <Select value={formData.category || "flower"} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flower">Flower</SelectItem>
                    <SelectItem value="edibles">Edibles</SelectItem>
                    <SelectItem value="concentrates">Concentrates</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Strain Type</label>
                <Select value={formData.strain_type || "hybrid"} onValueChange={(v) => setFormData({ ...formData, strain_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indica">Indica</SelectItem>
                    <SelectItem value="sativa">Sativa</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="cbd">CBD</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">THC %</label>
                <Input type="number" step="0.1" value={formData.thc_percentage || ""} onChange={(e) => setFormData({ ...formData, thc_percentage: e.target.value ? parseFloat(e.target.value) : null })} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">CBD %</label>
                <Input type="number" step="0.1" value={formData.cbd_percentage || ""} onChange={(e) => setFormData({ ...formData, cbd_percentage: e.target.value ? parseFloat(e.target.value) : null })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Price (R)</label>
                <Input type="number" step="0.01" value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : null })} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Price Unit</label>
                <Select value={formData.price_unit || "per gram"} onValueChange={(v) => setFormData({ ...formData, price_unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per gram">Per Gram</SelectItem>
                    <SelectItem value="per unit">Per Unit</SelectItem>
                    <SelectItem value="per pack">Per Pack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Description</label>
              <Textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Image URL</label>
              <Input value={formData.image_url || ""} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Stock Quantity</label>
                <Input type="number" value={formData.stock_quantity || 0} onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.in_stock || false} onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })} className="rounded border-border" />
                  <span className="text-sm">In Stock</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button variant="sage" onClick={handleSaveProduct} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {editingProduct ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VendorPortal;
