import { useState, useEffect } from "react";
import { X, Crown, Gift, Calendar, Star, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface MemberPortalProps {
  isOpen: boolean;
  onClose: () => void;
  tier?: string;
}

const MemberPortal = ({ isOpen, onClose, tier = "private" }: MemberPortalProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "rewards">("overview");
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<any[]>([]);
  const [claimedRewardIds, setClaimedRewardIds] = useState<Set<string>>(new Set());
  const [events, setEvents] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [diaryPoints, setDiaryPoints] = useState(0);

  useEffect(() => {
    if (isOpen) loadPortalData();
  }, [isOpen]);

  const loadPortalData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }

    const [rewardsRes, claimedRes, eventsRes, walletRes, userRes] = await Promise.all([
      supabase.from("member_rewards").select("*").eq("active", true),
      supabase.from("user_rewards").select("reward_id").eq("user_id", session.user.id).eq("claimed", true),
      supabase.from("member_events").select("*").gte("event_date", new Date().toISOString().split("T")[0]).order("event_date", { ascending: true }).limit(10),
      supabase.from("user_wallet").select("*").eq("user_id", session.user.id).maybeSingle(),
      supabase.from("users").select("diary_points").eq("id", session.user.id).maybeSingle(),
    ]);

    setRewards(rewardsRes.data || []);
    setClaimedRewardIds(new Set((claimedRes.data || []).map((c: any) => c.reward_id)));
    setEvents(eventsRes.data || []);
    setWallet(walletRes.data);
    setDiaryPoints(userRes.data?.diary_points || 0);
    setLoading(false);
  };

  const claimReward = async (reward: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("user_rewards").insert({
      user_id: session.user.id,
      reward_id: reward.id,
      claimed: true,
      claimed_at: new Date().toISOString(),
    });

    if (error) {
      toast({ title: "Error", description: "Could not claim reward", variant: "destructive" });
      return;
    }

    // If credit reward, update wallet
    if (reward.reward_type === "credit" && reward.value) {
      const currentBalance = wallet?.credit_balance || 0;
      await supabase.from("user_wallet").upsert({
        user_id: session.user.id,
        credit_balance: currentBalance + reward.value,
      }, { onConflict: "user_id" });
      setWallet((prev: any) => ({ ...prev, credit_balance: currentBalance + reward.value }));
    }

    setClaimedRewardIds(prev => new Set([...prev, reward.id]));
    toast({ title: "Reward claimed!", description: reward.title });
  };

  if (!isOpen) return null;

  const creditBalance = wallet?.credit_balance || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-card border-2 border-gold/30 rounded-3xl shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-secondary to-gold rounded-t-3xl" />
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-secondary/20 border border-gold/30 mb-4">
            <Crown className="w-8 h-8 text-gold" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">Member Portal</h2>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black border border-gold/50">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-gold font-medium capitalize">{tier === "private" ? "Onyx" : tier} Member</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-secondary" /></div>
        ) : (
          <>
            <div className="mx-8 p-6 rounded-2xl bg-gradient-to-r from-gold/10 via-secondary/10 to-gold/10 border border-gold/20 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gold">{diaryPoints.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Diary Points</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary">R{creditBalance.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Wallet Credit</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{events.length}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Events</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mx-8 mb-4">
              {(["overview", "events", "rewards"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab ? "bg-secondary text-secondary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="p-8 pt-4">
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-muted/20 border border-border">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-gold" /> Welcome Benefits
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2"><Star className="w-4 h-4 text-secondary" />Priority access to all exclusive drops</li>
                      <li className="flex items-center gap-2"><Star className="w-4 h-4 text-secondary" />Free shipping on all orders</li>
                      <li className="flex items-center gap-2"><Star className="w-4 h-4 text-secondary" />Personal concierge service</li>
                      <li className="flex items-center gap-2"><Star className="w-4 h-4 text-secondary" />VIP event invitations</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "events" && (
                <div className="space-y-3">
                  {events.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No upcoming events</p>
                  ) : events.map((event) => (
                    <div key={event.id} className={`p-4 rounded-xl border ${event.tier_access?.includes("private") ? "bg-gold/5 border-gold/30" : "bg-muted/20 border-border"}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="text-center min-w-[50px]">
                            <Calendar className="w-5 h-5 mx-auto mb-1 text-secondary" />
                            <span className="text-xs text-muted-foreground">{format(new Date(event.event_date), "MMM d")}</span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{event.event_name}</p>
                            <p className="text-sm text-muted-foreground">{event.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "rewards" && (
                <div className="space-y-3">
                  {rewards.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No rewards available</p>
                  ) : rewards.map((reward) => {
                    const isClaimed = claimedRewardIds.has(reward.id);
                    return (
                      <div key={reward.id} className={`p-4 rounded-xl border flex items-center justify-between ${isClaimed ? "bg-muted/10 border-border/50 opacity-60" : "bg-muted/20 border-border"}`}>
                        <div>
                          <p className="font-medium text-foreground">{reward.title}</p>
                          <p className="text-sm text-muted-foreground">{reward.description}</p>
                          {reward.value && <p className="text-xs text-secondary mt-1">Value: R{reward.value}</p>}
                        </div>
                        <Button variant={isClaimed ? "glass" : "sage"} size="sm" disabled={isClaimed} onClick={() => claimReward(reward)}>
                          {isClaimed ? "Claimed" : "Claim"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        <div className="p-8 pt-0">
          <Button onClick={onClose} variant="glass" className="w-full">Close Portal</Button>
        </div>
      </div>
    </div>
  );
};

export default MemberPortal;
