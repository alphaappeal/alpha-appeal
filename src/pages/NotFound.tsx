import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import alphaLogo from "@/assets/alpha-logo-light.png";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <img 
          src={alphaLogo} 
          alt="Alpha Appeal" 
          className="h-10 w-auto mx-auto mb-12 opacity-60"
        />
        <h1 className="font-display text-7xl md:text-9xl font-bold text-gradient-sage mb-4">
          404
        </h1>
        <p className="text-foreground text-xl md:text-2xl font-medium mb-2">
          Page not found
        </p>
        <p className="text-muted-foreground text-base mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button 
          variant="sage" 
          size="lg" 
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <Home className="w-4 h-4" />
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
