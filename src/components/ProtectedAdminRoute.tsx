import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldX } from "lucide-react";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading } = useAdminCheck();

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/", { replace: true });
    }
  }, [isAdmin, loading, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        <p className="text-sm text-muted-foreground">Verifying permissions…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <ShieldX className="w-12 h-12 text-destructive" />
        <h1 className="text-xl font-bold text-foreground">403 — Forbidden</h1>
        <p className="text-muted-foreground text-sm">You are not authorized to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
