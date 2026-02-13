import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Star, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PostInteractionsProps {
  postId?: string;
  strainId?: string;
  upvotes: number;
  downvotes: number;
  stars: number;
  commentCount?: number;
  onCommentClick?: () => void;
  size?: "sm" | "md";
}

interface UserInteractions {
  upvote: boolean;
  downvote: boolean;
  star: boolean;
}

export const PostInteractions = ({
  postId,
  strainId,
  upvotes: initialUpvotes,
  downvotes: initialDownvotes,
  stars: initialStars,
  commentCount = 0,
  onCommentClick,
  size = "md",
}: PostInteractionsProps) => {
  const { toast } = useToast();
  const [userInteractions, setUserInteractions] = useState<UserInteractions>({
    upvote: false,
    downvote: false,
    star: false,
  });
  const [counts, setCounts] = useState({
    upvotes: initialUpvotes,
    downvotes: initialDownvotes,
    stars: initialStars,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserInteractions();
  }, [postId, strainId]);

  const fetchUserInteractions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from("post_interactions")
      .select("interaction_type")
      .eq("user_id", user.id);

    if (postId) {
      query = query.eq("post_id", postId);
    } else if (strainId) {
      query = query.eq("strain_id", strainId);
    }

    const { data } = await query;

    if (data) {
      const interactions: UserInteractions = {
        upvote: false,
        downvote: false,
        star: false,
      };
      data.forEach((i) => {
        if (i.interaction_type === "upvote") interactions.upvote = true;
        if (i.interaction_type === "downvote") interactions.downvote = true;
        if (i.interaction_type === "star") interactions.star = true;
      });
      setUserInteractions(interactions);
    }
  };

  const handleInteraction = async (type: "upvote" | "downvote" | "star") => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to interact with posts.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const isActive = userInteractions[type];

    try {
      if (isActive) {
        // Remove interaction
        let query = supabase
          .from("post_interactions")
          .delete()
          .eq("user_id", user.id)
          .eq("interaction_type", type);

        if (postId) {
          query = query.eq("post_id", postId);
        } else if (strainId) {
          query = query.eq("strain_id", strainId);
        }

        await query;

        setUserInteractions((prev) => ({ ...prev, [type]: false }));
        setCounts((prev) => ({
          ...prev,
          [`${type}s`]: Math.max(0, prev[`${type}s` as keyof typeof prev] - 1),
        }));
      } else {
        // Add interaction
        const { error: insertError } = await supabase.from("post_interactions").insert({
          user_id: user.id,
          interaction_type: type,
          post_id: postId || null,
          strain_id: strainId || null,
        });

        if (!insertError) {
          setUserInteractions((prev) => ({ ...prev, [type]: true }));
          setCounts((prev) => ({
            ...prev,
            [`${type}s`]: prev[`${type}s` as keyof typeof prev] + 1,
          }));
        }
      }
    } catch (error) {
      console.error("Interaction error:", error);
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const buttonSize = size === "sm" ? "h-8 px-2" : "h-9 px-3";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          buttonSize,
          "gap-1.5",
          userInteractions.upvote
            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300"
            : "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => handleInteraction("upvote")}
        disabled={loading}
      >
        <ThumbsUp className={iconSize} />
        <span className="text-sm">{counts.upvotes}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          buttonSize,
          "gap-1.5",
          userInteractions.downvote
            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300"
            : "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => handleInteraction("downvote")}
        disabled={loading}
      >
        <ThumbsDown className={iconSize} />
        <span className="text-sm">{counts.downvotes}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          buttonSize,
          "gap-1.5",
          userInteractions.star
            ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 hover:text-yellow-300"
            : "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => handleInteraction("star")}
        disabled={loading}
      >
        <Star className={cn(iconSize, userInteractions.star && "fill-current")} />
        <span className="text-sm">{counts.stars}</span>
      </Button>

      {onCommentClick && (
        <Button
          variant="ghost"
          size="sm"
          className={cn(buttonSize, "gap-1.5 text-muted-foreground hover:text-foreground")}
          onClick={onCommentClick}
        >
          <MessageCircle className={iconSize} />
          <span className="text-sm">{commentCount}</span>
        </Button>
      )}
    </div>
  );
};

export default PostInteractions;
