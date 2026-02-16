import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, X, MapPin, Search, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";
import logoLight from "@/assets/alpha-logo-light.png";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string | null;
  image_url: string | null;
  description: string | null;
  in_stock: boolean | null;
  featured: boolean | null;
  trending: boolean | null;
}

interface CartItem {
  product_id: string;
  quantity: number;
  product: Product;
}

const categories = ["all", "fashion", "wellness", "accessories", "culture", "curated"];

const Shop = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
    loadSession();
  }, []);

  const loadSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUserId(session.user.id);
      loadCart(session.user.id);
    }
  };

  const loadProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name, price, category, image_url, description, in_stock, featured, trending")
      .eq("active", true)
      .order("created_at", { ascending: false });

    setProducts(data || []);
    setLoading(false);
  };

  const loadCart = async (uid: string) => {
    const { data: cartItems } = await supabase
      .from("user_cart")
      .select("product_id, quantity")
      .eq("user_id", uid);

    if (cartItems && cartItems.length > 0) {
      const productIds = cartItems.map(c => c.product_id);
      const { data: prods } = await supabase
        .from("products")
        .select("id, name, price, category, image_url, description, in_stock, featured, trending")
        .in("id", productIds);

      const mapped: CartItem[] = cartItems.map(ci => ({
        product_id: ci.product_id,
        quantity: ci.quantity,
        product: prods?.find(p => p.id === ci.product_id) || {} as Product,
      })).filter(ci => ci.product.id);

      setCart(mapped);
    }
  };

  const addToCart = async (product: Product) => {
    if (!userId) {
      toast({ title: "Please log in", description: "Sign in to add items to your cart", variant: "destructive" });
      navigate("/login");
      return;
    }

    const existing = cart.find(c => c.product_id === product.id);
    if (existing) {
      await supabase
        .from("user_cart")
        .update({ quantity: existing.quantity + 1 })
        .eq("user_id", userId)
        .eq("product_id", product.id);

      setCart(prev => prev.map(c => c.product_id === product.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      await supabase
        .from("user_cart")
        .insert({ user_id: userId, product_id: product.id, quantity: 1 });

      setCart(prev => [...prev, { product_id: product.id, quantity: 1, product }]);
    }
    toast({ title: "Added to cart", description: product.name });
  };

  const removeFromCart = async (productId: string) => {
    if (!userId) return;
    await supabase.from("user_cart").delete().eq("user_id", userId).eq("product_id", productId);
    setCart(prev => prev.filter(c => c.product_id !== productId));
  };

  const updateQuantity = async (productId: string, delta: number) => {
    if (!userId) return;
    const item = cart.find(c => c.product_id === productId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      await removeFromCart(productId);
      return;
    }
    await supabase.from("user_cart").update({ quantity: newQty }).eq("user_id", userId).eq("product_id", productId);
    setCart(prev => prev.map(c => c.product_id === productId ? { ...c, quantity: newQty } : c));
  };

  const handleCheckout = async () => {
    if (!userId || cart.length === 0) return;

    try {
      const orderNumber = `ORD-${Date.now()}`;
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          order_number: orderNumber,
          amount: cartTotal,
          order_type: "product",
          payment_status: "pending",
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      const orderItems = cart.map(c => ({
        order_id: order.id,
        product_id: c.product_id,
        quantity: c.quantity,
        price_at_purchase: c.product.price,
      }));

      await supabase.from("order_items").insert(orderItems);

      // Create delivery record
      await supabase.from("user_deliveries").insert({
        user_id: userId,
        order_id: order.id,
        status: "processing",
      });

      // Clear cart
      await supabase.from("user_cart").delete().eq("user_id", userId);
      setCart([]);
      setShowCart(false);

      toast({ title: "Order placed!", description: `Order ${orderNumber} created successfully` });
      navigate("/deliveries");
    } catch (err: any) {
      toast({ title: "Checkout failed", description: err.message, variant: "destructive" });
    }
  };

  const filteredProducts = products.filter(p => {
    const categoryMatch = selectedCategory === "all" || p.category === selectedCategory;
    const searchMatch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getCategoryColor = (cat: string | null) => {
    switch (cat) {
      case "fashion": return "bg-secondary/20 text-secondary";
      case "wellness": return "bg-green-500/20 text-green-400";
      case "accessories": return "bg-yellow-500/20 text-yellow-400";
      case "culture": return "bg-purple-500/20 text-purple-400";
      case "curated": return "bg-pink-500/20 text-pink-400";
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
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/"><img src={logoLight} alt="Alpha" className="h-7" /></Link>
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
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-card border-border" />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={cn("px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all", selectedCategory === cat ? "bg-secondary text-secondary-foreground" : "bg-card border border-border text-muted-foreground hover:border-secondary/50")}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-secondary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:border-secondary/30 transition-all">
                  <div className="relative aspect-square overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    {product.featured && (
                      <span className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    )}
                    {product.trending && !product.featured && (
                      <span className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-purple-500/80 text-white flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Trending
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
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-secondary font-semibold text-sm">R{product.price}</span>
                      <Button size="sm" variant="sage" onClick={() => addToCart(product)} disabled={!product.in_stock} className="text-xs">
                        {product.in_stock ? "Add" : "Sold Out"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No products found</p>
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
                    {cart.map(item => (
                      <div key={item.product_id} className="flex gap-4 bg-muted/30 p-4 rounded-xl">
                        {item.product.image_url ? (
                          <img src={item.product.image_url} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg" />
                        ) : (
                          <div className="w-20 h-20 bg-muted/50 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground text-sm">{item.product.name}</h3>
                          <p className="text-secondary text-sm">R{item.product.price}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <button onClick={() => updateQuantity(item.product_id, -1)} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-foreground">-</button>
                            <span className="text-foreground">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product_id, 1)} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-foreground">+</button>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.product_id)} className="text-destructive hover:text-destructive/80 text-sm">
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
                    <Button variant="sage" className="w-full py-6 text-lg" onClick={handleCheckout}>
                      Place Order
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
