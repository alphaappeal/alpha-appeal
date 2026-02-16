import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Package, ShoppingBag } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import logoLight from "@/assets/alpha-logo-light.png";

const Deliveries = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>My Deliveries | Alpha</title>
        <meta name="description" content="Track your Alpha deliveries." />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={() => navigate("/profile")} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="font-display text-lg font-semibold text-foreground">My Deliveries</h1>
            <Link to="/">
              <img src={logoLight} alt="Alpha" className="h-6" />
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              No orders delivered yet
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
              Your delivery history will appear here once you make a purchase
            </p>
            <Button
              onClick={() => navigate("/shop")}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Browse Shop
            </Button>
          </div>
        </main>

        <BottomNav />
      </div>
    </>
  );
};

export default Deliveries;