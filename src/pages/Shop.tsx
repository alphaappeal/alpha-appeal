import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, X, Loader2, Plus, Minus, CheckCircle, ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import logoLight from "@/assets/alpha-logo-light.png";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_CATEGORIES = ["Art", "Fashion", "Flowers & Edibles", "Supplements", "Accessories"];

interface Product {
  id: string;
  name: string;
  price: number;
  category: string | null;
  image_url: string | null;
  description: string | null;
  in_stock: boolean | null;
  stock_quantity: number;
  store_name?: string | null;
}

interface CartItem extends Product {
  quantity: number;
}

const Shop = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Product preview state
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [previewQty, setPreviewQty] = useState(1);

  // Post-add feedback state
  const [cartBounce, setCartBounce] = useState(false);
  const [addedToast, setAddedToast] = useState<{ product: Product; qty: number } | null>(null);

  const cartIconRef = useRef<HTMLButtonElement>(null);

  const fetchProducts = async () => {
    setFetchError(null);
    try {
      const { data: platformProducts, error: platformError } = await supabase
        .from("products")
        .select("id, name, price, category, image_url, description, in_stock, stock_quantity")
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (platformError) throw platformError;

      const { data: partnerProducts, error: partnerError } = await supabase
        .from("partner_products")
        .select("id, name, price, category, image_url, description, in_stock, stock_quantity, alpha_partners(name)")
        .eq("in_stock", true)
        .order("created_at", { ascending: false });
      if (partnerError) throw partnerError;

      const mappedPartnerProducts: Product[] = (partnerProducts || []).map((pp: any) => ({
        id: pp.id,
        name: pp.name,
        price: pp.price || 0,
        category: pp.category,
        image_url: pp.image_url,
        description: pp.description,
        in_stock: pp.in_stock,
        stock_quantity: pp.stock_quantity || 0,
        store_name: pp.alpha_partners?.name || null,
      }));

      setProducts([...(platformProducts as Product[]), ...mappedPartnerProducts]);
    } catch (err: any) {
      console.error("Failed to fetch products:", err);
      setFetchError("Unable to load products. Please try again.");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel("products-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, (payload) => {
        if (payload.eventType === "UPDATE") {
          setProducts((prev) =>
            prev.map((p) => (p.id === (payload.new as Product).id ? { ...p, ...(payload.new as Product) } : p))
          );
        } else if (payload.eventType === "DELETE") {
          setProducts((prev) => prev.filter((p) => p.id !== (payload.old as any).id));
        } else if (payload.eventType === "INSERT" && (payload.new as any).active) {
          setProducts((prev) => [(payload.new as Product), ...prev]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const dbCategories = products.map((p) => p.category).filter(Boolean) as string[];
  const seen = new Map<string, string>();
  [...DEFAULT_CATEGORIES, ...dbCategories].forEach((cat) => {
    const key = cat.toLowerCase().trim();
    if (!seen.has(key)) seen.set(key, cat);
  });
  const allCats = Array.from(seen.values());
  const categories = ["all", ...allCats];

  const filteredProducts = products.filter(
    (p) => selectedCategory === "all" || p.category?.toLowerCase() === selectedCategory.toLowerCase()
  );

  const openPreview = (product: Product) => {
    setPreviewProduct(product);
    setPreviewQty(1);
  };

  const confirmAddToCart = () => {
    if (!previewProduct) return;
    const product = previewProduct;
    const qty = previewQty;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });

    // Show success feedback
    setAddedToast({ product, qty });
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 600);
    setTimeout(() => setAddedToast(null), 4000);

    setPreviewProduct(null);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "fashion": return "bg-secondary/20 text-secondary";
      case "art": return "bg-purple-500/20 text-purple-400";
      case "flowers & edibles": return "bg-green-500/20 text-green-400";
      case "supplements": return "bg-blue-500/20 text-blue-400";
      case "accessories": return "bg-primary/20 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <>
      <Helmet>
        <title>Shop | Alpha</title>
        <meta name="description" content="Shop exclusive Alpha merchandise and lifestyle products." />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/">
              <img src={logoLight} alt="Alpha" className="h-7" />
            </Link>
            <h1 className="font-display text-lg font-semibold text-foreground">Shop</h1>
            <button
              ref={cartIconRef}
              onClick={() => setShowCart(true)}
              className={cn("relative p-2 transition-transform", cartBounce && "animate-[bounce_0.5s_ease-in-out]")}
            >
              <ShoppingBag className="w-6 h-6 text-foreground" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center justify-center font-semibold"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </header>

        {/* Post-add success toast */}
        <AnimatePresence>
          {addedToast && (
            <motion.div
              initial={{ y: -80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -80, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm"
            >
              <div className="bg-card border border-secondary/30 rounded-2xl p-4 shadow-lg shadow-secondary/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {addedToast.product.name} × {addedToast.qty}
                  </p>
                  <p className="text-xs text-muted-foreground">Added to cart — ready to checkout</p>
                </div>
                <button
                  onClick={() => { setAddedToast(null); setShowCart(true); }}
                  className="shrink-0 flex items-center gap-1 text-xs font-medium text-secondary hover:text-secondary/80 transition-colors"
                >
                  View <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="container mx-auto px-4 py-6">
          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  selectedCategory === cat
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:border-secondary/50"
                )}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loadingProducts && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-secondary" />
            </div>
          )}

          {/* Products Grid */}
          {!loadingProducts && (
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:border-secondary/30 transition-all cursor-pointer"
                  onClick={() => openPreview(product)}
                >
                  <div className="relative aspect-square overflow-hidden bg-muted/30">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ShoppingBag className="w-10 h-10 opacity-30" />
                      </div>
                    )}
                    {product.stock_quantity <= 0 && (
                      <span className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-destructive text-destructive-foreground">
                        Sold Out
                      </span>
                    )}
                    {/* Quick-view overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> Quick View
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    {product.category && (
                      <Badge variant="outline" className={cn("text-xs mb-2", getCategoryColor(product.category))}>
                        {product.category}
                      </Badge>
                    )}
                    {product.store_name && (
                      <p className="text-xs text-muted-foreground mb-1 truncate">by {product.store_name}</p>
                    )}
                    <h3 className="font-medium text-foreground text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.description || ""}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-secondary font-semibold text-sm">R{product.price}</span>
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Eye className="w-3 h-3" /> Details
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingProducts && fetchError && (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-destructive opacity-50" />
              <p className="text-foreground font-medium mb-2">Something went wrong</p>
              <p className="text-muted-foreground text-sm mb-4">{fetchError}</p>
              <Button variant="outline" onClick={fetchProducts}>Try Again</Button>
            </div>
          )}

          {!loadingProducts && !fetchError && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No products available</p>
            </div>
          )}
        </main>

        <BottomNav />
      </div>

      {/* ── Product Preview Modal ── */}
      <AnimatePresence>
        {previewProduct && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewProduct(null)} />

            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl border border-border/50 overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Close */}
              <button
                onClick={() => setPreviewProduct(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Image */}
              <div className="relative aspect-[4/3] bg-muted/30 shrink-0">
                {previewProduct.image_url ? (
                  <img
                    src={previewProduct.image_url}
                    alt={previewProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ShoppingBag className="w-16 h-16 opacity-20" />
                  </div>
                )}
                {previewProduct.stock_quantity <= 0 && (
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="destructive">Sold Out</Badge>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {previewProduct.category && (
                        <Badge variant="outline" className={cn("text-xs mb-2", getCategoryColor(previewProduct.category))}>
                          {previewProduct.category}
                        </Badge>
                      )}
                      <h2 className="font-display text-xl font-bold text-foreground">{previewProduct.name}</h2>
                      {previewProduct.store_name && (
                        <p className="text-sm text-muted-foreground mt-0.5">by {previewProduct.store_name}</p>
                      )}
                    </div>
                    <span className="text-2xl font-bold text-secondary shrink-0">
                      R{previewProduct.price}
                    </span>
                  </div>
                </div>

                {previewProduct.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{previewProduct.description}</p>
                )}

                {previewProduct.stock_quantity > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {previewProduct.stock_quantity <= 5
                      ? `Only ${previewProduct.stock_quantity} left in stock`
                      : "In stock"}
                  </p>
                )}

                {/* Quantity selector */}
                {previewProduct.stock_quantity > 0 && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Quantity</span>
                    <div className="flex items-center gap-3 bg-muted/40 rounded-full px-1 py-1">
                      <button
                        onClick={() => setPreviewQty(Math.max(1, previewQty - 1))}
                        className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-semibold text-foreground">{previewQty}</span>
                      <button
                        onClick={() => setPreviewQty(Math.min(previewProduct.stock_quantity, previewQty + 1))}
                        className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-foreground ml-auto">
                      R{(previewProduct.price * previewQty).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Action bar */}
              <div className="p-6 pt-0 shrink-0">
                <Button
                  variant="sage"
                  className="w-full py-6 text-base gap-2"
                  disabled={previewProduct.stock_quantity <= 0}
                  onClick={confirmAddToCart}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {previewProduct.stock_quantity <= 0
                    ? "Out of Stock"
                    : `Add to Cart — R${(previewProduct.price * previewQty).toLocaleString()}`}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cart Slide-over ── */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCart(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold text-foreground">Your Cart</h2>
                  <button onClick={() => setShowCart(false)} className="p-2 text-muted-foreground hover:text-foreground">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cart.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 50 }}
                          className="flex gap-4 bg-muted/30 p-4 rounded-xl"
                        >
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                          ) : (
                            <div className="w-20 h-20 rounded-lg bg-muted/50 flex items-center justify-center">
                              <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground text-sm">{item.name}</h3>
                            <p className="text-secondary text-sm">R{item.price}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-foreground"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-foreground font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-foreground"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-destructive hover:text-destructive/80 text-sm"
                          >
                            Remove
                          </button>
                        </motion.div>
                      ))}
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between text-lg font-bold text-foreground mb-4">
                        <span>Total:</span>
                        <span>R{cartTotal.toLocaleString()}</span>
                      </div>
                      <Button
                        variant="sage"
                        className="w-full py-6 text-lg"
                        onClick={() => navigate("/checkout", { state: { cart } })}
                      >
                        Proceed to Checkout
                      </Button>
                      <p className="text-center text-xs text-muted-foreground mt-3">
                        Secure checkout powered by PayFast
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Shop;