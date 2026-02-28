import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Truck,
  Send,
  Loader2,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  User,
  Camera,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface DeliveriesTabProps {
  profileMap: Map<string, { name: string; email: string }>;
}

const DeliveriesTab = ({ profileMap }: DeliveriesTabProps) => {
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [postingOrderId, setPostingOrderId] = useState<string | null>(null);

  // Post to Shipday form state
  const [shipdayForm, setShipdayForm] = useState({
    pickup_address: "",
    delivery_address: "",
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    priority: "normal",
    admin_notes: "",
  });

  const resolveUser = (userId: string | null) => {
    if (!userId) return { name: "N/A", email: "" };
    return profileMap.get(userId) || { name: "User", email: userId.slice(0, 8) + "…" };
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    const [deliveriesRes, ordersRes] = await Promise.all([
      supabase.from("user_deliveries").select("*, orders(order_number, amount, product_name, user_id)").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").in("payment_status", ["paid", "processing", "in delivery"]).order("created_at", { ascending: false }),
    ]);
    setDeliveries(deliveriesRes.data || []);
    setOrders(ordersRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("admin-deliveries")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_deliveries" }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadData]);

  const handlePostToShipday = async (orderId: string) => {
    setPostingOrderId(orderId);
    try {
      const order = orders.find(o => o.id === orderId);
      const user = resolveUser(order?.user_id);

      const response = await supabase.functions.invoke("post-to-shipday", {
        body: {
          order_id: orderId,
          pickup_address: shipdayForm.pickup_address || "Alpha HQ, Cape Town",
          delivery_address: shipdayForm.delivery_address,
          customer_name: shipdayForm.customer_name || user.name,
          customer_phone: shipdayForm.customer_phone,
          customer_email: shipdayForm.customer_email || user.email,
          order_items: [{ name: order?.product_name || "Order", quantity: 1 }],
          priority: shipdayForm.priority,
          admin_notes: shipdayForm.admin_notes,
        },
      });

      if (response.error) throw new Error(response.error.message);

      toast({ title: "Posted to Shipday", description: `Fee: R${response.data.delivery_fee} (Original: R${response.data.delivery_fee_original})` });
      setShipdayForm({ pickup_address: "", delivery_address: "", customer_name: "", customer_phone: "", customer_email: "", priority: "normal", admin_notes: "" });
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setPostingOrderId(null);
    }
  };

  // Stats
  const activeCount = deliveries.filter(d => !["delivered", "failed"].includes(d.status)).length;
  const deliveredCount = deliveries.filter(d => d.status === "delivered").length;
  const totalFees = deliveries.reduce((sum, d) => sum + (d.delivery_fee || 0), 0);
  const avgEta = deliveries.filter(d => d.eta_minutes).reduce((sum, d, _, arr) => sum + (d.eta_minutes || 0) / arr.length, 0);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Truck, label: "Active", value: activeCount, color: "text-blue-400" },
          { icon: CheckCircle, label: "Delivered", value: deliveredCount, color: "text-secondary" },
          { icon: BarChart3, label: "Revenue", value: `R${Math.round(totalFees)}`, color: "text-gold" },
          { icon: Clock, label: "Avg ETA", value: `${Math.round(avgEta)} min`, color: "text-muted-foreground" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="p-3 rounded-xl bg-card/50 border border-border/50 text-center">
            <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
            <p className="text-lg font-bold text-foreground">{value}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Unassigned Orders → Post to Shipday */}
      {orders.filter(o => !deliveries.some(d => d.order_id === o.id && d.shipday_order_id)).length > 0 && (
        <section>
          <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            Unassigned Orders
          </h3>
          <div className="space-y-3">
            {orders
              .filter(o => !deliveries.some(d => d.order_id === o.id && d.shipday_order_id))
              .map(order => {
                const user = resolveUser(order.user_id);
                return (
                  <div key={order.id} className="p-4 rounded-xl border border-border/50 bg-card/30">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-foreground font-medium text-sm">{order.product_name || order.order_number}</p>
                        <p className="text-muted-foreground text-xs">{user.name} · R{order.amount}</p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="gap-1.5">
                            <Send className="w-3.5 h-3.5" />
                            Post to Shipday
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Dispatch via Shipday</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3 mt-2">
                            <Input
                              placeholder="Pickup address"
                              value={shipdayForm.pickup_address}
                              onChange={e => setShipdayForm(f => ({ ...f, pickup_address: e.target.value }))}
                            />
                            <Input
                              placeholder="Delivery address *"
                              value={shipdayForm.delivery_address}
                              onChange={e => setShipdayForm(f => ({ ...f, delivery_address: e.target.value }))}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Customer name"
                                value={shipdayForm.customer_name}
                                onChange={e => setShipdayForm(f => ({ ...f, customer_name: e.target.value }))}
                              />
                              <Input
                                placeholder="Phone"
                                value={shipdayForm.customer_phone}
                                onChange={e => setShipdayForm(f => ({ ...f, customer_phone: e.target.value }))}
                              />
                            </div>
                            <Select
                              value={shipdayForm.priority}
                              onValueChange={v => setShipdayForm(f => ({ ...f, priority: v }))}
                            >
                              <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="rush">Rush</SelectItem>
                              </SelectContent>
                            </Select>
                            <Textarea
                              placeholder="Admin notes for driver..."
                              value={shipdayForm.admin_notes}
                              onChange={e => setShipdayForm(f => ({ ...f, admin_notes: e.target.value }))}
                              rows={2}
                            />
                            <Button
                              className="w-full"
                              onClick={() => handlePostToShipday(order.id)}
                              disabled={postingOrderId === order.id || !shipdayForm.delivery_address}
                            >
                              {postingOrderId === order.id ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting...</>
                              ) : (
                                <><Send className="w-4 h-4 mr-2" /> Dispatch Order</>
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Active Deliveries Pipeline */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-400" />
            Delivery Pipeline
          </h3>
          <Button variant="ghost" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {deliveries.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-border/50 bg-card/20">
            <Truck className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No deliveries yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deliveries.map(d => {
              const user = resolveUser(d.orders?.user_id || d.user_id);
              return (
                <div key={d.id} className="p-4 rounded-xl border border-border/50 bg-card/30">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-foreground font-medium text-sm">
                        {d.orders?.product_name || d.orders?.order_number || "Delivery"}
                      </p>
                      <p className="text-muted-foreground text-xs">{user.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={d.status === "delivered" ? "default" : "secondary"} className="capitalize text-xs">
                        {d.shipday_status || d.status || "pending"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mt-3">
                    {d.driver_name && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className="text-foreground">{d.driver_name}</span>
                      </div>
                    )}
                    {d.eta_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-foreground">{d.eta_minutes} min ETA</span>
                      </div>
                    )}
                    {d.distance_km && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-foreground">{d.distance_km} km</span>
                      </div>
                    )}
                    {d.delivery_fee > 0 && (
                      <div className="flex flex-col">
                        <span className="text-foreground font-medium">R{d.delivery_fee}</span>
                        {d.delivery_fee_original > 0 && (
                          <span className="text-muted-foreground text-[10px]">
                            (Base: R{d.delivery_fee_original})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* POD Evidence */}
                  {(d.pod_photo_url || d.pod_signature_url) && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
                      <Camera className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">POD:</span>
                      {d.pod_photo_url && (
                        <a href={d.pod_photo_url} target="_blank" rel="noopener noreferrer" className="text-xs text-secondary underline">Photo</a>
                      )}
                      {d.pod_signature_url && (
                        <a href={d.pod_signature_url} target="_blank" rel="noopener noreferrer" className="text-xs text-secondary underline">Signature</a>
                      )}
                    </div>
                  )}

                  {d.tracking_url && (
                    <a href={d.tracking_url} target="_blank" rel="noopener noreferrer"
                       className="block mt-3 text-center py-2 rounded-lg bg-secondary/10 text-secondary text-xs font-medium hover:bg-secondary/20 transition">
                      Open Tracking
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default DeliveriesTab;
