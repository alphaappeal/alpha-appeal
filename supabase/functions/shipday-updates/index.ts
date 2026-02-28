import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map Shipday statuses to our internal statuses
const statusMap: Record<string, string> = {
  ASSIGNED: "assigned",
  STARTED: "in_transit",
  PICKED_UP: "picked_up",
  COMPLETED: "delivered",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const payload = await req.json();
    console.log("Shipday webhook payload:", JSON.stringify(payload));

    // Shipday sends various event types
    const orderId = payload.orderNumber || payload.orderId;
    const shipdayOrderId = String(payload.id || payload.orderId || "");

    if (!shipdayOrderId) {
      return new Response(JSON.stringify({ error: "No order ID in payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newStatus = statusMap[payload.orderStatus] || payload.orderStatus?.toLowerCase() || "pending";

    // Build update object
    const updateData: Record<string, any> = {
      shipday_status: payload.orderStatus,
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    // Driver info
    if (payload.assignedCarrier) {
      updateData.driver_name = payload.assignedCarrier.name || payload.assignedCarrier.personalName;
      updateData.driver_phone = payload.assignedCarrier.phone || payload.assignedCarrier.phoneNumber;
      if (payload.assignedCarrier.latitude) updateData.driver_latitude = payload.assignedCarrier.latitude;
      if (payload.assignedCarrier.longitude) updateData.driver_longitude = payload.assignedCarrier.longitude;
    }

    // ETA
    if (payload.estimatedDeliveryTime || payload.etaSeconds) {
      updateData.eta_minutes = payload.etaSeconds
        ? Math.round(payload.etaSeconds / 60)
        : null;
    }

    // Tracking URL
    if (payload.trackingLink) {
      updateData.tracking_url = payload.trackingLink;
    }

    // Distance
    if (payload.distance) {
      updateData.distance_km = payload.distance;
    }

    // POD (Proof of Delivery)
    if (payload.proofOfDelivery) {
      if (payload.proofOfDelivery.photoUrl) updateData.pod_photo_url = payload.proofOfDelivery.photoUrl;
      if (payload.proofOfDelivery.signatureUrl) updateData.pod_signature_url = payload.proofOfDelivery.signatureUrl;
    }

    // Geofencing timestamps
    if (payload.arrivedAtPickup) updateData.geofence_arrived_at = payload.arrivedAtPickup;
    if (payload.leftPickup) updateData.geofence_left_at = payload.leftPickup;

    // Update delivery record
    const { error } = await supabase
      .from("user_deliveries")
      .update(updateData)
      .eq("shipday_order_id", shipdayOrderId);

    if (error) {
      console.error("Failed to update delivery:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Also update the linked order status
    if (newStatus === "delivered") {
      const { data: delivery } = await supabase
        .from("user_deliveries")
        .select("order_id")
        .eq("shipday_order_id", shipdayOrderId)
        .maybeSingle();

      if (delivery?.order_id) {
        await supabase
          .from("orders")
          .update({ payment_status: "completed", updated_at: new Date().toISOString() })
          .eq("id", delivery.order_id);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
