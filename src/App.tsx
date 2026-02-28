import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Welcome from "./pages/Welcome";
import Shop from "./pages/Shop";
import Music from "./pages/Music";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Map from "./pages/Map";
import Admin from "./pages/Admin";
import VendorPortal from "./pages/VendorPortal";
import MyDiary from "./pages/MyDiary";
import Deliveries from "./pages/Deliveries";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import Legal from "./pages/Legal";
import PartnerDetail from "./pages/PartnerDetail";
import StrainDetail from "./pages/StrainDetail";
import CommunityPostDetail from "./pages/CommunityPostDetail";
import CultureItemDetail from "./pages/CultureItemDetail";
import ImportCultureData from "./pages/ImportCultureData";
import AgeGate from "./components/AgeGate";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AgeGate />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/music" element={<Music />} />
            <Route path="/community" element={<Community />} />
            <Route path="/map" element={<Map />} />
            <Route path="/partner/:partnerId" element={<PartnerDetail />} />
            <Route path="/strain/:strainSlug" element={<StrainDetail />} />
            <Route path="/community/:postId" element={<CommunityPostDetail />} />
            <Route path="/culture/:slug" element={<CultureItemDetail />} />
            <Route path="/admin/import-culture" element={<ProtectedAdminRoute><ImportCultureData /></ProtectedAdminRoute>} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-diary" element={<MyDiary />} />
            <Route path="/deliveries" element={<Deliveries />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/support" element={<Support />} />
            <Route path="/admin" element={<ProtectedAdminRoute><Admin /></ProtectedAdminRoute>} />
            <Route path="/vendor" element={<VendorPortal />} />
            <Route path="/legal" element={<Legal />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;