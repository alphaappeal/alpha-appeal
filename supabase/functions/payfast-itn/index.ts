import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // PayFast sends ITN as application/x-www-form-urlencoded
    const body = await req.text();
    const params = new URLSearchParams(body);
    const data: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
      data[key] = value;
    }

    console.log("PayFast ITN received:", JSON.stringify(data));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const paymentStatus = data.payment_status; // COMPLETE, CANCELLED, etc.
    const mPaymentId = data.m_payment_id; // order ID
    const pfPaymentId = data.pf_payment_id;
    const amountGross = parseFloat(data.amount_gross || "0");
    const token = data.token; // PayFast subscription token
    const userId = data.custom_str2;
    const subscriptionTier = data.custom_str3;
    const orderNumber = data.custom_str1;

    if (!mPaymentId) {
      console.error("No m_payment_id in ITN");
      return new Response("OK", { status: 200 });
    }

    // Update order status
    if (paymentStatus === "COMPLETE") {
      await supabase
        .from("orders")
        .update({
          payment_status: "completed",
          paid_at: new Date().toISOString(),
          payfast_payment_id: pfPaymentId,
        })
        .eq("id", mPaymentId);

      // Record payment
      await supabase.from("payments").insert({
        order_id: mPaymentId,
        payfast_payment_id: pfPaymentId,
        provider: "payfast",
        status: "completed",
        reference: orderNumber,
        raw_response: data,
      });

      // Handle subscription creation/update if token present
      if (token && userId && subscriptionTier) {
        const nextBillingDate = new Date();
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

        // Check for existing subscription for this user
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("user_id", userId)
          .eq("status", "active")
          .maybeSingle();

        if (existingSub) {
          // Update existing subscription
          await supabase
            .from("subscriptions")
            .update({
              payfast_subscription_token: token,
              payfast_frequency: 3,
              amount: amountGross,
              tier: subscriptionTier,
              status: "active",
              next_billing_date: nextBillingDate.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingSub.id);
        } else {
          // Create new subscription
          await supabase.from("subscriptions").insert({
            user_id: userId,
            tier: subscriptionTier,
            amount: amountGross,
            status: "active",
            billing_cycle: "monthly",
            payfast_subscription_token: token,
            payfast_frequency: 3,
            start_date: new Date().toISOString(),
            next_billing_date: nextBillingDate.toISOString(),
            currency: "ZAR",
          });
        }

        console.log(`Subscription activated for user ${userId}, tier: ${subscriptionTier}, token: ${token}`);
      }
    } else if (paymentStatus === "CANCELLED") {
      await supabase
        .from("orders")
        .update({ payment_status: "cancelled" })
        .eq("id", mPaymentId);

      // Cancel subscription if token matches
      if (token && userId) {
        await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("payfast_subscription_token", token);
      }
    } else if (paymentStatus === "FAILED") {
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", mPaymentId);
    }

    // PayFast expects a 200 OK response
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("ITN processing error:", err);
    return new Response("OK", { status: 200 });
  }
});
