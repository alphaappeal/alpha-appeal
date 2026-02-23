import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// PayFast sandbox vs production
const PAYFAST_URL = "https://www.payfast.co.za/eng/process";
// For testing use: "https://sandbox.payfast.co.za/eng/process";

function generateSignature(data: Record<string, string>, passPhrase?: string): string {
  // Create parameter string
  const params = Object.keys(data)
    .filter((key) => data[key] !== "" && data[key] !== undefined)
    .map((key) => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}`)
    .join("&");

  const signatureString = passPhrase ? `${params}&passphrase=${encodeURIComponent(passPhrase).replace(/%20/g, "+")}` : params;

  // MD5 hash
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(signatureString);
  const hashBuffer = new Uint8Array(
    // @ts-ignore Deno crypto
    crypto.subtle.digestSync("MD5", dataBytes)
  );
  return Array.from(hashBuffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;

    const { items, return_url, cancel_url } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Cart is empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate total
    const amount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    );

    // Generate order number
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    const orderNumber = `ORD-${dateStr}-${rand}`;

    // Build item name
    const itemName = items.length === 1
      ? items[0].name
      : `Alpha Order (${items.length} items)`;

    // Create order in DB with pending status
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        order_number: orderNumber,
        amount,
        currency: "ZAR",
        order_type: "one_time",
        payment_status: "pending",
        payment_method: "payfast",
        product_name: itemName,
        payment_metadata: { items },
      })
      .select("id, order_number")
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return new Response(JSON.stringify({ error: "Failed to create order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const merchantId = Deno.env.get("PAYFAST_MERCHANT_ID")!;
    const merchantKey = Deno.env.get("PAYFAST_MERCHANT_KEY")!;

    // Build PayFast data object (order matters for signature)
    const pfData: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: return_url || "",
      cancel_url: cancel_url || "",
      notify_url: "", // ITN webhook - can be added later
      m_payment_id: order.id,
      amount: amount.toFixed(2),
      item_name: itemName.substring(0, 100),
      email_address: userEmail,
      custom_str1: order.order_number,
    };

    const signature = generateSignature(pfData);

    return new Response(
      JSON.stringify({
        payfast_url: PAYFAST_URL,
        payfast_data: { ...pfData, signature },
        order_id: order.id,
        order_number: order.order_number,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Checkout error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
