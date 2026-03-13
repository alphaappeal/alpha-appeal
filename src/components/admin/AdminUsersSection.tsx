import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Search,
  MoreHorizontal,
  Shield,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Props {
  profiles: any[];
  applications: any[];
  loading: boolean;
  onRefresh: () => void;
  resolveUser: (id: string | null) => { name: string; email: string };
}

const ITEMS_PER_PAGE = 15;

const tierBadgeClass = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case "private": return "bg-admin-emerald/10 text-admin-emerald border-admin-emerald/20";
    case "elite": return "bg-admin-amber/10 text-admin-amber border-admin-amber/20";
    case "essential": return "bg-admin-indigo/10 text-admin-indigo border-admin-indigo/20";
    default: return "bg-muted/10 text-muted-foreground border-border";
  }
};

const AdminUsersSection = ({ profiles, applications, loading, onRefresh, resolveUser }: Props) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [changeTierUser, setChangeTierUser] = useState<any | null>(null);
  const [newTier, setNewTier] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = profiles.filter(p => {
    const matchSearch =
      (p.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.username || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchTier = tierFilter === "all" || (p.tier || "essential") === tierFilter;
    return matchSearch && matchTier;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const handleChangeTier = async () => {
    if (!changeTierUser || !newTier) return;
    setSaving(true);

    // Update both profiles and users tables atomically
    const [profilesRes, usersRes] = await Promise.all([
      supabase
        .from("profiles")
        .update({ tier: newTier, subscription_tier: newTier })
        .eq("id", changeTierUser.id),
      supabase
        .from("users")
        .update({ tier: newTier })
        .eq("id", changeTierUser.id),
    ]);

    const error = profilesRes.error || usersRes.error;
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tier updated", description: `${changeTierUser.full_name || "User"} → ${newTier}` });
      setChangeTierUser(null);
      onRefresh();
    }
    setSaving(false);
  };

  const handleApplicationStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("private_member_applications")
      .update({ application_status: status, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Application ${status}` });
      onRefresh();
    }
  };

  const pendingApps = applications.filter(a => a.application_status === "pending");

  const fmt = (d: string | null) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">User Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{profiles.length} total users</p>
      </div>

      {/* Pending Applications */}
      {pendingApps.length > 0 && (
        <div className="p-4 rounded-xl bg-admin-amber/5 border border-admin-amber/20">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-admin-amber" />
            <h3 className="text-sm font-semibold text-admin-amber">{pendingApps.length} Pending Application{pendingApps.length > 1 ? "s" : ""}</h3>
          </div>
          <div className="space-y-2">
            {pendingApps.map(app => {
              const user = resolveUser(app.user_id);
              return (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-admin-surface border border-admin-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{app.motivation?.slice(0, 80)}…</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="ghost" className="text-admin-rose hover:bg-admin-rose/10 h-8 px-2.5" onClick={() => handleApplicationStatus(app.id, "rejected")}>
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Deny
                    </Button>
                    <Button size="sm" className="bg-admin-emerald hover:bg-admin-emerald/90 text-white h-8 px-2.5" onClick={() => handleApplicationStatus(app.id, "approved")}>
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or username…"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            className="pl-10 bg-admin-surface border-admin-border"
          />
        </div>
        <Select value={tierFilter} onValueChange={v => { setTierFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[160px] bg-admin-surface border-admin-border">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Tiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="essential">Essential</SelectItem>
            <SelectItem value="elite">Elite</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-xl border border-admin-border overflow-hidden bg-admin-surface">
          <div className="p-4 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-admin-border bg-admin-surface">
          <Users className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">No users match your filters</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-admin-border overflow-hidden bg-admin-surface">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-admin-border">
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tier</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Status</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Joined</th>
                    <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border/50">
                  {paginated.map(p => (
                    <tr key={p.id} className="hover:bg-admin-surface-hover transition-colors group">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-admin-emerald/10 flex items-center justify-center text-admin-emerald text-xs font-bold shrink-0">
                            {(p.full_name || p.email || "U")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{p.full_name || p.username || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground truncate">{p.email || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className={`text-[11px] capitalize ${tierBadgeClass(p.tier)}`}>
                          {p.tier || "—"}
                        </Badge>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          {(p.tier === "essential" || p.tier === "elite") ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-admin-emerald" />
                              <span className="text-xs text-admin-emerald font-medium">Subscriber</span>
                            </>
                          ) : p.tier === "private" ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                              <span className="text-xs text-muted-foreground">Non-subscriber</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
                              <span className="text-xs text-muted-foreground">Unknown</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">{fmt(p.created_at)}</span>
                      </td>
                      <td className="p-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-admin-surface border-admin-border">
                            <DropdownMenuItem onClick={() => { setChangeTierUser(p); setNewTier(p.tier || "free"); }}>
                              <ArrowUpDown className="w-3.5 h-3.5 mr-2" /> Change Tier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-admin-border" />
                            <DropdownMenuItem className="text-admin-rose focus:text-admin-rose">
                              <Shield className="w-3.5 h-3.5 mr-2" /> Suspend Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {page * ITEMS_PER_PAGE + 1}–{Math.min((page + 1) * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="h-8 w-8 p-0">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                  <Button
                    key={i}
                    variant={page === i ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPage(i)}
                    className={`h-8 w-8 p-0 text-xs ${page === i ? "bg-admin-emerald text-white hover:bg-admin-emerald/90" : ""}`}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="h-8 w-8 p-0">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Change Tier Modal */}
      <Dialog open={!!changeTierUser} onOpenChange={open => !open && setChangeTierUser(null)}>
        <DialogContent className="max-w-sm bg-admin-surface border-admin-border">
          <DialogHeader>
            <DialogTitle>Change User Tier</DialogTitle>
          </DialogHeader>
          {changeTierUser && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-admin-bg border border-admin-border">
                <div className="w-10 h-10 rounded-full bg-admin-emerald/10 flex items-center justify-center text-admin-emerald text-sm font-bold">
                  {(changeTierUser.full_name || "U")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{changeTierUser.full_name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{changeTierUser.email}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">New Tier</label>
                <Select value={newTier} onValueChange={setNewTier}>
                  <SelectTrigger className="bg-admin-bg border-admin-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="essential">Essential</SelectItem>
                    <SelectItem value="elite">Elite</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 border-admin-border" onClick={() => setChangeTierUser(null)}>Cancel</Button>
                <Button className="flex-1 bg-admin-emerald hover:bg-admin-emerald/90 text-white" onClick={handleChangeTier} disabled={saving}>
                  {saving ? "Saving…" : "Update Tier"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersSection;
