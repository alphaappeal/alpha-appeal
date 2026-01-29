import { useState } from "react";
import { X, Crown, Gift, Calendar, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MemberPortalProps {
  isOpen: boolean;
  onClose: () => void;
  tier?: string;
}

const MemberPortal = ({ isOpen, onClose, tier = "private" }: MemberPortalProps) => {
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "rewards">("overview");

  // Demo data
  const rewardPoints = 1250;
  const upcomingEvents = [
    { date: "Jan 18", title: "Private Tasting Experience", location: "Sandton City", exclusive: true },
    { date: "Jan 25", title: "Culture Night: Art & Music", location: "V&A Waterfront", exclusive: false },
    { date: "Feb 1", title: "February Kit Preview", location: "Virtual", exclusive: true },
    { date: "Feb 14", title: "Valentine's Wellness Retreat", location: "Umhlanga", exclusive: true }
  ];

  const rewards = [
    { name: "Free Shipping", points: 500, available: true },
    { name: "10% Off Next Order", points: 750, available: true },
    { name: "Exclusive Drop Access", points: 1000, available: true },
    { name: "VIP Event Ticket", points: 2000, available: false },
    { name: "Personal Concierge Call", points: 3000, available: false }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-card border-2 border-gold/30 rounded-3xl shadow-2xl">
        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-secondary to-gold rounded-t-3xl" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="p-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-secondary/20 border border-gold/30 mb-4">
            <Crown className="w-8 h-8 text-gold" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">
            Member Portal
          </h2>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black border border-gold/50">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-gold font-medium capitalize">{tier === "private" ? "Onyx" : tier} Member</span>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mx-8 p-6 rounded-2xl bg-gradient-to-r from-gold/10 via-secondary/10 to-gold/10 border border-gold/20 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gold">{rewardPoints.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Reward Points</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">{upcomingEvents.length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Upcoming Events</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">Onyx</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Tier</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mx-8 mb-4">
          {[
            { id: "overview", label: "Overview" },
            { id: "events", label: "Events" },
            { id: "rewards", label: "Rewards" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "overview" | "events" | "rewards")}
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

        {/* Tab Content */}
        <div className="p-8 pt-4">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-muted/20 border border-border">
                <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-gold" />
                  Welcome Benefits
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-secondary" />
                    Priority access to all exclusive drops
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-secondary" />
                    Free shipping on all orders
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-secondary" />
                    Personal concierge service
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-secondary" />
                    VIP event invitations
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-gold/5 to-secondary/5 border border-gold/20">
                <p className="text-center text-muted-foreground">
                  Your February kit is being curated. Expect delivery by <span className="text-foreground font-medium">Feb 5th</span>.
                </p>
              </div>
            </div>
          )}

          {activeTab === "events" && (
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border ${
                    event.exclusive
                      ? "bg-gold/5 border-gold/30"
                      : "bg-muted/20 border-border"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-center min-w-[50px]">
                        <Calendar className={`w-5 h-5 mx-auto mb-1 ${event.exclusive ? "text-gold" : "text-secondary"}`} />
                        <span className="text-xs text-muted-foreground">{event.date}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                      </div>
                    </div>
                    {event.exclusive && (
                      <span className="text-xs bg-gold/20 text-gold px-2 py-1 rounded-full">
                        Exclusive
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "rewards" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                You have <span className="text-gold font-semibold">{rewardPoints.toLocaleString()} points</span> available to redeem.
              </p>
              {rewards.map((reward, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    reward.available
                      ? "bg-muted/20 border-border"
                      : "bg-muted/10 border-border/50 opacity-60"
                  }`}
                >
                  <div>
                    <p className="font-medium text-foreground">{reward.name}</p>
                    <p className="text-sm text-muted-foreground">{reward.points.toLocaleString()} points</p>
                  </div>
                  <Button
                    variant={reward.available ? "sage" : "glass"}
                    size="sm"
                    disabled={!reward.available}
                  >
                    {reward.available ? "Redeem" : "Locked"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 pt-0">
          <Button onClick={onClose} variant="glass" className="w-full">
            Close Portal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MemberPortal;