import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";

interface Props {
  subscriptions: any[];
  loading: boolean;
  resolveUser: (id: string | null) => { name: string; email: string };
}

const fmt = (d: string | null) => {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
};

const statusConfig: Record<string, { color: string; icon: any }> = {
  active: { color: "bg-admin-emerald/10 text-admin-emerald border-admin-emerald/20", icon: CheckCircle },
  pending: { color: "bg-admin-amber/10 text-admin-amber border-admin-amber/20", icon: Clock },
  cancelled: { color: "bg-admin-rose/10 text-admin-rose border-admin-rose/20", icon: XCircle },
};

const AdminSubscriptions = ({ subscriptions, loading, resolveUser }: Props) => {
  const active = subscriptions.filter(s => s.status === "active").length;
  const totalMRR = subscriptions.filter(s => s.status === "active").reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Subscriptions</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{subscriptions.length} total · {active} active · MRR: R{totalMRR.toLocaleString()}</p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-admin-border bg-admin-surface p-4 space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="flex flex-col items-center py-16 rounded-xl border border-admin-border bg-admin-surface">
          <CreditCard className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">No subscriptions yet</p>
        </div>
      ) : (
        <div className="rounded-xl border border-admin-border overflow-hidden bg-admin-surface">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border">
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tier</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Next Billing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border/50">
                {subscriptions.map(sub => {
                  const user = resolveUser(sub.user_id);
                  const sc = statusConfig[sub.status] || statusConfig.pending;
                  const Icon = sc.icon;
                  return (
                    <tr key={sub.id} className="hover:bg-admin-surface-hover transition-colors">
                      <td className="p-3">
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[11px] capitalize">{sub.tier}</Badge>
                      </td>
                      <td className="p-3 text-sm font-medium text-foreground">R{sub.amount ?? 0}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={`text-[11px] capitalize gap-1 ${sc.color}`}>
                          <Icon className="w-3 h-3" /> {sub.status || "pending"}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">{fmt(sub.next_billing_date)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
