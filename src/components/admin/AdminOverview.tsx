import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  CreditCard,
  Package,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from "lucide-react";

interface Props {
  profiles: any[];
  subscriptions: any[];
  orders: any[];
  applications: any[];
  loading: boolean;
}

const AdminOverview = ({ profiles, subscriptions, orders, applications, loading }: Props) => {
  const activeSubs = subscriptions.filter(s => s.status === "active").length;
  const pendingApps = applications.filter(a => a.application_status === "pending").length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

  // Tier breakdown
  const tierCounts = profiles.reduce((acc: Record<string, number>, p) => {
    const tier = p.tier || p.subscription_tier || "unknown";
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});

  // Recent signups (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentSignups = profiles.filter(p => new Date(p.created_at) > weekAgo).length;

  // Order status breakdown
  const orderStatuses = orders.reduce((acc: Record<string, number>, o) => {
    const s = o.payment_status || "pending";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const kpis = [
    { label: "Total Users", value: profiles.length, icon: Users, color: "text-admin-indigo", bgColor: "bg-admin-indigo/10", trend: `+${recentSignups} this week` },
    { label: "Active Subscriptions", value: activeSubs, icon: CreditCard, color: "text-admin-emerald", bgColor: "bg-admin-emerald/10", trend: `${Math.round((activeSubs / Math.max(profiles.length, 1)) * 100)}% conversion` },
    { label: "Total Revenue", value: `R${totalRevenue.toLocaleString()}`, icon: Package, color: "text-admin-amber", bgColor: "bg-admin-amber/10", trend: `${orders.length} orders` },
    { label: "Pending Applications", value: pendingApps, icon: FileText, color: "text-admin-rose", bgColor: "bg-admin-rose/10", trend: `${applications.length} total` },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">High-level platform metrics and KPIs</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bgColor, trend }) => (
          <div key={label} className="p-5 rounded-xl bg-admin-surface border border-admin-border hover:border-admin-border/80 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground/40" />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-20 mb-1" />
            ) : (
              <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            <p className="text-[11px] text-muted-foreground/60 mt-2">{trend}</p>
          </div>
        ))}
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tier Breakdown */}
        <div className="p-5 rounded-xl bg-admin-surface border border-admin-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">User Distribution by Tier</h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(tierCounts)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([tier, count]) => {
                  const pct = Math.round(((count as number) / Math.max(profiles.length, 1)) * 100);
                  const tierColors: Record<string, string> = {
                    essential: "bg-admin-indigo",
                    elite: "bg-admin-amber",
                    private: "bg-admin-emerald",
                    free: "bg-muted-foreground/30",
                    promo: "bg-muted-foreground/30",
                  };
                  return (
                    <div key={tier} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize text-foreground font-medium">{tier}</span>
                        <span className="text-muted-foreground text-xs">{count as number} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-admin-surface-hover overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${tierColors[tier] || "bg-muted-foreground/30"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Order Status */}
        <div className="p-5 rounded-xl bg-admin-surface border border-admin-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Order Pipeline</h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <Package className="w-8 h-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(orderStatuses).map(([status, count]) => {
                const statusColors: Record<string, string> = {
                  pending: "bg-admin-amber/10 text-admin-amber border-admin-amber/20",
                  processing: "bg-admin-indigo/10 text-admin-indigo border-admin-indigo/20",
                  completed: "bg-admin-emerald/10 text-admin-emerald border-admin-emerald/20",
                  paid: "bg-admin-emerald/10 text-admin-emerald border-admin-emerald/20",
                  failed: "bg-admin-rose/10 text-admin-rose border-admin-rose/20",
                  "in delivery": "bg-admin-indigo/10 text-admin-indigo border-admin-indigo/20",
                };
                return (
                  <div key={status} className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${statusColors[status] || "bg-muted/10 text-muted-foreground border-border"}`}>
                    <span className="text-sm font-medium capitalize">{status}</span>
                    <span className="text-sm font-bold">{count as number}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Signups */}
      <div className="p-5 rounded-xl bg-admin-surface border border-admin-border">
        <h3 className="text-sm font-semibold text-foreground mb-4">Recent Signups</h3>
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (
          <div className="space-y-1">
            {profiles.slice(0, 8).map(p => (
              <div key={p.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-admin-surface-hover transition-colors">
                <div className="w-8 h-8 rounded-full bg-admin-emerald/10 flex items-center justify-center text-admin-emerald text-xs font-bold shrink-0">
                  {(p.full_name || p.email || "U")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.full_name || p.username || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] capitalize shrink-0 ${
                    p.tier === "private" ? "border-admin-emerald/30 text-admin-emerald" :
                    p.tier === "elite" ? "border-admin-amber/30 text-admin-amber" :
                    p.tier === "essential" ? "border-admin-indigo/30 text-admin-indigo" :
                    "border-admin-border text-muted-foreground"
                  }`}
                >
                  {p.tier || "free"}
                </Badge>
                <span className="text-[11px] text-muted-foreground/60 shrink-0">
                  {new Date(p.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;
