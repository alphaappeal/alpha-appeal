import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdminAlerts = (userId: string | undefined, userTier: string) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [alerts, setAlerts] = useState<any[]>([]);

  const loadAlerts = useCallback(async () => {
    if (!userId) return;

    const [alertsRes, readsRes] = await Promise.all([
      supabase.from("admin_alerts").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("user_alert_reads").select("alert_id").eq("user_id", userId),
    ]);

    const allAlerts = (alertsRes.data || []).filter((a: any) => {
      if (!a.target_tier) return true;
      return a.target_tier.includes(userTier);
    });

    const readIds = new Set((readsRes.data || []).map((r: any) => r.alert_id));
    const enriched = allAlerts.map((a: any) => ({ ...a, seen: readIds.has(a.id) }));

    setAlerts(enriched);
    setUnreadCount(enriched.filter((a: any) => !a.seen).length);
  }, [userId, userTier]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const markRead = async (alertId: string) => {
    if (!userId) return;
    await supabase.from("user_alert_reads").insert({ user_id: userId, alert_id: alertId });
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, seen: true } : a));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return { alerts, unreadCount, markRead, refreshAlerts: loadAlerts };
};
