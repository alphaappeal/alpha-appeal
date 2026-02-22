import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import logoLight from "@/assets/alpha-logo-light.png";
import { cn } from "@/lib/utils";
import { vendorLocations, VendorLocation } from "@/data/locations";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  inStock: boolean;
  badge?: string;
  availableAt: number[];
}

interface CartItem extends Product {
  quantity: number;
}

const products: Product[] = [
  {
    id: 1,
    name: "Alpha Signature Hoodie",
    price: 1299,
    category: "fashion",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
    description: "Premium cotton blend hoodie with embroidered logo",
    inStock: true,
    badge: "New",
    availableAt: [1, 5]
  },
  {
    id: 2,
    name: "Wellness Starter Kit",
    price: 899,
    category: "wellness",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500",
    description: "Curated selection of botanical wellness essentials",
    inStock: true,
    availableAt: [1, 2, 3]
  },
  {
    id: 3,
    name: "Alpha Tote Bag",
    price: 599,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500",
    description: "Sustainable canvas tote with leather accents",
    inStock: true,
    availableAt: [1, 2, 4, 5]
  },
  {
    id: 4,
    name: "Premium Lifestyle Box",
    price: 2499,
    category: "curated",
    image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=500",
    description: "Monthly curated box of culture, fashion & wellness",
    inStock: true,
    badge: "Elite",
    availableAt: [1]
  },
  {
    id: 5,
    name: "Alpha Snapback",
    price: 499,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500",
    description: "Embroidered premium snapback cap",
    inStock: true,
    availableAt: [1, 2, 3, 4, 5]
  },
  {
    id: 6,
    name: "Botanical Blend Set",
    price: 1499,
    category: "wellness",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500",
    description: "Curated botanical experience collection",
    inStock: true,
    availableAt: [1, 2, 3]
  },
  {
    id: 7,
    name: "Alpha Track Jacket",
    price: 1899,
    category: "fashion",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500",
    description: "Retro-inspired track jacket with modern cut",
    inStock: true,
    badge: "Trending",
    availableAt: [1, 4, 5]
  },
  {
    id: 8,
    name: "Culture Zine Vol. 1",
    price: 299,
    category: "culture",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500",
    description: "Quarterly culture magazine featuring SA creators",
    inStock: true,
    availableAt: [1, 2, 3, 4, 5]
  }
];

const categories = ["all", "fashion", "wellness", "accessories", "culture", "curated"];

