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
const Index = lazyWithRetry(() => import("./pages/Index"));
const Signup = lazyWithRetry(() => import("./pages/Signup"));
const Login = lazyWithRetry(() => import("./pages/Login"));
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword"));
const Checkout = lazyWithRetry(() => import("./pages/Checkout"));
const CheckoutSuccess = lazyWithRetry(() => import("./pages/CheckoutSuccess"));
const Welcome = lazyWithRetry(() => import("./pages/Welcome"));
const Shop = lazyWithRetry(() => import("./pages/Shop"));
const Music = lazyWithRetry(() => import("./pages/Music"));
const Community = lazyWithRetry(() => import("./pages/Community"));
const Profile = lazyWithRetry(() => import("./pages/Profile"));
const Map = lazyWithRetry(() => import("./pages/Map"));
const Admin = lazyWithRetry(() => import("./pages/Admin"));
const VendorPortal = lazyWithRetry(() => import("./pages/VendorPortal"));
const VendorSignup = lazyWithRetry(() => import("./pages/VendorSignup"));
const VendorDiagnostic = lazyWithRetry(() => import("./pages/VendorDiagnostic"));
const MyDiary = lazyWithRetry(() => import("./pages/MyDiary"));
const Deliveries = lazyWithRetry(() => import("./pages/Deliveries"));
const Billing = lazyWithRetry(() => import("./pages/Billing"));
const Settings = lazyWithRetry(() => import("./pages/Settings"));
const Support = lazyWithRetry(() => import("./pages/Support"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const Legal = lazyWithRetry(() => import("./pages/Legal"));
const PartnerDetail = lazyWithRetry(() => import("./pages/PartnerDetail"));
const StrainDetail = lazyWithRetry(() => import("./pages/StrainDetail"));
const CommunityPostDetail = lazyWithRetry(() => import("./pages/CommunityPostDetail"));
const CultureItemDetail = lazyWithRetry(() => import("./pages/CultureItemDetail"));
const ImportCultureData = lazyWithRetry(() => import("./pages/ImportCultureData"));

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
              <Route path="/vendor-diagnostic" element={<VendorDiagnostic />} />
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
