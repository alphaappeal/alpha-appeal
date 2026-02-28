import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tracks user visits and updates streak logic:
 * - If last visit was within 24-48h, increment streak
 * - If last visit was within 24h, do nothing (already counted today)
 * - If >48h since last visit, reset streak to 1
 * - Best streak is always preserved as the high-water mark
 */
export const useStreakTracker = (userId: string | undefined) => {
  useEffect(() => {
    if (!userId) return;

    const trackVisit = async () => {
      const { data: user } = await supabase
        .from("users")
        .select("last_visit_at, streak_count, longest_streak")
        .eq("id", userId)
        .maybeSingle();

      if (!user) return;

      const now = new Date();
      const lastVisit = user.last_visit_at ? new Date(user.last_visit_at) : null;

      if (!lastVisit) {
        // First ever visit
        await supabase.from("users").update({
          streak_count: 1,
          longest_streak: Math.max(user.longest_streak ?? 0, 1),
          last_visit_at: now.toISOString(),
        }).eq("id", userId);
        return;
      }

      const hoursSinceLastVisit = (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastVisit < 24) {
        // Already visited today, just update timestamp
        await supabase.from("users").update({
          last_visit_at: now.toISOString(),
        }).eq("id", userId);
      } else if (hoursSinceLastVisit <= 48) {
        // Within window — increment streak
        const newStreak = (user.streak_count ?? 0) + 1;
        await supabase.from("users").update({
          streak_count: newStreak,
          longest_streak: Math.max(user.longest_streak ?? 0, newStreak),
          last_visit_at: now.toISOString(),
        }).eq("id", userId);
      } else {
        // >48h — reset
        await supabase.from("users").update({
          streak_count: 1,
          longest_streak: Math.max(user.longest_streak ?? 0, 1),
          last_visit_at: now.toISOString(),
        }).eq("id", userId);
      }
    };

    trackVisit();
  }, [userId]);
};
