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

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Parse which jobs to run (default: all)
  let jobs = ["cleanup", "subscriptions", "analytics"];
  try {
    const body = await req.json();
    if (body?.jobs && Array.isArray(body.jobs)) {
      jobs = body.jobs;
    }
  } catch {
    // No body or invalid JSON — run all jobs
  }

  const results: Record<string, any> = {};

  // ─── 1. STALE DATA CLEANUP ──────────────────────────────────
  if (jobs.includes("cleanup")) {
    const logId = crypto.randomUUID();
    await supabase.from("maintenance_logs").insert({
      id: logId,
      job_type: "stale_data_cleanup",
      status: "running",
    });

    try {
      let totalCleaned = 0;
      const details: Record<string, number> = {};

      // Delete expired promo codes
      const { data: expiredPromos } = await supabase
        .from("promo_codes")
        .delete()
        .lt("expires_at", new Date().toISOString())
        .not("expires_at", "is", null)
        .select("id");
      details.expired_promos = expiredPromos?.length || 0;
      totalCleaned += details.expired_promos;

      // Delete activity logs older than 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const { data: oldLogs } = await supabase
        .from("activity_logs")
        .delete()
        .lt("created_at", ninetyDaysAgo.toISOString())
        .select("id");
      details.old_activity_logs = oldLogs?.length || 0;
      totalCleaned += details.old_activity_logs;

      // Delete abandoned cart items older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: oldCarts } = await supabase
        .from("user_cart")
        .delete()
        .lt("created_at", thirtyDaysAgo.toISOString())
        .select("id");
      details.abandoned_carts = oldCarts?.length || 0;
      totalCleaned += details.abandoned_carts;

      await supabase
        .from("maintenance_logs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          records_affected: totalCleaned,
          details,
        })
        .eq("id", logId);

      results.cleanup = { status: "completed", records_affected: totalCleaned, details };
    } catch (err: any) {
      await supabase
        .from("maintenance_logs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error_message: err.message,
        })
        .eq("id", logId);
      results.cleanup = { status: "failed", error: err.message };
    }
  }

  // ─── 2. SUBSCRIPTION CHECKS ─────────────────────────────────
  if (jobs.includes("subscriptions")) {
    const logId = crypto.randomUUID();
    await supabase.from("maintenance_logs").insert({
      id: logId,
      job_type: "subscription_check",
      status: "running",
    });

    try {
      let totalAffected = 0;
      const details: Record<string, number> = {};

      // Find expired subscriptions (end_date passed, still active)
      const { data: expiredSubs } = await supabase
        .from("subscriptions")
        .select("id, user_id, tier")
        .eq("status", "active")
        .lt("end_date", new Date().toISOString())
        .not("end_date", "is", null);

      if (expiredSubs && expiredSubs.length > 0) {
        // Mark as expired
        const expiredIds = expiredSubs.map((s) => s.id);
        await supabase
          .from("subscriptions")
          .update({ status: "expired" })
          .in("id", expiredIds);

        // Downgrade users to free tier
        const userIds = expiredSubs.map((s) => s.user_id);
        for (const userId of userIds) {
          await supabase
            .from("profiles")
            .update({ subscription_tier: "private", payment_status: "expired" })
            .eq("id", userId);
          await supabase
            .from("users")
            .update({ tier: "private" })
            .eq("id", userId);
        }

        details.expired_subscriptions = expiredSubs.length;
        totalAffected += expiredSubs.length;
      }

      // Find trial subscriptions that have ended
      const { data: expiredTrials } = await supabase
        .from("subscriptions")
        .select("id, user_id")
        .eq("is_trial", true)
        .eq("status", "active")
        .lt("trial_end_date", new Date().toISOString())
        .not("trial_end_date", "is", null);

      if (expiredTrials && expiredTrials.length > 0) {
        const trialIds = expiredTrials.map((s) => s.id);
        await supabase
          .from("subscriptions")
          .update({ status: "trial_expired", is_trial: false })
          .in("id", trialIds);

        details.expired_trials = expiredTrials.length;
        totalAffected += expiredTrials.length;
      }

      // Flag subscriptions due for renewal in next 7 days
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      const { data: upcomingRenewals } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("status", "active")
        .lte("next_billing_date", sevenDaysFromNow.toISOString())
        .gte("next_billing_date", new Date().toISOString());

      details.upcoming_renewals = upcomingRenewals?.length || 0;

      await supabase
        .from("maintenance_logs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          records_affected: totalAffected,
          details,
        })
        .eq("id", logId);

      results.subscriptions = { status: "completed", records_affected: totalAffected, details };
    } catch (err: any) {
      await supabase
        .from("maintenance_logs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error_message: err.message,
        })
        .eq("id", logId);
      results.subscriptions = { status: "failed", error: err.message };
    }
  }

  // ─── 3. ANALYTICS SNAPSHOT ──────────────────────────────────
  if (jobs.includes("analytics")) {
    const logId = crypto.randomUUID();
    await supabase.from("maintenance_logs").insert({
      id: logId,
      job_type: "analytics_snapshot",
      status: "running",
    });

    try {
      const today = new Date().toISOString().split("T")[0];

      // Gather counts
      const [usersRes, subsRes, ordersRes, productsRes, strainsRes, cultureRes, diaryRes, appsRes, revenueRes, signupsRes] =
        await Promise.all([
          supabase.from("users").select("id", { count: "exact", head: true }),
          supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("orders").select("id", { count: "exact", head: true }),
          supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true),
          supabase.from("strains").select("id", { count: "exact", head: true }).eq("published", true),
          supabase.from("culture_items").select("id", { count: "exact", head: true }).eq("published", true),
          supabase.from("diary_entries").select("id", { count: "exact", head: true }).eq("published", true),
          supabase.from("private_member_applications").select("id", { count: "exact", head: true }).eq("application_status", "pending"),
          supabase.from("orders").select("amount").eq("payment_status", "completed"),
          supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", today),
        ]);

      const totalRevenue = (revenueRes.data || []).reduce((sum: number, o: any) => sum + (o.amount || 0), 0);

      const snapshot = {
        snapshot_date: today,
        total_users: usersRes.count || 0,
        active_subscriptions: subsRes.count || 0,
        revenue_total: totalRevenue,
        new_signups_today: signupsRes.count || 0,
        pending_applications: appsRes.count || 0,
        total_orders: ordersRes.count || 0,
        total_products: productsRes.count || 0,
        total_strains: strainsRes.count || 0,
        total_culture_items: cultureRes.count || 0,
        total_diary_entries: diaryRes.count || 0,
      };

      // Upsert (one snapshot per day)
      await supabase.from("platform_metrics").upsert(snapshot, { onConflict: "snapshot_date" });

      await supabase
        .from("maintenance_logs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          records_affected: 1,
          details: snapshot,
        })
        .eq("id", logId);

      results.analytics = { status: "completed", snapshot };
    } catch (err: any) {
      await supabase
        .from("maintenance_logs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error_message: err.message,
        })
        .eq("id", logId);
      results.analytics = { status: "failed", error: err.message };
    }
  }

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
