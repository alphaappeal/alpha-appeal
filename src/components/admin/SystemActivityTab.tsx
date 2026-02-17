import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  RefreshCw,
  Loader2,
  User,
  Settings,
  Shield,
  Package,
  FileText,
} from "lucide-react";

interface AdminLog {
  id: string;
  admin_id: string | null;
  action: string | null;
  target_table: string | null;
  target_id: string | null;
  created_at: string | null;
}

const iconMap: Record<string, typeof Activity> = {
  users: User,
  profiles: User,
  subscriptions: Package,
  orders: Package,
  settings: Settings,
  admin: Shield,
  diary_entries: FileText,
};

const SystemActivityTab = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching admin logs:", error);
    }
    setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();

    // Real-time subscription for live updates
    const channel = supabase
      .channel("admin-logs-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_logs" },
        (payload) => {
          setLogs((prev) => [payload.new as AdminLog, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionBadgeVariant = (action: string | null): "default" | "secondary" | "destructive" | "outline" => {
    if (!action) return "outline";
    const lower = action.toLowerCase();
    if (lower.includes("delete") || lower.includes("remove")) return "destructive";
    if (lower.includes("create") || lower.includes("insert") || lower.includes("approved")) return "default";
    if (lower.includes("update") || lower.includes("edit")) return "secondary";
    return "outline";
  };

  const getIcon = (table: string | null) => {
    const Icon = iconMap[table || ""] || Activity;
    return <Icon className="w-4 h-4 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-secondary" />
          <h3 className="font-display font-semibold text-foreground">
            System Activity
          </h3>
          <Badge variant="secondary">{logs.length}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchLogs}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {logs.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground rounded-xl border border-border/50">
          No system activity recorded yet
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card/30 hover:bg-card/50 transition-colors"
            >
              <div className="mt-0.5 w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
                {getIcon(log.target_table)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getActionBadgeVariant(log.action)}>
                    {log.action || "Unknown"}
                  </Badge>
                  {log.target_table && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {log.target_table}
                    </span>
                  )}
                </div>
                {log.target_id && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                    Target: {log.target_id}
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(log.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SystemActivityTab;
