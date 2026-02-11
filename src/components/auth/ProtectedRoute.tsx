
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
