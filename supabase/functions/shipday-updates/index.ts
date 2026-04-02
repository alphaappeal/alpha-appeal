import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, createCorsPreflightResponse } from "../_shared/cors.ts";

// Map Shipday statuses to our internal statuses
const statusMap: Record<string, string> = {
  ASSIGNED: "assigned",
  STARTED: "in_transit",
  PICKED_UP: "picked_up",
  COMPLETED: "delivered",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return createCorsPreflightResponse(req.headers.get("Origin") || null);
  }

  const corsHeaders = getCorsHeaders(req.headers.get("Origin") || null);

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Parse payload
    let payload: any;
    try {
      payload = await req.json();
    } catch (err) {
      console.error("Failed to parse webhook payload:", err);
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Shipday webhook received:", JSON.stringify(payload));

    // Extract order identifiers
    const orderId = payload.orderNumber || payload.orderId;
    const shipdayOrderId = String(payload.id || payload.orderId || "");

    // Validate order ID
    if (!shipdayOrderId) {
      console.error("No order ID in webhook payload");
      return new Response(
        JSON.stringify({ error: "No order ID in payload" }),
        { status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Log webhook metadata for debugging
    console.log(`Processing Shipday webhook for order: ${shipdayOrderId}, status: ${payload.orderStatus}`);

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

    // Log the full update for debugging
    console.log(`Updating delivery ${shipdayOrderId} with status: ${newStatus}`, JSON.stringify(updateData));

    // Update delivery record
    const { data: updatedDelivery, error: updateError } = await supabase
      .from("user_deliveries")
      .update(updateData)
      .eq("shipday_order_id", shipdayOrderId)
      .select("id, user_id, order_id, status")
      .maybeSingle();

    if (updateError) {
      console.error("Database update failed:", updateError);
      
      // Log error for monitoring
      await supabase.from("delivery_errors").insert({
        error_type: "webhook_update_failed",
        error_message: updateError.message,
        shipday_order_id: shipdayOrderId,
        occurred_at: new Date().toISOString(),
      }).catch((logErr: any) => console.error("Failed to log error:", logErr));
      
      return new Response(
        JSON.stringify({ error: "Failed to update delivery", retry: true }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no delivery found, create one (fallback)
    if (!updatedDelivery) {
      console.warn(`No delivery found for Shipday order ${shipdayOrderId}, creating new record`);
      
      // Try to find by order_number from orders table
      if (orderId) {
        const { data: order } = await supabase
          .from("orders")
          .select("user_id, id")
          .eq("order_number", orderId)
          .maybeSingle();
        
        if (order) {
          const { error: insertError } = await supabase
            .from("user_deliveries")
            .insert({
              order_id: order.id,
              user_id: order.user_id,
              shipday_order_id: shipdayOrderId,
              shipday_status: payload.orderStatus,
              status: newStatus,
              ...updateData,
            });
          
          if (insertError) {
            console.error("Failed to create delivery record:", insertError);
          } else {
            console.log(`Created new delivery record for order ${orderId}`);
          }
        }
      }
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
