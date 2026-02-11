
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Shell from "@/components/layout/Shell";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProductList from "@/pages/shop/ProductList";
import ProductDetail from "@/pages/shop/ProductDetail";
import SubscriptionPlans from "@/pages/subscription/SubscriptionPlans";
import VendorDashboard from "@/pages/vendor/VendorDashboard";

const queryClient = new QueryClient();

// Placeholder components - replace with actual pages/components later
const Home = () => (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold mb-4">Alpha Appeal</h1>
        <p className="text-lg text-muted-foreground">E-commerce Platform</p>
        <div className="flex gap-4 mt-8">
            <a href="/shop" className="text-primary hover:underline">Shop Now</a>
            <a href="/subscription" className="text-primary hover:underline">Join Club</a>
        </div>
    </div>
);

const Profile = () => (
    <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        <p className="text-muted-foreground">Manage your account, orders, and subscriptions.</p>
    </div>
);

const NotFound = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
            <p className="text-xl text-gray-700 mb-4">Oops! Page not found</p>
            <a href="/" className="text-blue-500 hover:text-blue-700 underline">
                Return to Home
            </a>
        </div>
    </div>
);

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <AuthProvider>
                <CartProvider>
                    <Toaster />
                    <BrowserRouter>
                        <Routes>
                            <Route element={<Shell />}>
                                <Route path="/" element={<Home />} />
                                <Route path="/auth/login" element={<Login />} />
                                <Route path="/auth/signup" element={<Signup />} />
                                <Route path="/shop" element={<ProductList />} />
                                <Route path="/shop/:id" element={<ProductDetail />} />
                                <Route path="/subscription" element={<SubscriptionPlans />} />

                                <Route element={<ProtectedRoute />}>
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/vendor" element={<VendorDashboard />} />
                                </Route>

                                <Route path="*" element={<NotFound />} />
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </CartProvider>
            </AuthProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
