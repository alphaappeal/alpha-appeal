import { useState, useEffect } from "react";
import { X, Crown, Gift, Calendar, Star, Sparkles, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MemberPortalProps {
  isOpen: boolean;
  onClose: () => void;
  tier?: string;
  userId?: string;
  onWalletUpdate?: () => void;
}

const MemberPortal = ({ isOpen, onClose, tier = "private", userId, onWalletUpdate }: MemberPortalProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "rewards">("overview");
  const [rewards, setRewards] = useState<any[]>([]);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [events, setEvents] = useState<any[]>([]);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rewardPoints, setRewardPoints] = useState(0);

  useEffect(() => {
    if (!isOpen || !userId) return;
    const load = async () => {
      setLoading(true);
      const [rewardsRes, claimedRes, eventsRes, userRes] = await Promise.all([
        supabase.from("member_rewards").select("*").eq("active", true),
        supabase.from("user_rewards").select("reward_id").eq("user_id", userId).eq("claimed", true),
        supabase.from("member_events").select("*").order("event_date", { ascending: true }).limit(6),
        supabase.from("users").select("diary_points").eq("id", userId).maybeSingle(),
      ]);
      setRewards(rewardsRes.data || []);
      setClaimedIds(new Set((claimedRes.data || []).map(r => r.reward_id).filter(Boolean)));
      setEvents(eventsRes.data || []);
      setRewardPoints(userRes.data?.diary_points ?? 0);
      setLoading(false);
    };
    load();
  }, [isOpen, userId]);

  const handleClaim = async (rewardId: string) => {
    if (!userId) return;
    setClaiming(rewardId);
    const { error } = await supabase.from("user_rewards").insert({
      user_id: userId,
      reward_id: rewardId,
      claimed: true,
      claimed_at: new Date().toISOString(),
    });
    if (error) {
      toast({ title: "Error", description: "Failed to claim reward", variant: "destructive" });
    } else {
      setClaimedIds(prev => new Set([...prev, rewardId]));
      toast({ title: "Reward claimed! 🎉", description: "Check your wallet for credits" });
      onWalletUpdate?.();
    }
    setClaiming(null);
  };

  if (!isOpen) return null;

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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-gold/50">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-gold font-medium capitalize">{tier === "private" ? "Onyx" : tier} Member</span>
          </div>
        </div>

        <div className="mx-8 p-6 rounded-2xl bg-gradient-to-r from-gold/10 via-secondary/10 to-gold/10 border border-gold/20 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gold">{rewardPoints.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Points</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">{events.length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Events</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground capitalize">{tier === "private" ? "Onyx" : tier}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Tier</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mx-8 mb-4">
          {[
            { id: "overview", label: "Overview" },
            { id: "events", label: "Events" },
            { id: "rewards", label: "Rewards" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8 pt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-secondary" />
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-muted/20 border border-border">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-gold" /> Welcome Benefits
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      {["Priority access to exclusive drops", "Free shipping on all orders", "Personal concierge service", "VIP event invitations"].map(b => (
                        <li key={b} className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-secondary" /> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "events" && (
                <div className="space-y-3">
                  {events.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">No upcoming events</p>
                  ) : (
                    events.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 rounded-xl border bg-muted/20 border-border"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="text-center min-w-[50px]">
                              <Calendar className="w-5 h-5 mx-auto mb-1 text-secondary" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(event.event_date).toLocaleDateString("en-ZA", { month: "short", day: "numeric" })}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{event.event_name}</p>
                              <p className="text-sm text-muted-foreground">{event.location}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "rewards" && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    You have <span className="text-gold font-semibold">{rewardPoints.toLocaleString()} points</span> available.
                  </p>
                  {rewards.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">No rewards available</p>
                  ) : (
                    rewards.map((reward) => {
                      const isClaimed = claimedIds.has(reward.id);
                      return (
                        <div
                          key={reward.id}
                          className={`p-4 rounded-xl border flex items-center justify-between ${
                            isClaimed ? "bg-muted/10 border-border/50 opacity-60" : "bg-muted/20 border-border"
                          }`}
                        >
                          <div>
                            <p className="font-medium text-foreground">{reward.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {reward.description || `${reward.reward_type} · R${reward.value ?? 0}`}
                            </p>
                          </div>
                          <Button
                            variant={isClaimed ? "ghost" : "default"}
                            size="sm"
                            disabled={isClaimed || claiming === reward.id}
                            onClick={() => handleClaim(reward.id)}
                            className={!isClaimed ? "bg-secondary text-secondary-foreground" : ""}
                          >
                            {claiming === reward.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isClaimed ? (
                              <><Check className="w-4 h-4 mr-1" /> Claimed</>
                            ) : (
                              "Claim"
                            )}
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-8 pt-0">
          <Button onClick={onClose} variant="outline" className="w-full">Close Portal</Button>
        </div>
      </div>
    </div>
  );
};

export default MemberPortal;
