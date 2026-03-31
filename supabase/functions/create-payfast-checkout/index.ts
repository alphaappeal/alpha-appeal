import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, createCorsPreflightResponse } from "../_shared/cors.ts";
import { PayFastCheckoutSchema, validateRequest } from "../_shared/validation.ts";

// PayFast production URL
const PAYFAST_URL = "https://www.payfast.co.za/eng/process";

/**
 * Generate an MD5 hash string (hex) using Deno's crypto API.
 * crypto.subtle doesn't support MD5, so we use the older createHash API.
 */
async function md5(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  // Use the Web Crypto-compatible approach via Deno's std or a manual buffer
  // Deno supports MD5 through the node:crypto compat or we do it manually
  const { createHash } = await import("node:crypto");
  const hash = createHash("md5").update(data).digest("hex");
  return hash;
}

/**
 * PayFast signature generation following their official documentation.
 * Fields MUST be in the correct order as specified by PayFast.
 * See: https://developers.payfast.co.za/docs#step_2_signature
 */
const PAYFAST_FIELD_ORDER = [
  "merchant_id",
  "merchant_key",
  "return_url",
  "cancel_url",
  "notify_url",
  "name_first",
  "name_last",
  "email_address",
  "cell_number",
  "m_payment_id",
  "amount",
  "item_name",
  "item_description",
  "custom_int1",
  "custom_int2",
  "custom_int3",
  "custom_int4",
  "custom_int5",
  "custom_str1",
  "custom_str2",
  "custom_str3",
  "custom_str4",
  "custom_str5",
  "payment_method",
  "subscription_type",
  "billing_date",
  "recurring_amount",
  "frequency",
  "cycles",
  "subscription_notify_email",
  "subscription_notify_webhook",
  "subscription_notify_buyer",
];

async function generateSignature(
  data: Record<string, string>,
  passPhrase?: string
): Promise<string> {
  // Build parameter string in the correct field order, skipping blanks
  const orderedKeys = PAYFAST_FIELD_ORDER.filter(
    (key) => key in data && data[key] !== "" && data[key] !== undefined
  );

  const paramString = orderedKeys
    .map(
      (key) =>
        `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}`
    )
    .join("&");

  const signatureString = passPhrase
    ? `${paramString}&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`
    : paramString;

  console.log("Signature input string:", signatureString);

  return await md5(signatureString);
}

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
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;

    // Parse and validate request body
    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validationResult = validateRequest(PayFastCheckoutSchema, requestBody);
    if (!validationResult.success || !validationResult.data) {
      return new Response(
        JSON.stringify({ error: validationResult.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { items, return_url, cancel_url, subscription_tier } = validationResult.data;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Cart is empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate total
    const amount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    // Generate order number
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const orderNumber = `ORD-${dateStr}-${rand}`;

    // Build item name
    const itemName =
      items.length === 1
        ? items[0].name
        : `Alpha Order (${items.length} items)`;

    // Determine if this is a subscription payment
    const isSubscription = subscription_tier && ["essential", "elite", "private"].includes(subscription_tier);
    const orderType = isSubscription ? "subscription" : "one_time";

    // Create order in DB with pending status
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        order_number: orderNumber,
        amount,
        currency: "ZAR",
        order_type: orderType,
        payment_status: "pending",
        payment_method: "payfast",
        product_name: itemName,
        payment_metadata: { items, subscription_tier: subscription_tier || null },
      })
      .select("id, order_number")
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const merchantId = Deno.env.get("PAYFAST_MERCHANT_ID")!;
    const merchantKey = Deno.env.get("PAYFAST_MERCHANT_KEY")!;
    const passPhrase = Deno.env.get("PAYFAST_PASSPHRASE") || "";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const notifyUrl = `${supabaseUrl}/functions/v1/payfast-itn`;

    // Build PayFast data object — keys must match the PAYFAST_FIELD_ORDER
    const pfData: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: return_url || "",
      cancel_url: cancel_url || "",
      notify_url: notifyUrl,
      email_address: userEmail,
      m_payment_id: order.id,
      amount: amount.toFixed(2),
      item_name: itemName.substring(0, 100),
      custom_str1: order.order_number,
      custom_str2: userId,
    };

    // Add subscription parameters for recurring billing
    if (isSubscription) {
      const billingDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
      pfData.subscription_type = "1";
      pfData.billing_date = billingDate;
      pfData.recurring_amount = amount.toFixed(2);
      pfData.frequency = "3"; // monthly
      pfData.cycles = "0"; // infinite
      pfData.custom_str3 = subscription_tier;
    }

    const signature = await generateSignature(pfData, passPhrase || undefined);

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
