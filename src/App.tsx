import { Suspense, lazy, ComponentType } from "react";

// Retry wrapper for lazy imports — handles stale chunk errors after deploys
function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(() =>
    factory().catch((err) => {
      // If chunk fetch fails, force a full reload once
      const key = "chunk_reload";
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
      }
      throw err;
    })
  );
}
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import AgeGate from "./components/AgeGate";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

// Lazy-loaded pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const Welcome = lazy(() => import("./pages/Welcome"));
const Shop = lazy(() => import("./pages/Shop"));
const Music = lazy(() => import("./pages/Music"));
const Community = lazy(() => import("./pages/Community"));
const Profile = lazy(() => import("./pages/Profile"));
const Map = lazy(() => import("./pages/Map"));
const Admin = lazy(() => import("./pages/Admin"));
const VendorPortal = lazy(() => import("./pages/VendorPortal"));
const VendorSignup = lazy(() => import("./pages/VendorSignup"));
const MyDiary = lazy(() => import("./pages/MyDiary"));
const Deliveries = lazy(() => import("./pages/Deliveries"));
const Billing = lazy(() => import("./pages/Billing"));
const Settings = lazy(() => import("./pages/Settings"));
const Support = lazy(() => import("./pages/Support"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Legal = lazy(() => import("./pages/Legal"));
const PartnerDetail = lazy(() => import("./pages/PartnerDetail"));
const StrainDetail = lazy(() => import("./pages/StrainDetail"));
const CommunityPostDetail = lazy(() => import("./pages/CommunityPostDetail"));
const CultureItemDetail = lazy(() => import("./pages/CultureItemDetail"));
const ImportCultureData = lazy(() => import("./pages/ImportCultureData"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AgeGate />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
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
              <Route path="/vendor/signup" element={<VendorSignup />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
