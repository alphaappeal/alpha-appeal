import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Package, CheckCircle, Clock, XCircle } from "lucide-react";

interface Props {
  orders: any[];
  loading: boolean;
  resolveUser: (id: string | null) => { name: string; email: string };
  onRefresh: () => void;
}

const fmt = (d: string | null) => {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
};

const statusColors: Record<string, string> = {
  pending: "bg-admin-amber/10 text-admin-amber border-admin-amber/20",
  processing: "bg-admin-indigo/10 text-admin-indigo border-admin-indigo/20",
  completed: "bg-admin-emerald/10 text-admin-emerald border-admin-emerald/20",
  paid: "bg-admin-emerald/10 text-admin-emerald border-admin-emerald/20",
  "in delivery": "bg-admin-indigo/10 text-admin-indigo border-admin-indigo/20",
  failed: "bg-admin-rose/10 text-admin-rose border-admin-rose/20",
};

const AdminFinancials = ({ orders, loading, resolveUser, onRefresh }: Props) => {
  const { toast } = useToast();
  const totalRevenue = orders.filter(o => o.payment_status === "completed" || o.payment_status === "paid").reduce((sum, o) => sum + (o.amount || 0), 0);

  const handleOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Order updated to ${newStatus}` });
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Financials</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{orders.length} orders · R{totalRevenue.toLocaleString()} revenue</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Orders", value: orders.length, color: "text-admin-indigo" },
          { label: "Paid", value: orders.filter(o => o.payment_status === "completed" || o.payment_status === "paid").length, color: "text-admin-emerald" },
          { label: "Pending", value: orders.filter(o => o.payment_status === "pending").length, color: "text-admin-amber" },
          { label: "Failed", value: orders.filter(o => o.payment_status === "failed").length, color: "text-admin-rose" },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-xl bg-admin-surface border border-admin-border text-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="rounded-xl border border-admin-border bg-admin-surface p-4 space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center py-16 rounded-xl border border-admin-border bg-admin-surface">
          <DollarSign className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">No orders yet</p>
        </div>
      ) : (
        <div className="rounded-xl border border-admin-border overflow-hidden bg-admin-surface">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border">
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Product</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border/50">
                {orders.map(order => {
                  const user = resolveUser(order.user_id);
                  return (
                    <tr key={order.id} className="hover:bg-admin-surface-hover transition-colors">
                      <td className="p-3 text-sm font-mono text-foreground">{order.order_number || "N/A"}</td>
                      <td className="p-3">
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </td>
                      <td className="p-3 text-sm text-foreground hidden md:table-cell">{order.product_name || "Subscription"}</td>
                      <td className="p-3 text-sm font-semibold text-foreground">R{order.amount ?? 0}</td>
                      <td className="p-3">
                        <Select
                          value={order.payment_status || "pending"}
                          onValueChange={v => handleOrderStatus(order.id, v)}
                        >
                          <SelectTrigger className={`w-[130px] h-7 text-[11px] border ${statusColors[order.payment_status] || ""}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="in delivery">In Delivery</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground hidden lg:table-cell">{fmt(order.created_at)}</td>
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

export default AdminFinancials;
