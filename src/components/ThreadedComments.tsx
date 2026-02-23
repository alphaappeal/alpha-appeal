import { useState, useEffect } from "react";
import { Send, User, Trash2, Loader2, ThumbsUp, ThumbsDown, MessageCircle, ChevronDown, ChevronUp, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  user_id: string | null;
  comment_text: string;
  created_at: string | null;
  parent_comment_id: string | null;
  upvotes: number | null;
  downvotes: number | null;
  user_name?: string;
  replies?: Comment[];
}

interface ThreadedCommentsProps {
  postId?: string;
  strainId?: string;
  cultureItemId?: string;
}

export const ThreadedComments = ({ postId, strainId, cultureItemId }: ThreadedCommentsProps) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<"recent" | "upvoted">("recent");

  useEffect(() => {
    getCurrentUser();
    fetchComments();
  }, [postId, strainId, cultureItemId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);
    
    const { data: roleData } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" as const });
    setIsAdmin(!!roleData);
  };

  const fetchComments = async () => {
    setLoading(true);

    const targetCol = postId ? "post_id" : strainId ? "strain_id" : "culture_item_id";
    const targetVal = postId || strainId || cultureItemId;
    if (!targetVal) { setLoading(false); return; }

    const { data, error } = await (supabase
      .from("post_comments")
      .select("*")
      .eq(targetCol, targetVal)
      .order("created_at", { ascending: true }) as any);

    if (error) {
      console.error("Error fetching comments:", error);
      setLoading(false);
      return;
    }

    // Fetch user names
    const userIds = [...new Set(data?.map(c => c.user_id).filter(Boolean) as string[])];
    let userMap = new Map<string, string>();
    
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("id, username, full_name")
        .in("id", userIds);
      
      userMap = new Map(users?.map(u => [u.id, u.full_name || u.username || "Member"]) || []);
    }

    // Fetch user's votes
    if (currentUserId) {
      const commentIds = data?.map(c => c.id) || [];
      if (commentIds.length > 0) {
        const { data: votes } = await supabase
          .from("comment_interactions")
          .select("comment_id, interaction_type")
          .eq("user_id", currentUserId)
          .in("comment_id", commentIds);
        
        const voteMap: Record<string, string> = {};
        votes?.forEach(v => { if (v.comment_id && v.interaction_type) voteMap[v.comment_id] = v.interaction_type; });
        setUserVotes(voteMap);
      }
    }

    // Build tree
    const flat = (data || []).map(c => ({
      ...c,
      user_name: c.user_id ? userMap.get(c.user_id) || "Member" : "Anonymous",
      replies: [] as Comment[],
    }));

    const map = new Map<string, Comment>();
    flat.forEach(c => map.set(c.id, c));
    
    const roots: Comment[] = [];
    flat.forEach(c => {
      if (c.parent_comment_id && map.has(c.parent_comment_id)) {
        map.get(c.parent_comment_id)!.replies!.push(c);
      } else {
        roots.push(c);
      }
    });

    setComments(roots);
    setLoading(false);
  };

  const handleSubmit = async (parentId?: string) => {
    const text = parentId ? replyText : newComment;
    if (!text.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to comment.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const insertData: any = {
      user_id: user.id,
      comment_text: text.trim(),
      post_id: postId || null,
      parent_comment_id: parentId || null,
    };
    if (strainId && !postId) insertData.strain_id = strainId;
    if (cultureItemId && !postId && !strainId) insertData.culture_item_id = cultureItemId;

    const { error } = await supabase.from("post_comments").insert(insertData);

    if (error) {
      toast({ title: "Error", description: "Failed to post comment.", variant: "destructive" });
    } else {
      if (parentId) { setReplyText(""); setReplyingTo(null); }
      else setNewComment("");
      fetchComments();
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase.from("post_comments").delete().eq("id", commentId);
    if (!error) fetchComments();
  };

  const handleEdit = async (commentId: string) => {
    if (!editText.trim()) return;
    const { error } = await supabase.from("post_comments").update({ comment_text: editText.trim() }).eq("id", commentId);
    if (!error) { setEditingId(null); fetchComments(); }
  };

  const handleVote = async (commentId: string, type: "upvote" | "downvote") => {
    if (!currentUserId) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }

    const existing = userVotes[commentId];
    
    if (existing === type) {
      // Remove vote
      await supabase.from("comment_interactions").delete()
        .eq("comment_id", commentId).eq("user_id", currentUserId).eq("interaction_type", type);
      setUserVotes(prev => { const n = {...prev}; delete n[commentId]; return n; });
      // Update count
      const field = type === "upvote" ? "upvotes" : "downvotes";
      const comment = findComment(comments, commentId);
      if (comment) {
        await supabase.from("post_comments").update({ [field]: Math.max(0, (comment[field] || 0) - 1) }).eq("id", commentId);
      }
    } else {
      // Remove opposite if exists
      if (existing) {
        await supabase.from("comment_interactions").delete()
          .eq("comment_id", commentId).eq("user_id", currentUserId).eq("interaction_type", existing);
        const oppField = existing === "upvote" ? "upvotes" : "downvotes";
        const comment = findComment(comments, commentId);
        if (comment) {
          await supabase.from("post_comments").update({ [oppField]: Math.max(0, (comment[oppField as keyof Comment] as number || 0) - 1) }).eq("id", commentId);
        }
      }
      // Add new vote
      await supabase.from("comment_interactions").insert({
        comment_id: commentId, user_id: currentUserId, interaction_type: type,
      });
      const field = type === "upvote" ? "upvotes" : "downvotes";
      const comment = findComment(comments, commentId);
      if (comment) {
        await supabase.from("post_comments").update({ [field]: (comment[field] || 0) + 1 }).eq("id", commentId);
      }
      setUserVotes(prev => ({ ...prev, [commentId]: type }));
    }
    fetchComments();
  };

  const findComment = (list: Comment[], id: string): Comment | null => {
    for (const c of list) {
      if (c.id === id) return c;
      if (c.replies) {
        const found = findComment(c.replies, id);
        if (found) return found;
      }
    }
    return null;
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === "upvoted") return ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0));
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  const renderComment = (comment: Comment, depth = 0) => (
    <div key={comment.id} className={cn("border-border/50", depth > 0 && "ml-6 border-l pl-4")}>
      <div className="bg-card/30 border border-border/30 rounded-lg p-3 mb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{comment.user_name}</p>
              {comment.created_at && (
                <p className="text-xs text-muted-foreground">
                  {format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            {currentUserId === comment.user_id && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingId(comment.id); setEditText(comment.comment_text); }}>
                <Edit2 className="w-3 h-3" />
              </Button>
            )}
            {(currentUserId === comment.user_id || isAdmin) && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(comment.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {editingId === comment.id ? (
          <div className="mt-2 flex gap-2">
            <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="flex-1 min-h-[60px] text-sm" />
            <div className="flex flex-col gap-1">
              <Button size="icon" className="h-7 w-7" onClick={() => handleEdit(comment.id)}><Check className="w-3 h-3" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}><X className="w-3 h-3" /></Button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-foreground/90">{comment.comment_text}</p>
        )}

        <div className="flex items-center gap-3 mt-2">
          <button 
            onClick={() => handleVote(comment.id, "upvote")}
            className={cn("flex items-center gap-1 text-xs", userVotes[comment.id] === "upvote" ? "text-green-400" : "text-muted-foreground hover:text-foreground")}
          >
            <ThumbsUp className="w-3.5 h-3.5" /> {comment.upvotes || 0}
          </button>
          <button 
            onClick={() => handleVote(comment.id, "downvote")}
            className={cn("flex items-center gap-1 text-xs", userVotes[comment.id] === "downvote" ? "text-red-400" : "text-muted-foreground hover:text-foreground")}
          >
            <ThumbsDown className="w-3.5 h-3.5" /> {comment.downvotes || 0}
          </button>
          <button 
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Reply
          </button>
        </div>

        {replyingTo === comment.id && (
          <div className="mt-2 flex gap-2">
            <Textarea 
              value={replyText} 
              onChange={(e) => setReplyText(e.target.value)} 
              placeholder="Write a reply..." 
              className="flex-1 min-h-[60px] text-sm bg-card border-border"
            />
            <Button size="icon" className="self-end" onClick={() => handleSubmit(comment.id)} disabled={submitting}>
              <Send className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-1">
          {comment.replies.map(r => renderComment(r, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Comments</h3>
        <Button variant="ghost" size="sm" onClick={() => setSortBy(s => s === "recent" ? "upvoted" : "recent")} className="text-xs text-muted-foreground">
          {sortBy === "recent" ? "Most Recent" : "Most Upvoted"}
          {sortBy === "recent" ? <ChevronDown className="w-3 h-3 ml-1" /> : <ChevronUp className="w-3 h-3 ml-1" />}
        </Button>
      </div>

      <div className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 min-h-[80px] bg-card border-border resize-none"
        />
        <Button onClick={() => handleSubmit()} disabled={submitting || !newComment.trim()} size="icon" className="self-end">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-4"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
      ) : sortedComments.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-4">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-2">
          {sortedComments.map(c => renderComment(c))}
        </div>
      )}
    </div>
  );
};

export default ThreadedComments;
