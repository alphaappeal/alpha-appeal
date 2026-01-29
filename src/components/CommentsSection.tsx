import { useState, useEffect } from "react";
import { Send, User, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
}

interface CommentsSectionProps {
  postId?: string;
  strainId?: string;
}

export const CommentsSection = ({ postId, strainId }: CommentsSectionProps) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
    getCurrentUser();
  }, [postId, strainId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchComments = async () => {
    setLoading(true);
    
    let query = supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: true });

    if (postId) {
      query = query.eq("post_id", postId);
    } else if (strainId) {
      query = query.eq("strain_id", strainId);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load comments.",
        variant: "destructive",
      });
    } else {
      // Fetch user names for comments
      const userIds = [...new Set(data?.map(c => c.user_id) || [])];
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from("users")
          .select("id, username, full_name")
          .in("id", userIds);

        const userMap = new Map(users?.map(u => [u.id, u.full_name || u.username || "User"]) || []);
        const commentsWithNames = data?.map(c => ({
          ...c,
          user_name: userMap.get(c.user_id) || "Anonymous",
        })) || [];
        
        setComments(commentsWithNames);
      } else {
        setComments([]);
      }
    }
    
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("comments").insert({
      user_id: user.id,
      content: newComment.trim(),
      post_id: postId || null,
      strain_id: strainId || null,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post comment.",
        variant: "destructive",
      });
    } else {
      setNewComment("");
      fetchComments();
    }

    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment.",
        variant: "destructive",
      });
    } else {
      setComments(comments.filter(c => c.id !== commentId));
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Comments</h3>

      {/* Comment Input */}
      <div className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 min-h-[80px] bg-card border-border resize-none"
        />
        <Button
          onClick={handleSubmit}
          disabled={submitting || !newComment.trim()}
          size="icon"
          className="self-end"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-4">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-4">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-card/50 border border-border/50 rounded-lg p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {comment.user_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                {currentUserId === comment.user_id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(comment.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <p className="mt-2 text-sm text-foreground/90">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
