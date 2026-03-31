import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, createCorsPreflightResponse } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return createCorsPreflightResponse(req.headers.get("Origin") || null);
  }

  const corsHeaders = getCorsHeaders(req.headers.get("Origin") || null);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Check admin
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      order_id,
      delivery_id,
      pickup_address,
      delivery_address,
      customer_name,
      customer_phone,
      customer_email,
      order_items,
      priority,
      admin_notes,
      courier_name,
    } = body;

    const SHIPDAY_API_KEY = Deno.env.get("SHIPDAY_API_KEY");
    if (!SHIPDAY_API_KEY) {
      return new Response(JSON.stringify({ error: "Shipday API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Post order to Shipday
    const shipdayPayload: Record<string, any> = {
      orderNumber: order_id,
      customerName: customer_name || "Alpha Customer",
      customerAddress: delivery_address,
      customerEmail: customer_email || "",
      customerPhoneNumber: customer_phone || "",
      restaurantName: "Alpha",
      restaurantAddress: pickup_address || "Alpha HQ",
      orderItem: order_items || [],
    };

    if (priority === "rush") {
      shipdayPayload.deliveryInstruction = "RUSH ORDER - Priority delivery";
    }
    if (admin_notes) {
      shipdayPayload.deliveryInstruction =
        (shipdayPayload.deliveryInstruction ? shipdayPayload.deliveryInstruction + " | " : "") + admin_notes;
    }

    const shipdayRes = await fetch("https://api.shipday.com/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${SHIPDAY_API_KEY}`,
      },
      body: JSON.stringify(shipdayPayload),
    });

    const shipdayData = await shipdayRes.json();
    console.log("Shipday response:", JSON.stringify(shipdayData));

    if (!shipdayRes.ok) {
      return new Response(
        JSON.stringify({ error: "Shipday API error", details: shipdayData }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const shipdayOrderId = String(shipdayData.orderId || shipdayData.id || "");

    // Calculate delivery fee from Shipday response with 20% markup
    const originalFee = shipdayData.deliveryFee || shipdayData.distance?.fee || 0;
    const markedUpFee = Math.round(originalFee * 1.2 * 100) / 100;
    const distanceKm = shipdayData.distance?.value || shipdayData.distance || null;

    // Update delivery record
    const updatePayload: Record<string, any> = {
      shipday_order_id: shipdayOrderId,
      shipday_status: "ACTIVE",
      status: "pending",
      pickup_address,
      delivery_address,
      delivery_fee: markedUpFee,
      delivery_fee_original: originalFee,
      distance_km: distanceKm,
      priority: priority || "normal",
      admin_notes: admin_notes || null,
      tracking_url: shipdayData.trackingLink || null,
      updated_at: new Date().toISOString(),
    };

    if (delivery_id) {
      await adminClient
        .from("user_deliveries")
        .update(updatePayload)
        .eq("id", delivery_id);
    } else if (order_id) {
      // Check if delivery record exists for this order
      const { data: existing } = await adminClient
        .from("user_deliveries")
        .select("id")
        .eq("order_id", order_id)
        .maybeSingle();

      if (existing) {
        await adminClient
          .from("user_deliveries")
          .update(updatePayload)
          .eq("id", existing.id);
      } else {
        // Get order user_id
        const { data: order } = await adminClient
          .from("orders")
          .select("user_id")
          .eq("id", order_id)
          .maybeSingle();

        await adminClient.from("user_deliveries").insert({
          ...updatePayload,
          order_id,
          user_id: order?.user_id,
        });
      }
    }

    // Update order status
    if (order_id) {
      await adminClient
        .from("orders")
        .update({ payment_status: "processing", updated_at: new Date().toISOString() })
        .eq("id", order_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        shipday_order_id: shipdayOrderId,
        delivery_fee: markedUpFee,
        delivery_fee_original: originalFee,
        distance_km: distanceKm,
        tracking_url: shipdayData.trackingLink,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Post to Shipday error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
