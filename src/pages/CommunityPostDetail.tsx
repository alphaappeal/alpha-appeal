import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Calendar, Tag, ArrowLeft, Loader2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import PostInteractions from "@/components/PostInteractions";
import { ThreadedComments } from "@/components/ThreadedComments";

interface DiaryEntry {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  tags: string[] | null;
  created_at: string | null;
  strain_name: string | null;
  upvotes: number | null;
  downvotes: number | null;
  stars: number | null;
}

const getCategoryColor = (category: string | null) => {
  switch (category) {
    case "strains": return "bg-secondary/20 text-secondary border-secondary/30";
    case "wellness": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "culture": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const CommunityPostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) fetchEntry();
  }, [postId]);

  const fetchEntry = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("id", postId)
      .eq("published", true)
      .maybeSingle();

    if (!error && data) setEntry(data as DiaryEntry);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold text-foreground mb-2">Post not found</h2>
          <Button variant="outline" onClick={() => navigate("/community")}>
            Back to Community
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{entry.title} | Alpha Community</title>
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/community")} className="gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to Community
            </Button>
          </div>
        </header>

        <article className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            {entry.category && (
              <Badge variant="outline" className={cn("mb-4", getCategoryColor(entry.category))}>
                {entry.category}
              </Badge>
            )}

            <h1 className="text-3xl font-display font-bold text-foreground mb-4">
              {entry.title}
            </h1>

            {entry.created_at && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(entry.created_at), "MMMM d, yyyy")}</span>
              </div>
            )}

            <div className="prose prose-invert prose-sm max-w-none">
              <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </div>
            </div>

            {/* Interactions */}
            <div className="py-4 border-t border-b border-border my-6">
              <PostInteractions
                postId={entry.id}
                upvotes={entry.upvotes || 0}
                downvotes={entry.downvotes || 0}
                stars={entry.stars || 0}
              />
            </div>

            {entry.tags && entry.tags.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {entry.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Threaded Comments */}
            <ThreadedComments postId={entry.id} />
          </div>
        </article>

        <BottomNav />
      </div>
    </>
  );
};

export default CommunityPostDetail;
