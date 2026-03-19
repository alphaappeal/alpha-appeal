import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  DollarSign,
  Package,
  ShoppingBag,
  Palette,
  Store,
  MapPin,
  Calendar,
  Truck,
  Activity,
  Settings,
  Search,
  Shield,
  Loader2,
  ChevronRight,
  Command,
  ArrowLeft,
  Bell,
  Menu,
  X,
  RefreshCw,
} from "lucide-react";
import logoLight from "@/assets/alpha-logo-light.png";

import AdminOverview from "./AdminOverview";
import AdminUsersSection from "./AdminUsersSection";
import AdminSubscriptions from "./AdminSubscriptions";
import AdminFinancials from "./AdminFinancials";
import AdminContentSection from "./AdminContentSection";
import SystemActivityTab from "./SystemActivityTab";
import SystemHealthTab from "./SystemHealthTab";
import AdminSettingsSection from "./AdminSettingsSection";
import VendorsTab from "./VendorsTab";

type AdminSection =
  | "overview"
  | "users"
  | "subscriptions"
  | "financials"
  | "content"
  | "vendors"
  | "health"
  | "activity"
  | "settings";

const NAV_ITEMS: { id: AdminSection; label: string; icon: any; group: string }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, group: "Dashboard" },
  { id: "users", label: "Users", icon: Users, group: "Management" },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard, group: "Management" },
  { id: "financials", label: "Financials", icon: DollarSign, group: "Management" },
  { id: "content", label: "Content & Products", icon: Package, group: "Platform" },
  { id: "vendors", label: "Vendors", icon: Store, group: "Platform" },
  { id: "health", label: "System Health", icon: RefreshCw, group: "System" },
  { id: "activity", label: "System Logs", icon: Activity, group: "System" },
  { id: "settings", label: "Settings", icon: Settings, group: "System" },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [globalSearch, setGlobalSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // All data states
  const [profiles, setProfiles] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin access is enforced by ProtectedAdminRoute wrapper

  const profileMap = new Map<string, { name: string; email: string }>();
  profiles.forEach((p) => {
    profileMap.set(p.id, {
      name: p.full_name || p.username || "Unknown",
      email: p.email || "",
    });
  });

  const resolveUser = (userId: string | null) => {
    if (!userId) return { name: "N/A", email: "" };
    return profileMap.get(userId) || { name: "User", email: userId.slice(0, 8) + "…" };
  };

  const loadProfiles = useCallback(async () => {
    const { data } = await supabase.from("profiles").select("id, full_name, username, email, tier, subscription_tier, payment_status, application_status, created_at, role").order("created_at", { ascending: false });
    setProfiles(data || []);
  }, []);

  const loadSubscriptions = useCallback(async () => {
    const { data } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false });
    setSubscriptions(data || []);
  }, []);

  const loadOrders = useCallback(async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
  }, []);

  const loadApplications = useCallback(async () => {
    const { data } = await supabase.from("private_member_applications").select("*").order("created_at", { ascending: false });
    setApplications(data || []);
  }, []);

  const loadDiary = useCallback(async () => {
    const { data } = await supabase.from("diary_entries").select("*").order("created_at", { ascending: false });
    setDiaryEntries(data || []);
  }, []);

  const loadProducts = useCallback(async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
  }, []);

  const loadLocations = useCallback(async () => {
    const { data } = await supabase.from("map_locations").select("*").order("created_at", { ascending: false });
    setLocations(data || []);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadProfiles(), loadSubscriptions(), loadOrders(), loadApplications(), loadDiary(), loadProducts(), loadLocations()]);
    setLoading(false);
  }, [loadProfiles, loadSubscriptions, loadOrders, loadApplications, loadDiary, loadProducts, loadLocations]);

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin, loadAll]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === "Escape") setShowSearch(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Global search results
  const searchResults = globalSearch.length >= 2
    ? profiles
        .filter(p =>
          (p.full_name || "").toLowerCase().includes(globalSearch.toLowerCase()) ||
          (p.email || "").toLowerCase().includes(globalSearch.toLowerCase()) ||
          (p.id || "").toLowerCase().includes(globalSearch.toLowerCase())
        )
        .slice(0, 8)
    : [];

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-admin-emerald" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const groups = [...new Set(NAV_ITEMS.map(n => n.group))];

  const breadcrumb = ["Admin", NAV_ITEMS.find(n => n.id === activeSection)?.label || "Overview"];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Alpha</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-admin-bg flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-admin-surface border-r border-admin-border flex flex-col transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {/* Logo */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-admin-border">
            <Link to="/" className="flex items-center gap-2" aria-label="Go to homepage">
              <img src={logoLight} alt="Alpha" className="h-6" />
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground" aria-label="Close sidebar">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {groups.map(group => (
              <div key={group}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-2">{group}</p>
                <div className="space-y-0.5">
                  {NAV_ITEMS.filter(n => n.group === group).map(item => {
                    const Icon = item.icon;
                    const active = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          active
                            ? "bg-admin-emerald/10 text-admin-emerald"
                            : "text-muted-foreground hover:text-foreground hover:bg-admin-surface-hover"
                        }`}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>{item.label}</span>
                        {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="p-3 border-t border-admin-border space-y-1">
            <button
              onClick={() => {
                sessionStorage.setItem("admin_view_as_user", "true");
                navigate("/profile");
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-admin-surface-hover transition-colors"
              aria-label="View application as regular user"
            >
              <Users className="w-4 h-4" aria-hidden="true" />
              <span>View as User</span>
            </button>
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-admin-surface-hover transition-colors"
              aria-label="Return to main application"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Return to App</span>
            </Link>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-40 h-14 bg-admin-surface/80 backdrop-blur-xl border-b border-admin-border flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground">
                <Menu className="w-5 h-5" />
              </button>
              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center gap-1.5 text-sm">
                {breadcrumb.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground/40" />}
                    <span className={i === breadcrumb.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"}>
                      {crumb}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search trigger */}
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-admin-surface-hover text-muted-foreground text-sm hover:text-foreground transition-colors"
                aria-label="Open search" aria-keyshortcuts="Meta+K"
              >
                <Search className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Search…</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-admin-border text-[10px] font-mono">
                  <Command className="w-2.5 h-2.5" aria-hidden="true" />K
                </kbd>
              </button>

              {/* Status indicator */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-admin-emerald/10 text-admin-emerald text-[11px] font-medium" role="status">
                <span className="w-1.5 h-1.5 rounded-full bg-admin-emerald animate-pulse" aria-hidden="true" />
                Operational
              </div>

              <Badge variant="outline" className="gap-1 border-admin-border text-muted-foreground">
                <Shield className="w-3 h-3" aria-hidden="true" /> Admin
              </Badge>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {activeSection === "overview" && (
              <AdminOverview
                profiles={profiles}
                subscriptions={subscriptions}
                orders={orders}
                applications={applications}
                loading={loading}
              />
            )}
            {activeSection === "users" && (
              <AdminUsersSection
                profiles={profiles}
                applications={applications}
                loading={loading}
                onRefresh={loadAll}
                resolveUser={resolveUser}
              />
            )}
            {activeSection === "subscriptions" && (
              <AdminSubscriptions
                subscriptions={subscriptions}
                loading={loading}
                resolveUser={resolveUser}
              />
            )}
            {activeSection === "financials" && (
              <AdminFinancials
                orders={orders}
                loading={loading}
                resolveUser={resolveUser}
                onRefresh={loadOrders}
              />
            )}
            {activeSection === "content" && (
              <AdminContentSection
                products={products}
                diaryEntries={diaryEntries}
                locations={locations}
                loading={loading}
                onRefreshProducts={loadProducts}
                resolveUser={resolveUser}
                profileMap={profileMap}
              />
            )}
            {activeSection === "activity" && <SystemActivityTab />}
            {activeSection === "vendors" && <VendorsTab />}
            {activeSection === "health" && <SystemHealthTab />}
            {activeSection === "settings" && <AdminSettingsSection />}
          </main>
        </div>
      </div>

      {/* Global Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]" onClick={() => setShowSearch(false)}>
          <div className="w-full max-w-lg bg-admin-surface border border-admin-border rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 border-b border-admin-border">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                placeholder="Search users by name, email, or ID…"
                className="flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <kbd className="px-1.5 py-0.5 rounded bg-admin-border text-[10px] font-mono text-muted-foreground">ESC</kbd>
            </div>
            {searchResults.length > 0 && (
              <div className="max-h-72 overflow-y-auto p-2 space-y-0.5">
                {searchResults.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setActiveSection("users"); setShowSearch(false); setGlobalSearch(""); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-admin-surface-hover text-left transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-admin-emerald/10 flex items-center justify-center text-admin-emerald text-xs font-bold">
                      {(p.full_name || p.email || "U")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.full_name || p.username || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize shrink-0">{p.tier || "—"}</Badge>
                  </button>
                ))}
              </div>
            )}
            {globalSearch.length >= 2 && searchResults.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">No results found</div>
            )}
            {globalSearch.length < 2 && (
              <div className="p-6 text-center text-muted-foreground text-xs">Type at least 2 characters to search</div>
            )}
          </div>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </>
  );
};

export default AdminLayout;
