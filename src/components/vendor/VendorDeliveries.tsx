import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  User,
  Phone,
  Navigation,
  Camera,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Send,
  Loader2,
  X,
  ChevronRight,
  Calendar,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

interface VendorDeliveriesProps {
  partnerId: string;
  partnerName: string;
}

// Type for delivery with joined orders and alpha_partners data
type DeliveryWithRelations = Database['public']['Tables']['user_deliveries']['Row'] & {
  orders: {
    order_number: string;
    product_name: string | null;
    amount: number;
    user_id: string;
    users: {
      full_name: string | null;
      phone_number: string | null;
    } | null;
  } | null;
  alpha_partners: {
    name: string;
    phone: string | null;
  } | null;
};

// Use the same type for state
type DeliveryRecord = DeliveryWithRelations;

// Type for assignment with joined delivery_drivers data
type AssignmentWithRelations = Database['public']['Tables']['delivery_assignments']['Row'] & {
  delivery_drivers: {
    name: string | null;
    phone: string | null;
    rating: number | null;
    vehicle_type: string | null;
    vehicle_plate: string | null;
  } | null;
};

type DriverAssignment = AssignmentWithRelations;

const VendorDeliveries = ({ partnerId, partnerName }: VendorDeliveriesProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [assignments, setAssignments] = useState<DriverAssignment[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null);
  const [isDispatchDialogOpen, setIsDispatchDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [postingOrderId, setPostingOrderId] = useState<string | null>(null);

  // Form state
  const [dispatchForm, setDispatchForm] = useState({
    provider: 'shipday',
    pickup_address: '',
    delivery_address: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    priority: 'normal' as 'normal' | 'rush' | 'scheduled',
    special_instructions: '',
    vendor_notes: '',
    scheduled_time: '',
  });

  const [assignmentForm, setAssignmentForm] = useState({
    driver_id: '',
    earnings_amount: '',
  });

  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load deliveries for this vendor
      const { data: deliveriesData } = await supabase
        .from("user_deliveries")
        .select(`
          *,
          orders(order_number, product_name, amount, user_id, users(full_name, phone_number)),
          alpha_partners(name, phone)
        `)
        .eq("vendor_id", partnerId)
        .order("created_at", { ascending: false });

      // Cast to any to handle Supabase's nested relationship typing issue
      const deliveries = (deliveriesData as any) || [];
      setDeliveries(deliveries);

      // Load active assignments
      const { data: assignmentsData } = await supabase
        .from("delivery_assignments")
        .select(`
          *,
          delivery_drivers(name, phone, rating, vehicle_type, vehicle_plate)
        `)
        .in(
          "delivery_id",
          deliveriesData?.map(d => d.id) || []
        )
        .order("created_at", { ascending: false });

      // Cast to any to handle Supabase's nested relationship typing issue
      const assignments = (assignmentsData as any) || [];
      setAssignments(assignments);

      // Load available providers
      const { data: providersData } = await supabase
        .from("delivery_service_providers")
        .select("*")
        .eq("is_active", true);

      setProviders(providersData || []);
    } catch (err) {
      console.error("Error loading deliveries:", err);
      toast({
        title: "Error",
        description: "Failed to load deliveries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [partnerId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`vendor-deliveries-${partnerId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "user_deliveries",
        filter: `vendor_id=eq.${partnerId}`,
      }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partnerId, loadData]);

  // Load available drivers when assignment dialog opens
  useEffect(() => {
    if (isAssignmentDialogOpen && selectedDelivery) {
      loadAvailableDrivers();
    }
  }, [isAssignmentDialogOpen, selectedDelivery]);

  const loadAvailableDrivers = async () => {
    const { data } = await supabase
      .from("delivery_drivers")
      .select("*")
      .eq("is_available", true)
      .eq("background_check_status", "approved")
      .limit(10);
    
    setAvailableDrivers(data || []);
  };

  const handlePostToProvider = async (orderId: string) => {
    setPostingOrderId(orderId);
    try {
      const delivery = deliveries.find(d => d.order_id === orderId);
      
      const response = await supabase.functions.invoke("post-to-shipday", {
        body: {
          order_id: orderId,
          delivery_id: delivery?.id,
          pickup_address: dispatchForm.pickup_address || `${partnerName}, Cape Town`,
          delivery_address: dispatchForm.delivery_address,
          customer_name: dispatchForm.customer_name || delivery?.orders?.users?.full_name || "Customer",
          customer_phone: dispatchForm.customer_phone || delivery?.orders?.users?.phone_number || "",
          customer_email: dispatchForm.customer_email || "",
          order_items: [{ name: delivery?.orders?.product_name || "Order", quantity: 1 }],
          priority: dispatchForm.priority,
          admin_notes: dispatchForm.vendor_notes,
        },
      });

      if (response.error) throw new Error(response.error.message);

      toast({
        title: "Dispatched Successfully",
        description: `Fee: R${response.data.delivery_fee} (Original: R${response.data.delivery_fee_original})`,
      });

      setDispatchForm({
        provider: 'shipday',
        pickup_address: '',
        delivery_address: '',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        priority: 'normal',
        special_instructions: '',
        vendor_notes: '',
        scheduled_time: '',
      });
      setIsDispatchDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setPostingOrderId(null);
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDelivery || !assignmentForm.driver_id) return;

    try {
      const { error } = await supabase.rpc("assign_driver_to_delivery", {
        _delivery_id: selectedDelivery.id,
        _driver_id: assignmentForm.driver_id,
        _assigned_by: (await supabase.auth.getUser()).data.user?.id,
        _assignment_method: 'manual',
      });

      if (error) throw error;

      // Update earnings if specified
      if (assignmentForm.earnings_amount) {
        await supabase.from("delivery_assignments").update({
          earnings_amount: parseFloat(assignmentForm.earnings_amount),
        }).eq("delivery_id", selectedDelivery.id);
      }

      toast({
        title: "Driver Assigned",
        description: "The driver has been notified",
      });

      setIsAssignmentDialogOpen(false);
      setAssignmentForm({ driver_id: '', earnings_amount: '' });
      loadData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateDeliveryStatus = async (deliveryId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("user_deliveries")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", deliveryId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Delivery marked as ${newStatus}`,
      });

      loadData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const openDispatchDialog = (delivery: DeliveryRecord) => {
    setSelectedDelivery(delivery);
    setDispatchForm({
      ...dispatchForm,
      pickup_address: delivery.pickup_address || `${partnerName}, Cape Town`,
      delivery_address: delivery.delivery_address || '',
      customer_name: delivery.orders?.users?.full_name || '',
      customer_phone: delivery.orders?.users?.phone_number || '',
    });
    setIsDispatchDialogOpen(true);
  };

  const openAssignmentDialog = (delivery: DeliveryRecord) => {
    setSelectedDelivery(delivery);
    setIsAssignmentDialogOpen(true);
  };

  // Stats
  const activeDeliveries = deliveries.filter(d => !["delivered", "failed", "cancelled"].includes(d.status));
  const completedDeliveries = deliveries.filter(d => d.status === "delivered");
  const totalRevenue = deliveries.reduce((sum, d) => sum + (d.delivery_fee || 0), 0);
  const avgDeliveryTime = completedDeliveries.length > 0 
    ? Math.round(completedDeliveries.reduce((sum, d) => sum + (d.eta_minutes || 0), 0) / completedDeliveries.length)
    : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_transit':
      case 'en_route_to_customer':
        return <Navigation className="w-4 h-4 text-blue-400" />;
      case 'assigned':
        return <User className="w-4 h-4 text-amber-400" />;
      case 'failed':
      case 'cancelled':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'delivered':
        return "default";
      case 'failed':
      case 'cancelled':
        return "destructive";
      case 'in_transit':
      case 'en_route_to_customer':
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Delivery Management</h2>
          <p className="text-sm text-muted-foreground">Manage deliveries for {partnerName}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadData}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeDeliveries.length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedDeliveries.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">R{Math.round(totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{avgDeliveryTime}m</p>
                <p className="text-xs text-muted-foreground">Avg Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unassigned Orders */}
      {deliveries.filter(d => !d.driver_name && !["delivered", "failed"].includes(d.status)).length > 0 && (
        <section>
          <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Needs Dispatch
          </h3>
          <div className="space-y-3">
            {deliveries
              .filter(d => !d.driver_name && !["delivered", "failed"].includes(d.status))
              .map(delivery => (
                <Card key={delivery.id} className="border-border/50 bg-card/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-foreground font-medium text-sm">
                          {delivery.orders?.product_name || delivery.orders?.order_number || "Order"}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {format(new Date(delivery.created_at), "MMM d, h:mm a")} · R{delivery.orders?.amount}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openAssignmentDialog(delivery)}
                        >
                          <User className="w-3.5 h-3.5 mr-1" />
                          Assign Driver
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => openDispatchDialog(delivery)}
                        >
                          <Send className="w-3.5 h-3.5 mr-1" />
                          Dispatch
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{delivery.distance_km || '?'} km</span>
                      </div>
                      {delivery.eta_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{delivery.eta_minutes} min</span>
                        </div>
                      )}
                      {delivery.delivery_fee && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span>R{delivery.delivery_fee}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </section>
      )}

      {/* Active Deliveries Pipeline */}
      <section>
        <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-400" />
          Delivery Pipeline
        </h3>

        {deliveries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Truck className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No deliveries yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {deliveries.map(delivery => {
              const assignment = assignments.find(a => a.delivery_id === delivery.id);
              
              return (
                <Card key={delivery.id} className="border-border/50 bg-card/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(delivery.status)}
                        <div>
                          <p className="text-foreground font-medium text-sm">
                            {delivery.orders?.product_name || delivery.orders?.order_number || "Delivery"}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {delivery.delivery_service_provider === 'shipday' ? 'Shipday' : 'Bob Go'} · {delivery.orders?.users?.full_name || 'Customer'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(delivery.status)} className="capitalize">
                        {delivery.shipday_status || delivery.status}
                      </Badge>
                    </div>

                    {/* Driver Info */}
                    {(delivery.driver_name || assignment?.delivery_drivers) && (
                      <div className="flex items-center gap-3 my-3 p-3 rounded-lg bg-muted/30">
                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {delivery.driver_name || assignment?.delivery_drivers?.name || 'Driver'}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {(delivery.driver_phone || assignment?.delivery_drivers?.phone) && (
                              <a 
                                href={`tel:${delivery.driver_phone || assignment?.delivery_drivers?.phone}`}
                                className="flex items-center gap-1 hover:text-foreground"
                              >
                                <Phone className="w-3 h-3" />
                                Call Driver
                              </a>
                            )}
                            {assignment?.delivery_drivers?.vehicle_type && (
                              <span>{assignment.delivery_drivers.vehicle_type}</span>
                            )}
                            {assignment?.delivery_drivers?.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" />
                                {assignment.delivery_drivers.rating}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Delivery Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mt-3">
                      {delivery.eta_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-foreground">{delivery.eta_minutes} min ETA</span>
                        </div>
                      )}
                      {delivery.distance_km && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-foreground">{delivery.distance_km} km</span>
                        </div>
                      )}
                      {delivery.delivery_fee && delivery.delivery_fee > 0 && (
                        <div className="flex flex-col">
                          <span className="text-foreground font-medium">R{delivery.delivery_fee}</span>
                          <span className="text-muted-foreground text-[10px]">Delivery Fee</span>
                        </div>
                      )}
                      {delivery.scheduled_pickup_time && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-foreground">
                            {format(new Date(delivery.scheduled_pickup_time), "h:mm a")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-3 border-t border-border/30">
                      {delivery.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpdateDeliveryStatus(delivery.id, 'assigned')}
                          >
                            Mark Assigned
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => openDispatchDialog(delivery)}
                          >
                            Dispatch via Provider
                          </Button>
                        </>
                      )}
                      
                      {delivery.tracking_url && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          asChild
                        >
                          <a href={delivery.tracking_url} target="_blank" rel="noopener noreferrer">
                            <Navigation className="w-3.5 h-3.5 mr-1" />
                            Track
                          </a>
                        </Button>
                      )}

                      {/* POD Evidence */}
                      {(delivery.id && assignment) && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Camera className="w-3.5 h-3.5 mr-1" />
                              POD
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Proof of Delivery</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p className="text-sm text-muted-foreground">
                                Delivery proof of delivery documentation
                              </p>
                              {/* TODO: Display actual POD photos/signatures */}
                              <p className="text-xs text-muted-foreground">No POD uploaded yet</p>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Dispatch Dialog */}
      <Dialog open={isDispatchDialogOpen} onOpenChange={setIsDispatchDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dispatch via Delivery Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Select
              value={dispatchForm.provider}
              onValueChange={(v) => setDispatchForm({ ...dispatchForm, provider: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map(provider => (
                  <SelectItem key={provider.id} value={provider.name}>
                    {provider.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Pickup address"
              value={dispatchForm.pickup_address}
              onChange={(e) => setDispatchForm({ ...dispatchForm, pickup_address: e.target.value })}
            />

            <Input
              placeholder="Delivery address *"
              value={dispatchForm.delivery_address}
              onChange={(e) => setDispatchForm({ ...dispatchForm, delivery_address: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Customer name"
                value={dispatchForm.customer_name}
                onChange={(e) => setDispatchForm({ ...dispatchForm, customer_name: e.target.value })}
              />
              <Input
                placeholder="Phone"
                value={dispatchForm.customer_phone}
                onChange={(e) => setDispatchForm({ ...dispatchForm, customer_phone: e.target.value })}
              />
            </div>

            <Input
              type="email"
              placeholder="Customer email"
              value={dispatchForm.customer_email}
              onChange={(e) => setDispatchForm({ ...dispatchForm, customer_email: e.target.value })}
            />

            <Select
              value={dispatchForm.priority}
              onValueChange={(v) => setDispatchForm({ ...dispatchForm, priority: v as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="rush">Rush (30 min)</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>

            {dispatchForm.priority === 'scheduled' && (
              <Input
                type="datetime-local"
                value={dispatchForm.scheduled_time}
                onChange={(e) => setDispatchForm({ ...dispatchForm, scheduled_time: e.target.value })}
              />
            )}

            <Textarea
              placeholder="Special instructions for driver..."
              value={dispatchForm.special_instructions}
              onChange={(e) => setDispatchForm({ ...dispatchForm, special_instructions: e.target.value })}
              rows={2}
            />

            <Textarea
              placeholder="Vendor notes (internal)..."
              value={dispatchForm.vendor_notes}
              onChange={(e) => setDispatchForm({ ...dispatchForm, vendor_notes: e.target.value })}
              rows={2}
            />

            <Button
              className="w-full"
              onClick={() => selectedDelivery && handlePostToProvider(selectedDelivery.order_id!)}
              disabled={postingOrderId === selectedDelivery?.order_id || !dispatchForm.delivery_address}
            >
              {postingOrderId === selectedDelivery?.order_id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Dispatching...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Dispatch Order
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Driver Assignment Dialog */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Driver</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Select Driver</label>
              <Select
                value={assignmentForm.driver_id}
                onValueChange={(v) => setAssignmentForm({ ...assignmentForm, driver_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a driver" />
                </SelectTrigger>
                <SelectContent>
                  {availableDrivers.map(driver => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name || 'Driver'} - {driver.vehicle_type} ⭐ {driver.rating || 'N/A'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Earnings Amount (R)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="50.00"
                value={assignmentForm.earnings_amount}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, earnings_amount: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssignDriver}
                disabled={!assignmentForm.driver_id}
              >
                Assign Driver
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorDeliveries;
