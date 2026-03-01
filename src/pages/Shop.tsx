import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import logoLight from "@/assets/alpha-logo-light.png";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
}

interface CartItem extends Product {
  quantity: number;
}

const Shop = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, category, image_url, description, in_stock, stock_quantity")
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (!error && data) setProducts(data as Product[]);
    setLoadingProducts(false);
  };

  useEffect(() => {
    fetchProducts();

    // Realtime listener for instant stock updates
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

  // Build unique categories from defaults + DB values, normalized to avoid duplicates
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

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        toast({ title: "Quantity Updated", description: `${product.name} × ${existing.quantity + 1}` });
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast({ title: "Added to Cart ✓", description: product.name });
      return [...prev, { ...product, quantity: 1 }];
    });
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
            <button onClick={() => setShowCart(true)} className="relative p-2">
              <ShoppingBag className="w-6 h-6 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </header>

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
                  className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:border-secondary/30 transition-all"
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
                  </div>

                  <div className="p-4">
                    {product.category && (
                      <Badge variant="outline" className={cn("text-xs mb-2", getCategoryColor(product.category))}>
                        {product.category}
                      </Badge>
                    )}
                    <h3 className="font-medium text-foreground text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.description || ""}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-secondary font-semibold text-sm">R{product.price}</span>
                      <Button
                        size="sm"
                        variant="sage"
                        onClick={() => addToCart(product)}
                        disabled={product.stock_quantity <= 0}
                        className="text-xs"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingProducts && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No products available</p>
            </div>
          )}
        </main>

        <BottomNav />
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border overflow-y-auto">
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
                      <div key={item.id} className="flex gap-4 bg-muted/30 p-4 rounded-xl">
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
                              -
                            </button>
                            <span className="text-foreground">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-foreground"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive hover:text-destructive/80 text-sm"
                        >
                          Remove
                        </button>
                      </div>
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
          </div>
        </div>
      )}
    </>
  );
};

export default Shop;
