import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, MapPin, Loader2 } from "lucide-react";

interface StoreSuggestion {
  id: string;
  store_name: string;
  address: string | null;
  phone: string | null;
  description: string | null;
  category: string | null;
  status: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string | null;
  user_id: string | null;
}

const StoreApprovalsTab = () => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<StoreSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("store_suggestions")
      .select("*")
      .order("created_at", { ascending: false });
    setSuggestions((data as StoreSuggestion[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.rpc("approve_store_suggestion", {
      suggestion_id: id,
      admin_id: session.user.id,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Store approved & added to map ✓" });
      load();
    }
  };

  const handleReject = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase
      .from("store_suggestions")
      .update({ status: "rejected", reviewed_by: session?.user?.id, reviewed_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Suggestion rejected" });
      load();
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-secondary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{suggestions.length} store suggestions</p>
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No store suggestions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((s) => (
            <div key={s.id} className="p-5 rounded-xl border border-border/50 bg-card/30">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{s.store_name}</h3>
                  <p className="text-muted-foreground text-sm">{s.address || "No address"}</p>
                </div>
                <Badge variant={s.status === "approved" ? "default" : s.status === "rejected" ? "destructive" : "secondary"}>
                  {s.status === "approved" ? <CheckCircle className="w-3 h-3 mr-1" /> : s.status === "rejected" ? <XCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                  {s.status || "pending"}
                </Badge>
              </div>
              {s.description && <p className="text-foreground text-sm mb-3">{s.description}</p>}
              {s.phone && <p className="text-muted-foreground text-xs mb-3">📞 {s.phone}</p>}
              {s.status === "pending" && (
                <div className="flex gap-2 pt-3 border-t border-border/30">
                  <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleReject(s.id)}>
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                  <Button size="sm" onClick={() => handleApprove(s.id)}>
                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreApprovalsTab;
