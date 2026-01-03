import { useState } from "react";
import { Helmet } from "react-helmet-async";
import BottomNav from "@/components/BottomNav";
import FloatingMenuButton, { MenuItem } from "@/components/FloatingMenuButton";
import TimedPopup from "@/components/TimedPopup";
import { ShoppingBag, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logoLight from "@/assets/alpha-logo-light.png";

interface PopupState {
  isOpen: boolean;
  title: string;
  message: string;
}

const Shop = () => {
  const [popup, setPopup] = useState<PopupState>({ isOpen: false, title: "", message: "" });

  const showPopup = (title: string, message: string) => {
    setPopup({ isOpen: true, title, message });
  };

  const products = [
    { id: 1, name: "Alpha Essential Tray", price: 299, badge: "New", locked: false },
    { id: 2, name: "Signature Lighter", price: 149, badge: null, locked: false },
    { id: 3, name: "Premium Storage Case", price: 449, badge: "Elite Only", locked: true },
    { id: 4, name: "Limited Edition Hoodie", price: 899, badge: "Coming Soon", locked: true },
  ];

  return (
    <>
      <Helmet>
        <title>Shop | Alpha</title>
        <meta name="description" content="Exclusive Alpha merchandise and lifestyle products." />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/">
              <img src={logoLight} alt="Alpha" className="h-7" />
            </Link>
            <h1 className="font-display text-lg font-semibold text-foreground">Shop</h1>
            <div className="w-14" />
          </div>
        </header>

        <FloatingMenuButton>
          <MenuItem onClick={() => showPopup("Get Delivery", "Delivery Service for your local stores launching soon. Premium Members get free delivery. Add your store to our delivery list by clicking DELIVERIES in profile tab")}>
            Get Delivery
          </MenuItem>
          <MenuItem onClick={() => showPopup("Suggest", "Suggest new products and items that you need in the store. Email shop@alphaappeal.co.za to submit")}>
            Suggest
          </MenuItem>
        </FloatingMenuButton>

        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <ShoppingBag className="w-10 h-10 text-secondary mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Member Shop
            </h2>
            <p className="text-muted-foreground">
              Exclusive drops and limited editions
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className={`relative rounded-2xl overflow-hidden border ${
                  product.locked ? "opacity-60" : ""
                } border-border/50 bg-card/30`}
              >
                <div className="aspect-square bg-muted/30 flex items-center justify-center">
                  {product.locked ? (
                    <Lock className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                {product.badge && (
                  <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                    product.badge === "New" ? "bg-secondary text-secondary-foreground" :
                    product.badge === "Elite Only" ? "bg-gold text-gold-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {product.badge}
                  </span>
                )}
                <div className="p-4">
                  <h3 className="font-medium text-foreground text-sm mb-1">{product.name}</h3>
                  <p className="text-secondary font-semibold">R{product.price}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-card/50 border border-border/50 text-center">
            <p className="text-muted-foreground text-sm mb-4">
              Full shop launching soon with exclusive member pricing
            </p>
            <Button variant="glass" size="sm">
              Get Notified
            </Button>
          </div>
        </main>

        <BottomNav />
      </div>

      {popup.isOpen && (
        <TimedPopup
          title={popup.title}
          message={popup.message}
          duration={10}
          onClose={() => setPopup({ ...popup, isOpen: false })}
        />
      )}
    </>
  );
};

export default Shop;