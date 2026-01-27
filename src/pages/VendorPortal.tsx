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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Store,
  Loader2,
  Save,
  ArrowLeft,
  Check,
  X,
  DollarSign,
  Box,
  AlertCircle,
} from "lucide-react";
import logoLight from "@/assets/alpha-logo-light.png";

interface VendorAccount {
  id: string;
  partner_id: string;
  role: string;
  alpha_partners: {
    id: string;
    name: string;
    alpha_status: string;
    city: string;
    hero_image: string | null;
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

const VendorPortal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [vendorAccount, setVendorAccount] = useState<VendorAccount | null>(null);
  const [products, setProducts] = useState<PartnerProduct[]>([]);
  const [editingProduct, setEditingProduct] = useState<PartnerProduct | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const emptyProduct: Partial<PartnerProduct> = {
    name: "",
    category: "flower",
    strain_type: "hybrid",
    thc_percentage: null,
    cbd_percentage: null,
    price: null,
    price_unit: "per gram",
    description: "",
    image_url: "",
    in_stock: true,
    stock_quantity: 0,
  };

  const [formData, setFormData] = useState<Partial<PartnerProduct>>(emptyProduct);

  useEffect(() => {
    checkVendorAccess();
  }, []);

  const checkVendorAccess = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data: vendorData, error } = await supabase
        .from("vendor_accounts")
        .select(
          `
          id,
          partner_id,
          role,
          alpha_partners (
            id,
            name,
            alpha_status,
            city,
            hero_image
          )
        `
        )
        .eq("user_id", user.id)
        .single();

      if (error || !vendorData) {
        toast({
          title: "Access Denied",
          description: "You don't have vendor access. Contact an admin to get set up.",
          variant: "destructive",
        });
        navigate("/profile");
        return;
      }

