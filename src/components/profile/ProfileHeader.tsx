import { User, Flame, Trophy, Users } from "lucide-react";

interface ProfileHeaderProps {
  profile: any;
  user: any;
  subscription: any;
  wallet: { credit_balance: number; token_balance: number } | null;
  referralCount: number;
}

const ProfileHeader = ({ profile, user, subscription, wallet, referralCount }: ProfileHeaderProps) => {
  const getTierDisplay = () => {
    if (subscription?.tier) return subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1);
    if (profile?.tier) return profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1);
    return "Private";
  };

  return (
    <div className="text-center mb-6">
      <div className="w-20 h-20 rounded-full bg-secondary/10 border-2 border-secondary/30 flex items-center justify-center mx-auto mb-4">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" loading="lazy" />
        ) : (
          <User className="w-10 h-10 text-secondary" />
        )}
      </div>
      <h2 className="font-display text-xl font-bold text-foreground mb-0.5">
        {profile?.full_name || user?.email?.split("@")[0] || "Member"}
      </h2>
      {profile?.username && (
        <p className="text-muted-foreground text-xs mb-1">@{profile.username}</p>
      )}
      <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
        {getTierDisplay()} Member
      </span>

      {/* Stats Row — Streak, Best, Referrals */}
      <div className="grid grid-cols-3 gap-2 mt-5 p-4 rounded-2xl bg-card/50 border border-border/50">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <p className="text-lg font-bold text-foreground">{profile?.streak_count ?? 0}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Streak</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy className="w-3.5 h-3.5 text-gold" />
          </div>
          <p className="text-lg font-bold text-foreground">{profile?.longest_streak ?? 0}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Best</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users className="w-3.5 h-3.5 text-secondary" />
          </div>
          <p className="text-lg font-bold text-foreground">{referralCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Referrals</p>
        </div>
      </div>

      {/* Diary Points */}
      {(profile?.diary_points ?? 0) > 0 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">Diary Points:</span>
          <span className="text-sm font-bold text-gold">{profile.diary_points?.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
