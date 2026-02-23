import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PostInteractions } from "@/components/PostInteractions";
import ThreadedComments from "@/components/ThreadedComments";
import { cn } from "@/lib/utils";

const CultureItemDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      const { data } = await supabase
        .from("culture_items")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      setItem(data);
      setLoading(false);
    };
    if (slug) fetchItem();
  }, [slug]);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "fashion": return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      case "wellness": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "artwork": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "cars": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const feelings = item?.feelings as Record<string, string> | null;
  const positiveEffects = feelings
    ? Object.entries(feelings)
        .filter(([, v]) => parseInt(v) >= 50)
        .sort(([, a], [, b]) => parseInt(b) - parseInt(a))
    : [];
  const negativeEffects = feelings
    ? Object.entries(feelings)
        .filter(([, v]) => parseInt(v) < 50)
        .sort(([, a], [, b]) => parseInt(b) - parseInt(a))
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Item not found</p>
        <Button variant="outline" onClick={() => navigate("/community")}>Back to Community</Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{item.name} | Alpha Community</title>
        <meta name="description" content={item.description?.substring(0, 155)} />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/community")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-display font-bold text-foreground truncate">{item.name}</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 space-y-6">
          {item.img_url && (
            <div className="rounded-xl overflow-hidden border border-border/50 aspect-video">
              <img src={item.img_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn("text-xs", getCategoryColor(item.category))}>
              {item.category}
            </Badge>
            {item.type && (
              <Badge variant="outline" className="text-xs">{item.type}</Badge>
            )}
            {item.year && (
              <span className="text-xs text-muted-foreground">{item.year}</span>
            )}
          </div>

          {item.creator && (
            <p className="text-sm text-muted-foreground">By <span className="text-foreground font-medium">{item.creator}</span></p>
          )}
          {item.medium && (
            <p className="text-xs text-muted-foreground">{item.medium}</p>
          )}

          <p className="text-sm text-foreground/90 leading-relaxed">{item.description}</p>

          <PostInteractions
            cultureItemId={item.id}
            upvotes={item.upvotes || 0}
            downvotes={item.downvotes || 0}
            stars={item.stars || 0}
            onCommentClick={() => setShowComments(!showComments)}
          />

          {positiveEffects.length > 0 && (
            <section>
              <h2 className="text-lg font-display font-semibold text-foreground mb-3">Feelings</h2>
              <div className="space-y-2">
                {positiveEffects.map(([key, val]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-foreground capitalize w-28 truncate">{key.replace(/_/g, " ")}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: val }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">{val}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {negativeEffects.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-2">Lower Responses</h2>
              <div className="space-y-2">
                {negativeEffects.map(([key, val]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground capitalize w-28 truncate">{key.replace(/_/g, " ")}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-muted-foreground/40 rounded-full" style={{ width: val }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">{val}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {showComments && (
            <section>
              <h2 className="text-lg font-display font-semibold text-foreground mb-3">Comments</h2>
              <ThreadedComments cultureItemId={item.id} />
            </section>
          )}
        </main>

        <BottomNav />
      </div>
    </>
  );
};

export default CultureItemDetail;