      setVendorAccount(vendorData as unknown as VendorAccount);
      await loadProducts(vendorData.partner_id);
    } catch (err: any) {
      console.error("Vendor check error:", err);
      navigate("/profile");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (partnerId: string) => {
    try {
      const { data, error } = await supabase
        .from("partner_products")
        .select("*")
        .eq("partner_id", partnerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      toast({
        title: "Error loading products",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !vendorAccount) {
      toast({
        title: "Missing required fields",
        description: "Please fill in the product name",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from("partner_products")
          .update({
            name: formData.name,
            category: formData.category,
            strain_type: formData.strain_type,
            thc_percentage: formData.thc_percentage,
            cbd_percentage: formData.cbd_percentage,
            price: formData.price,
            price_unit: formData.price_unit,
            description: formData.description,
            image_url: formData.image_url,
            in_stock: formData.in_stock,
            stock_quantity: formData.stock_quantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingProduct.id);

        if (error) throw error;
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        const { error } = await supabase.from("partner_products").insert([
          {
            name: formData.name!,
            partner_id: vendorAccount.partner_id,
            category: formData.category,
            strain_type: formData.strain_type,
            thc_percentage: formData.thc_percentage,
            cbd_percentage: formData.cbd_percentage,
            price: formData.price,
            price_unit: formData.price_unit,
            description: formData.description,
            image_url: formData.image_url,
            in_stock: formData.in_stock,
            stock_quantity: formData.stock_quantity,
          },
        ]);

        if (error) throw error;
        toast({ title: "Success", description: "Product created successfully" });
      }

      closeDialog();
      loadProducts(vendorAccount.partner_id);
    } catch (err: any) {
      toast({
        title: "Error saving product",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase.from("partner_products").delete().eq("id", productId);

      if (error) throw error;
      toast({ title: "Success", description: "Product deleted successfully" });
      if (vendorAccount) loadProducts(vendorAccount.partner_id);
    } catch (err: any) {
      toast({
        title: "Error deleting product",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const toggleStock = async (product: PartnerProduct) => {
    try {
      const { error } = await supabase
        .from("partner_products")
        .update({ in_stock: !product.in_stock })
        .eq("id", product.id);

      if (error) throw error;
      if (vendorAccount) loadProducts(vendorAccount.partner_id);
    } catch (err: any) {
      toast({
        title: "Error updating stock",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (product: PartnerProduct) => {
    setEditingProduct(product);
    setFormData(product);
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setFormData(emptyProduct);
    setIsAddDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingProduct(null);
    setIsAddDialogOpen(false);
    setFormData(emptyProduct);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!vendorAccount) return null;

  const inStockCount = products.filter((p) => p.in_stock).length;
  const outOfStockCount = products.filter((p) => !p.in_stock).length;

  return (
    <>
      <Helmet>
        <title>Vendor Portal | Alpha Appeal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/profile" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Link to="/">
                <img src={logoLight} alt="Alpha" className="h-7" />
              </Link>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Store className="w-3 h-3" />
              Vendor
            </Badge>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Partner Info */}
          <div className="mb-8">
            <div className="flex items-start gap-4">
              {vendorAccount.alpha_partners.hero_image && (
                <img
                  src={vendorAccount.alpha_partners.hero_image}
                  alt={vendorAccount.alpha_partners.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              )}
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-1">
                  {vendorAccount.alpha_partners.name}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      vendorAccount.alpha_partners.alpha_status === "exclusive"
                        ? "default"
                        : "secondary"
                    }
                    className="capitalize"
                  >
                    {vendorAccount.alpha_partners.alpha_status}
                  </Badge>
                  <span className="text-muted-foreground text-sm">
                    {vendorAccount.alpha_partners.city}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{products.length}</p>
                    <p className="text-xs text-muted-foreground">Total Products</p>
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
                    <p className="text-2xl font-bold text-foreground capitalize">
                      {vendorAccount.role}
                    </p>
                    <p className="text-xs text-muted-foreground">Your Role</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-foreground">Your Products</h2>
              <Button variant="sage" onClick={openAddDialog} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>

            {products.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Box className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No products yet</p>
                  <Button variant="sage" onClick={openAddDialog}>
                    Add Your First Product
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    {product.image_url && (
                      <div className="aspect-video relative">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{product.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {product.category} • {product.strain_type}
                          </p>
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
                          {product.thc_percentage && (
                            <Badge variant="outline" className="text-xs">
                              THC: {product.thc_percentage}%
                            </Badge>
                          )}
                          {product.cbd_percentage && (
                            <Badge variant="outline" className="text-xs">
                              CBD: {product.cbd_percentage}%
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2 border-t border-border/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStock(product)}
                          className={product.in_stock ? "text-destructive" : "text-green-500"}
                        >
                          {product.in_stock ? (
                            <>
                              <X className="w-4 h-4 mr-1" /> Mark Out
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-1" /> Mark In
                            </>
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)}>
                          <Edit2 className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Add/Edit Product Dialog */}
        <Dialog open={!!editingProduct || isAddDialogOpen} onOpenChange={closeDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Product Name *</label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Category</label>
                  <Select
                    value={formData.category || "flower"}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                  <Select
                    value={formData.strain_type || "hybrid"}
                    onValueChange={(value) => setFormData({ ...formData, strain_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.thc_percentage || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        thc_percentage: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    placeholder="e.g., 22.5"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">CBD %</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.cbd_percentage || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cbd_percentage: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    placeholder="e.g., 1.2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Price (R)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    placeholder="e.g., 150"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Price Unit</label>
                  <Select
                    value={formData.price_unit || "per gram"}
                    onValueChange={(value) => setFormData({ ...formData, price_unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the product..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Image URL</label>
                <Input
                  value={formData.image_url || ""}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Stock Quantity</label>
                  <Input
                    type="number"
                    value={formData.stock_quantity || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.in_stock || false}
                      onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                      className="rounded border-border"
                    />
                    <span className="text-sm">In Stock</span>
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button variant="sage" onClick={handleSaveProduct} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {editingProduct ? "Save Changes" : "Create Product"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default VendorPortal;
