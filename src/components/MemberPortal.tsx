import { useState, useEffect, useCallback } from "react";
import { X, Crown, Gift, Calendar, Star, Sparkles, Loader2, Check, Bell, BookOpen, MessageSquare, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "rewards" | "notifications">("overview");
  const [rewards, setRewards] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rewardCoins, setRewardCoins] = useState(0);
  const [bookingIds, setBookingIds] = useState<Set<string>>(new Set());
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [claimingReward, setClaimingReward] = useState<string | null>(null);
  const [claimMessage, setClaimMessage] = useState("");
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());

  // Overview data
  const [overviewData, setOverviewData] = useState({
    totalOrders: 0,
    activeDeliveries: 0,
    diaryEntries: 0,
    starredItems: 0,
    walletBalance: 0,
    referralCount: 0,
  });

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const [
      rewardsRes, memberEventsRes, mapEventsRes, userRes, notifRes,
      ordersRes, deliveriesRes, diaryRes, starsRes,
      walletRes, referralsRes, claimsRes, bookingsRes,
    ] = await Promise.all([
      supabase.from("member_rewards").select("*").eq("active", true),
      supabase.from("member_events").select("*").order("event_date", { ascending: true }).limit(10),
      supabase.from("active_upcoming_map_events").select("id, title, description, event_date, latitude, longitude, event_type_name"),
      supabase.from("users").select("diary_points").eq("id", userId).maybeSingle(),
      supabase.from("user_notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
      supabase.from("orders").select("id").eq("user_id", userId),
      supabase.from("user_deliveries").select("id").eq("user_id", userId).in("status", ["pending", "assigned", "picked_up", "in_transit"]),
      supabase.from("diary_entries").select("id").eq("author_id", userId),
      supabase.from("post_interactions").select("id").eq("user_id", userId).eq("interaction_type", "star"),
      supabase.from("user_wallet").select("credit_balance").eq("user_id", userId).maybeSingle(),
      supabase.from("referrals").select("id").eq("referrer_id", userId),
      supabase.from("reward_claims").select("reward_id").eq("user_id", userId),
      supabase.from("event_bookings").select("event_id").eq("user_id", userId),
    ]);

    // Filter member_events by tier access
    const filteredMemberEvents = (memberEventsRes.data || []).filter((e: any) => {
      if (!e.tier_access) return true;
      return e.tier_access.includes(tier);
    });

    // Map admin-created map events into the same shape
    const mapEventsMapped = (mapEventsRes.data || []).map((e: any) => ({
      id: e.id,
      event_name: e.title,
      event_date: e.event_date,
      location: e.event_type_name || "Map Event",
      description: e.description,
      tier_access: null, // map events are visible to all tiers
      _source: "map",
    }));

    // Deduplicate by name+date, prefer member_events
    const memberEventKeys = new Set(
      filteredMemberEvents.map((e: any) => `${e.event_name}::${e.event_date}`)
    );
    const uniqueMapEvents = mapEventsMapped.filter(
      (e: any) => !memberEventKeys.has(`${e.event_name}::${e.event_date}`)
    );

    // Combine and sort by date
    const allEvents = [...filteredMemberEvents, ...uniqueMapEvents].sort(
      (a: any, b: any) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    );

    const notifs = notifRes.data || [];
    const unread = notifs.filter((n: any) => !n.seen).length;

    setRewards(rewardsRes.data || []);
    setEvents(allEvents);
    setRewardCoins(userRes.data?.diary_points ?? 0);
    setNotifications(notifs);
    setUnreadCount(unread);
    setClaimedIds(new Set((claimsRes.data || []).map((c: any) => c.reward_id)));
    setBookingIds(new Set((bookingsRes.data || []).map((b: any) => b.event_id)));

    setOverviewData({
      totalOrders: ordersRes.data?.length ?? 0,
      activeDeliveries: deliveriesRes.data?.length ?? 0,
      diaryEntries: diaryRes.data?.length ?? 0,
      starredItems: starsRes.data?.length ?? 0,
      walletBalance: walletRes.data?.credit_balance ?? 0,
      referralCount: referralsRes.data?.length ?? 0,
    });

    setLoading(false);
  }, [userId, tier]);

  useEffect(() => {
    if (!isOpen || !userId) return;
    loadData();
  }, [isOpen, userId, loadData]);

  const handleMarkSeen = async (notifId: string) => {
    await supabase.from("user_notifications").update({ seen: true }).eq("id", notifId);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, seen: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleBookEvent = async (eventId: string, eventName: string) => {
    if (!userId) return;
    setBookingLoading(eventId);
    const { error } = await supabase.from("event_bookings").insert({ user_id: userId, event_id: eventId });
    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already booked", description: "You've already booked this event" });
      } else {
        toast({ title: "Error", description: "Failed to book event", variant: "destructive" });
      }
    } else {
      setBookingIds(prev => new Set([...prev, eventId]));
      // Send notification to admin via user_notifications (admin can query all)
      await supabase.from("user_notifications").insert({
        user_id: userId,
        title: "Event Booked",
        message: `You booked "${eventName}"`,
        type: "event_booking",
      });
      toast({ title: "Event booked! 🎉", description: `You're attending "${eventName}"` });
    }
    setBookingLoading(null);
  };

  const handleSaveEvent = () => {
    toast({ title: "Coming Soon ✨", description: "This feature is coming soon!" });
  };

  const handleClaimReward = async (rewardId: string) => {
    if (!userId || !claimMessage.trim()) {
      toast({ title: "Message required", description: "Please enter a message for your claim", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("reward_claims").insert({
      user_id: userId,
      reward_id: rewardId,
      message: claimMessage.trim(),
      status: "pending",
    });
    if (error) {
      toast({ title: "Error", description: "Failed to submit claim", variant: "destructive" });
    } else {
      setClaimedIds(prev => new Set([...prev, rewardId]));
      setClaimingReward(null);
      setClaimMessage("");
      toast({ title: "Claim submitted! 🎉", description: "Admin will review your request" });
      onWalletUpdate?.();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-card border-2 border-gold/30 rounded-3xl shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-secondary to-gold rounded-t-3xl" />

        {/* Close + Notification Bell */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={() => setActiveTab("notifications")}
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Header — title only, no tier sub-heading */}
        <div className="p-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-secondary/20 border border-gold/30 mb-4">
            <Crown className="w-8 h-8 text-gold" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground">Membership Portal</h2>
        </div>

        {/* Stats bar — "Points" → "Coins" */}
        <div className="mx-8 p-6 rounded-2xl bg-gradient-to-r from-gold/10 via-secondary/10 to-gold/10 border border-gold/20 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gold">{rewardCoins.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Coins</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">{events.length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Events</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{overviewData.walletBalance}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Balance</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
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

        {/* Content */}
        <div className="p-8 pt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-secondary" />
            </div>
          ) : (
            <>
              {/* === OVERVIEW === */}
              {activeTab === "overview" && (
                <div className="space-y-3">
                  {[
                    { label: "Current Coins", value: rewardCoins.toLocaleString(), icon: Crown },
                    { label: "Membership Level", value: tier.charAt(0).toUpperCase() + tier.slice(1), icon: Star },
                    { label: "Total Orders", value: overviewData.totalOrders, icon: BookOpen },
                    { label: "Referrals", value: overviewData.referralCount, icon: Gift },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-secondary" />
                        <span className="text-foreground font-medium">{item.label}</span>
                      </div>
                      <span className="text-foreground font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* === EVENTS === */}
              {activeTab === "events" && (
                <div className="space-y-3">
                  {events.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">No events available for your tier</p>
                  ) : (
                    events.map((event) => {
                      const isBooked = bookingIds.has(event.id);
                      return (
                        <div key={event.id} className="p-4 rounded-xl border bg-muted/20 border-border">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="text-center min-w-[50px]">
                              <Calendar className="w-5 h-5 mx-auto mb-1 text-secondary" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(event.event_date).toLocaleDateString("en-ZA", { month: "short", day: "numeric" })}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{event.event_name}</p>
                              <p className="text-sm text-muted-foreground">{event.location}</p>
                              {event.description && (
                                <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={isBooked ? "ghost" : "default"}
                              disabled={isBooked || bookingLoading === event.id}
                              onClick={() => handleBookEvent(event.id, event.event_name)}
                              className={!isBooked ? "bg-secondary text-secondary-foreground flex-1" : "flex-1"}
                            >
                              {bookingLoading === event.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : isBooked ? (
                                <><Check className="w-4 h-4 mr-1" /> Booked</>
                              ) : (
                                "Book"
                              )}
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1" onClick={handleSaveEvent}>
                              <Bookmark className="w-4 h-4 mr-1" /> Save
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* === REWARDS === */}
              {activeTab === "rewards" && (
                <div className="space-y-3">
                  {/* Refer a Friend button */}
                  <Button
                    variant="outline"
                    className="w-full border-gold/30 text-gold hover:bg-gold/10"
                    onClick={() => toast({ title: "Coming Soon ✨", description: "Referral rewards are launching soon!" })}
                  >
                    <Gift className="w-4 h-4 mr-2" /> Refer a Friend
                  </Button>

                  {rewards.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">No rewards available</p>
                  ) : (
                    rewards.map((reward) => {
                      const isClaimed = claimedIds.has(reward.id);
                      const isClaimOpen = claimingReward === reward.id;
                      return (
                        <div key={reward.id} className={`p-4 rounded-xl border ${isClaimed ? "bg-muted/10 border-border/50 opacity-60" : "bg-muted/20 border-border"}`}>
                          <div className="flex items-start gap-3 mb-2">
                            <Gift className="w-5 h-5 text-gold mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{reward.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {reward.description || `${reward.reward_type} · R${reward.value ?? 0}`}
                              </p>
                            </div>
                          </div>

                          {isClaimOpen ? (
                            <div className="mt-3 space-y-2">
                              <Textarea
                                placeholder="Tell us why you'd like to claim this reward..."
                                value={claimMessage}
                                onChange={(e) => setClaimMessage(e.target.value)}
                                className="min-h-[60px] text-sm"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-secondary text-secondary-foreground flex-1" onClick={() => handleClaimReward(reward.id)}>
                                  <MessageSquare className="w-4 h-4 mr-1" /> Submit Claim
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => { setClaimingReward(null); setClaimMessage(""); }}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant={isClaimed ? "ghost" : "default"}
                              size="sm"
                              disabled={isClaimed}
                              onClick={() => setClaimingReward(reward.id)}
                              className={`w-full mt-2 ${!isClaimed ? "bg-secondary text-secondary-foreground" : ""}`}
                            >
                              {isClaimed ? <><Check className="w-4 h-4 mr-1" /> Claimed</> : "Claim"}
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* === NOTIFICATIONS === */}
              {activeTab === "notifications" && (
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">No notifications</p>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => !notif.seen && handleMarkSeen(notif.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          notif.seen
                            ? "bg-muted/10 border-border/50 opacity-60"
                            : "bg-muted/20 border-secondary/30 hover:border-secondary/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Bell className={`w-4 h-4 mt-0.5 ${notif.seen ? "text-muted-foreground" : "text-secondary"}`} />
                          <div>
                            <p className={`font-medium text-sm ${notif.seen ? "text-muted-foreground" : "text-foreground"}`}>{notif.title}</p>
                            {notif.message && <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>}
                            <p className="text-xs text-muted-foreground/60 mt-1">
                              {new Date(notif.created_at).toLocaleDateString("en-ZA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          {!notif.seen && <span className="ml-auto w-2 h-2 rounded-full bg-secondary flex-shrink-0 mt-1.5" />}
                        </div>
                      </button>
                    ))
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
