import { Flame, Target, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DiaryProgressProps {
  streakCount: number;
  longestStreak: number;
  diaryPoints: number;
  entryCount: number;
}

const milestones = [
  { points: 100, label: "Beginner Badge", icon: "🌱" },
  { points: 500, label: "Reward Unlock", icon: "🎁" },
  { points: 1000, label: "Portal Unlock", icon: "🔓" },
];

const DiaryProgress = ({ streakCount, longestStreak, diaryPoints, entryCount }: DiaryProgressProps) => {
  const nextMilestone = milestones.find(m => diaryPoints < m.points) || milestones[milestones.length - 1];
  const prevMilestone = milestones[milestones.indexOf(nextMilestone) - 1];
  const prevPoints = prevMilestone?.points ?? 0;
  const progress = nextMilestone
    ? Math.min(100, ((diaryPoints - prevPoints) / (nextMilestone.points - prevPoints)) * 100)
    : 100;

  return (
    <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-secondary/5 to-card/50 border border-secondary/20">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-400" />
        <h3 className="font-display font-semibold text-foreground">Diary Activity</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-xl bg-card/30">
          <p className="text-lg font-bold text-foreground">{streakCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Current</p>
        </div>
        <div className="text-center p-2 rounded-xl bg-card/30">
          <p className="text-lg font-bold text-foreground">{longestStreak}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Best</p>
        </div>
        <div className="text-center p-2 rounded-xl bg-card/30">
          <p className="text-lg font-bold text-foreground">{entryCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Entries</p>
        </div>
      </div>

      {/* Milestone Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Target className="w-3 h-3" /> Next: {nextMilestone.icon} {nextMilestone.label}
          </span>
          <span className="text-foreground font-medium">{diaryPoints}/{nextMilestone.points}</span>
        </div>
        <Progress value={progress} className="h-2 bg-muted/30" />
      </div>

      {/* Achieved milestones */}
      <div className="flex gap-2 mt-3">
        {milestones.map(m => (
          <div
            key={m.points}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
              diaryPoints >= m.points
                ? "bg-secondary/20 text-secondary"
                : "bg-muted/20 text-muted-foreground opacity-50"
            }`}
          >
            <Award className="w-3 h-3" />
            {m.icon} {m.points}
          </div>
        ))}
      </div>

      {/* No entry today nudge */}
      {streakCount === 0 && (
        <p className="text-xs text-muted-foreground mt-3 text-center italic">
          No entry today — keep your streak alive! 🔥
        </p>
      )}
    </div>
  );
};

export default DiaryProgress;
