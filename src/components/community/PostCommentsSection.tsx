import { useState, useEffect } from "react";
import { Send, User, Trash2, Loader2, Reply, ThumbsUp, ThumbsDown, MoreVertical, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostComment {
  id: string;
  post_id: string | null;
  user_id: string | null;
  comment_text: string;
  parent_comment_id: string | null;
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
  user_name?: string;
  replies?: PostComment[];
}

interface UserInteraction {
  comment_id: string;
  interaction_type: string;
}

interface PostCommentsSectionProps {
  postId: string;
}

export const PostCommentsSection = ({ postId }: PostCommentsSectionProps) => {
  const { toast } = useToast();
  const { isAdmin } = useAdminCheck();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userInteractions, setUserInteractions] = useState<UserInteraction[]>([]);

  useEffect(() => {
    fetchComments();
    getCurrentUser();
  }, [postId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
    if (user) {
      fetchUserInteractions(user.id);
    }
  };

  const fetchUserInteractions = async (userId: string) => {
    const { data } = await supabase
      .from("comment_interactions")
      .select("comment_id, interaction_type")
      .eq("user_id", userId);
    
    setUserInteractions(data || []);
  };

  const fetchComments = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      setLoading(false);
      return;
    }

    // Fetch user names for comments
    const userIds = [...new Set(data?.map(c => c.user_id).filter(Boolean) || [])];
    let userMap = new Map<string, string>();
    
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("id, name")
        .in("id", userIds);

      userMap = new Map(users?.map(u => [u.id, u.name]) || []);
    }

    // Build threaded structure
    const commentsWithNames = data?.map(c => ({
      ...c,
      user_name: c.user_id ? userMap.get(c.user_id) || "Anonymous" : "Anonymous",
      replies: [] as PostComment[],
    })) || [];

    // Organize into tree structure
    const rootComments: PostComment[] = [];
    const commentMap = new Map<string, PostComment>();
    
    commentsWithNames.forEach(c => commentMap.set(c.id, c));
    
    commentsWithNames.forEach(c => {
      if (c.parent_comment_id && commentMap.has(c.parent_comment_id)) {
        const parent = commentMap.get(c.parent_comment_id)!;
        parent.replies = parent.replies || [];
        parent.replies.push(c);
      } else {
        rootComments.push(c);
      }
    });

    setComments(rootComments);
    setLoading(false);
  };

  const handleSubmit = async (parentId: string | null = null) => {
    const text = parentId ? replyText : newComment;
    if (!text.trim()) return;

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

    const { error } = await supabase.from("post_comments").insert({
      user_id: user.id,
      comment_text: text.trim(),
      post_id: postId,
      parent_comment_id: parentId,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post comment.",
        variant: "destructive",
      });
    } else {
      if (parentId) {
        setReplyText("");
        setReplyingTo(null);
      } else {
        setNewComment("");
      }
      fetchComments();
    }

    setSubmitting(false);
  };

  const handleEdit = async (commentId: string) => {
    if (!editText.trim()) return;

    const { error } = await supabase
      .from("post_comments")
      .update({ comment_text: editText.trim() })
      .eq("id", commentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update comment.",
        variant: "destructive",
      });
    } else {
      setEditingComment(null);
      setEditText("");
      fetchComments();
    }
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase
      .from("post_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment.",
        variant: "destructive",
      });
    } else {
      fetchComments();
    }
  };

  const handleInteraction = async (commentId: string, type: "upvote" | "downvote") => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote.",
        variant: "destructive",
      });
      return;
    }

    const existing = userInteractions.find(
      i => i.comment_id === commentId && i.interaction_type === type
    );

    if (existing) {
      // Remove interaction
      await supabase
        .from("comment_interactions")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", user.id)
        .eq("interaction_type", type);
    } else {
      // Remove opposite interaction if exists
      await supabase
        .from("comment_interactions")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", user.id);

      // Add new interaction
      await supabase.from("comment_interactions").insert({
        comment_id: commentId,
        user_id: user.id,
        interaction_type: type,
      });
    }

    fetchUserInteractions(user.id);
    fetchComments();
  };

  const renderComment = (comment: PostComment, depth: number = 0) => {
    const canModify = currentUserId === comment.user_id || isAdmin;
    const isOwner = currentUserId === comment.user_id;
    const hasUpvoted = userInteractions.some(
      i => i.comment_id === comment.id && i.interaction_type === "upvote"
    );
    const hasDownvoted = userInteractions.some(
      i => i.comment_id === comment.id && i.interaction_type === "downvote"
    );

    return (
      <div
        key={comment.id}
        className={cn(
          "border-l-2 pl-4",
          depth === 0 ? "border-border/50" : "border-muted/30",
          depth > 0 && "ml-4 mt-3"
        )}
      >
        <div className="bg-card/30 border border-border/30 rounded-lg p-4">
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
            
            {canModify && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwner && (
                    <DropdownMenuItem onClick={() => {
                      setEditingComment(comment.id);
                      setEditText(comment.comment_text);
                    }}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => handleDelete(comment.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {editingComment === comment.id ? (
            <div className="mt-3 space-y-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="min-h-[60px] bg-background border-border resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleEdit(comment.id)}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingComment(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-foreground/90">{comment.comment_text}</p>
          )}

          {/* Interaction buttons */}
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() => handleInteraction(comment.id, "upvote")}
              className={cn(
                "flex items-center gap-1 text-xs transition-colors",
                hasUpvoted ? "text-green-500" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{comment.upvotes || 0}</span>
            </button>
            <button
              onClick={() => handleInteraction(comment.id, "downvote")}
              className={cn(
                "flex items-center gap-1 text-xs transition-colors",
                hasDownvoted ? "text-red-500" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>{comment.downvotes || 0}</span>
            </button>
            {depth < 3 && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Reply className="w-3.5 h-3.5" />
                Reply
              </button>
            )}
          </div>

          {/* Reply input */}
          {replyingTo === comment.id && (
            <div className="mt-3 flex gap-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 min-h-[60px] bg-background border-border resize-none text-sm"
              />
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  onClick={() => handleSubmit(comment.id)}
                  disabled={submitting || !replyText.trim()}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>

      {/* New Comment Input */}
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-secondary" />
        </div>
        <div className="flex-1 space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="min-h-[80px] bg-card border-border resize-none"
          />
          <Button
            onClick={() => handleSubmit(null)}
            disabled={submitting || !newComment.trim()}
            className="gap-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Post Comment
          </Button>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-border/50 rounded-lg">
          <p className="text-muted-foreground text-sm">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  );
};

export default PostCommentsSection;
