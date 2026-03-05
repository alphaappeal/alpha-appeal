import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  RefreshCw,
  Trash2,
  CreditCard,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Play,
  TrendingUp,
  Users,
  Package,
  Leaf,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface MaintenanceLog {
  id: string;
  job_type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  records_affected: number | null;
  details: any;
  error_message: string | null;
}

interface PlatformMetric {
  id: string;
  snapshot_date: string;
  total_users: number;
  active_subscriptions: number;
  revenue_total: number;
  new_signups_today: number;
  pending_applications: number;
  total_orders: number;
  total_products: number;
  total_strains: number;
  total_culture_items: number;
  total_diary_entries: number;
}

const JOB_CONFIG = [
  { id: "cleanup", label: "Stale Data Cleanup", icon: Trash2, description: "Remove expired promos, old logs, abandoned carts" },
  { id: "subscriptions", label: "Subscription Check", icon: CreditCard, description: "Flag expired subs, downgrade tiers, detect upcoming renewals" },
  { id: "analytics", label: "Analytics Snapshot", icon: BarChart3, description: "Capture daily platform metrics snapshot" },
];

const SystemHealthTab = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [metrics, setMetrics] = useState<PlatformMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningJobs, setRunningJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [logsRes, metricsRes] = await Promise.all([
      supabase
        .from("maintenance_logs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(50),
      supabase
        .from("platform_metrics")
        .select("*")
        .order("snapshot_date", { ascending: false })
        .limit(14),
    ]);
    setLogs((logsRes.data as MaintenanceLog[]) || []);
    setMetrics((metricsRes.data as PlatformMetric[]) || []);
    setLoading(false);
  };

  const runJob = async (jobId: string) => {
    setRunningJobs((prev) => new Set([...prev, jobId]));
    try {
      const { data, error } = await supabase.functions.invoke("routine-maintenance", {
        body: { jobs: [jobId] },
      });
      if (error) throw error;

      const result = data?.results?.[jobId];
      toast({
        title: `${JOB_CONFIG.find((j) => j.id === jobId)?.label} completed`,
        description: result?.status === "completed"
          ? `${result.records_affected || 0} records affected`
          : result?.error || "Done",
      });
      await loadData();
    } catch (err: any) {
      toast({ title: "Job failed", description: err.message, variant: "destructive" });
    } finally {
      setRunningJobs((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  const runAll = async () => {
    setRunningJobs(new Set(JOB_CONFIG.map((j) => j.id)));
    try {
      const { error } = await supabase.functions.invoke("routine-maintenance", {
        body: { jobs: ["cleanup", "subscriptions", "analytics"] },
      });
      if (error) throw error;
      toast({ title: "All maintenance jobs completed" });
      await loadData();
    } catch (err: any) {
      toast({ title: "Maintenance run failed", description: err.message, variant: "destructive" });
    } finally {
      setRunningJobs(new Set());
    }
  };

  const latestMetric = metrics[0] || null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-admin-emerald/10 text-admin-emerald border-admin-emerald/20 gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</Badge>;
      case "failed":
        return <Badge className="bg-admin-rose/10 text-admin-rose border-admin-rose/20 gap-1"><XCircle className="w-3 h-3" /> Failed</Badge>;
      case "running":
        return <Badge className="bg-admin-amber/10 text-admin-amber border-admin-amber/20 gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Running</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getJobLabel = (type: string) => {
    switch (type) {
      case "stale_data_cleanup": return "Cleanup";
      case "subscription_check": return "Subscriptions";
      case "analytics_snapshot": return "Analytics";
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">System Health</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Automated maintenance, metrics snapshots, and job history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={runAll}
            disabled={runningJobs.size > 0}
            className="bg-admin-emerald text-white hover:bg-admin-emerald/90"
          >
            {runningJobs.size > 0 ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
            Run All Jobs
          </Button>
        </div>
      </div>

      {/* Latest Metrics Snapshot */}
      {latestMetric && (
        <div className="p-5 rounded-xl bg-admin-surface border border-admin-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Latest Snapshot — {latestMetric.snapshot_date}</h3>
            <Badge variant="outline" className="text-[10px]">Updated daily</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: "Users", value: latestMetric.total_users, icon: Users },
              { label: "Active Subs", value: latestMetric.active_subscriptions, icon: CreditCard },
              { label: "Revenue", value: `R${latestMetric.revenue_total.toLocaleString()}`, icon: TrendingUp },
              { label: "Signups Today", value: latestMetric.new_signups_today, icon: Users },
              { label: "Pending Apps", value: latestMetric.pending_applications, icon: Clock },
              { label: "Orders", value: latestMetric.total_orders, icon: Package },
              { label: "Products", value: latestMetric.total_products, icon: Package },
              { label: "Strains", value: latestMetric.total_strains, icon: Leaf },
              { label: "Culture Items", value: latestMetric.total_culture_items, icon: Activity },
              { label: "Diary Entries", value: latestMetric.total_diary_entries, icon: BarChart3 },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="p-3 rounded-lg bg-admin-surface-hover">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">{label}</span>
                </div>
                <p className="text-lg font-bold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Job Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {JOB_CONFIG.map((job) => {
          const Icon = job.icon;
          const isRunning = runningJobs.has(job.id);
          const lastRun = logs.find((l) =>
            l.job_type ===
            (job.id === "cleanup" ? "stale_data_cleanup" : job.id === "subscriptions" ? "subscription_check" : "analytics_snapshot")
          );

          return (
            <div key={job.id} className="p-5 rounded-xl bg-admin-surface border border-admin-border space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-admin-indigo/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-admin-indigo" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{job.label}</h4>
                    <p className="text-[11px] text-muted-foreground">{job.description}</p>
                  </div>
                </div>
              </div>

              {lastRun && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Last run:</span>
                    <span>{format(new Date(lastRun.started_at), "MMM d, HH:mm")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    {getStatusBadge(lastRun.status)}
                  </div>
                  {lastRun.records_affected != null && (
                    <div className="flex items-center justify-between">
                      <span>Records:</span>
                      <span className="font-medium text-foreground">{lastRun.records_affected}</span>
                    </div>
                  )}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => runJob(job.id)}
                disabled={isRunning}
              >
                {isRunning ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
                Run Now
              </Button>
            </div>
          );
        })}
      </div>

      {/* Job History */}
      <div className="p-5 rounded-xl bg-admin-surface border border-admin-border">
        <h3 className="text-sm font-semibold text-foreground mb-4">Job History</h3>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No maintenance jobs have run yet. Click "Run All Jobs" to start.
          </div>
        ) : (
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-admin-surface-hover transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-admin-surface-hover flex items-center justify-center shrink-0">
                    {log.job_type === "stale_data_cleanup" ? <Trash2 className="w-3.5 h-3.5 text-muted-foreground" /> :
                     log.job_type === "subscription_check" ? <CreditCard className="w-3.5 h-3.5 text-muted-foreground" /> :
                     <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{getJobLabel(log.job_type)}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {format(new Date(log.started_at), "MMM d, yyyy HH:mm:ss")}
                      {log.records_affected != null && ` · ${log.records_affected} records`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {log.error_message && (
                    <span className="text-[10px] text-admin-rose max-w-[150px] truncate" title={log.error_message}>
                      {log.error_message}
                    </span>
                  )}
                  {getStatusBadge(log.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemHealthTab;