const Shop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [pickupStore, setPickupStore] = useState<number | null>(null);

  // Handle navigation state from Map page
  useEffect(() => {
    const state = location.state as { selectedLocation?: number } | null;
    if (state?.selectedLocation) {
      setSelectedLocation(state.selectedLocation);
    }
  }, [location.state]);

  // Filter products by category and location
  const filteredProducts = products.filter(p => {
    const categoryMatch = selectedCategory === "all" || p.category === selectedCategory;
    const locationMatch = !selectedLocation || p.availableAt.includes(selectedLocation);
    return categoryMatch && locationMatch;
  });

  // Get store names for a product
  const getStoreNames = (productId: number): string[] => {
    const product = products.find(p => p.id === productId);
    if (!product) return [];
    return product.availableAt.map(storeId => {
      const store = vendorLocations.find(v => v.id === storeId);
      return store ? store.shortName : '';
    }).filter(Boolean);
  };

  // Navigate to map with selected store
  const viewOnMap = (storeId: number) => {
    navigate('/map', { state: { selectedStoreId: storeId } });
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "fashion": return "bg-secondary/20 text-secondary";
      case "wellness": return "bg-green-500/20 text-green-400";
      case "accessories": return "bg-gold/20 text-gold";
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
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/">
              <img src={logoLight} alt="Alpha" className="h-7" />
            </Link>
            <h1 className="font-display text-lg font-semibold text-foreground">Shop</h1>
            <button 
              onClick={() => setShowCart(true)} 
              className="relative p-2"
            >
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
          {/* Location Filter */}
          <div className="mb-6">
            <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-secondary" />
              Shop by Location
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedLocation(null)}
                className={cn(
                  "px-4 py-2 rounded-full font-semibold whitespace-nowrap flex items-center gap-2 text-sm transition-all",
                  !selectedLocation
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:border-secondary/50"
                )}
              >
                All Locations
              </button>
              {vendorLocations.map(location => (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location.id)}
                  className={cn(
                    "px-4 py-2 rounded-full font-semibold whitespace-nowrap text-sm transition-all",
                    selectedLocation === location.id
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-card border border-border text-muted-foreground hover:border-secondary/50"
                  )}
                >
                  {location.shortName}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {categories.map(cat => (
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
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:border-secondary/30 transition-all"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.badge && (
                    <span className={cn(
                      "absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium",
                      product.badge === "New" ? "bg-secondary text-secondary-foreground" :
                      product.badge === "Elite" ? "bg-gold text-gold-foreground" :
                      "bg-purple-500 text-white"
                    )}>
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <Badge variant="outline" className={cn("text-xs mb-2", getCategoryColor(product.category))}>
                    {product.category}
                  </Badge>
                  <h3 className="font-medium text-foreground text-sm mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Available At */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {getStoreNames(product.id).slice(0, 2).map((storeName, idx) => (
                        <span 
                          key={idx}
                          className="text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded"
                        >
                          {storeName}
                        </span>
                      ))}
                      {getStoreNames(product.id).length > 2 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{getStoreNames(product.id).length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-secondary font-semibold text-sm">R{product.price}</span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedProduct(product)}
                        className="text-xs px-2"
                      >
                        <MapPin className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="sage"
                        onClick={() => addToCart(product)}
                        className="text-xs"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No products available at this location</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSelectedLocation(null)}
              >
                View All Locations
              </Button>
            </div>
          )}
        </main>

        <BottomNav />
      </div>

      {/* Store Selection Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedProduct(null)}
          />
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-card rounded-2xl p-6 border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-display font-bold text-foreground">Find in Store</h3>
              <button onClick={() => setSelectedProduct(null)}>
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>

            <p className="text-muted-foreground mb-4 text-sm">
              Select a location to view <span className="text-foreground font-medium">{selectedProduct.name}</span> on the map:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedProduct.availableAt.map(storeId => {
                const store = vendorLocations.find(v => v.id === storeId);
                if (!store) return null;
                
                return (
                  <button
                    key={storeId}
                    onClick={() => {
                      viewOnMap(storeId);
                      setSelectedProduct(null);
                    }}
                    className="w-full text-left p-4 bg-muted/30 hover:bg-muted/50 rounded-xl transition-all border border-border hover:border-secondary/50"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{store.name}</h4>
                        <p className="text-xs text-muted-foreground">{store.address}</p>
                        <p className="text-xs text-muted-foreground mt-1">{store.hours}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <Button
              onClick={() => setSelectedProduct(null)}
              variant="outline"
              className="w-full mt-4"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-foreground">Your Cart</h2>
                <button 
                  onClick={() => setShowCart(false)}
                  className="p-2 text-muted-foreground hover:text-foreground"
                >
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
                      <div key={item.id} className="flex gap-4 bg-muted/30 p-4 rounded-xl">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-20 h-20 object-cover rounded-lg"
                        />
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

                  {/* Pickup Location Selection */}
                  <div className="mb-6 p-4 bg-muted/30 rounded-xl">
                    <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-secondary" />
                      Pickup Location
                    </h3>
                    <select
                      value={pickupStore || ''}
                      onChange={(e) => setPickupStore(Number(e.target.value) || null)}
                      className="w-full p-3 bg-background text-foreground rounded-xl border border-border focus:border-secondary focus:outline-none"
                    >
                      <option value="">Select a store for pickup</option>
                      {vendorLocations.map(store => (
                        <option key={store.id} value={store.id}>
                          {store.shortName} - {store.address}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between text-lg font-bold text-foreground mb-4">
                      <span>Total:</span>
                      <span>R{cartTotal.toLocaleString()}</span>
                    </div>
                    <Button 
                      variant="sage" 
                      className={cn(
                        "w-full py-6 text-lg",
                        !pickupStore && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={!pickupStore}
                      onClick={() => navigate("/checkout", { state: { cart } })}
                    >
                      {pickupStore ? 'Proceed to Checkout' : 'Select Pickup Location'}
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
