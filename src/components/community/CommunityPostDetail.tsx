import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Leaf, Star, User, Beaker } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import PostInteractions from "@/components/PostInteractions";
import PostCommentsSection from "./PostCommentsSection";

interface DiaryEntry {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  tags: string[] | null;
  strain_name: string | null;
  strain_id: string | null;
  experience_rating: number | null;
  consumption_method: string | null;
  upvotes: number | null;
  downvotes: number | null;
  stars: number | null;
  created_at: string | null;
  author_id: string | null;
}

interface Strain {
  id: string;
  name: string;
  type: string | null;
  thc_level: string | null;
  description: string | null;
  effects: unknown;
  most_common_terpene: string | null;
}

interface CommunityPostDetailProps {
  entry: DiaryEntry;
  onBack: () => void;
}

const getCategoryColor = (category: string | null) => {
  switch (category) {
    case "strains":
      return "bg-secondary/20 text-secondary border-secondary/30";
    case "wellness":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "culture":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "review":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    default:
      return "bg-muted text-muted-foreground border-muted";
  }
};

const renderStars = (rating: number | null) => {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "w-5 h-5",
            star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
          )}
        />
      ))}
      <span className="text-sm text-muted-foreground ml-2">{rating}/5</span>
    </div>
  );
};

export const CommunityPostDetail = ({ entry, onBack }: CommunityPostDetailProps) => {
  const [strain, setStrain] = useState<Strain | null>(null);
  const [authorName, setAuthorName] = useState<string>("Alpha Editorial");

  useEffect(() => {
    if (entry.strain_id) {
      fetchStrain();
    }
    if (entry.author_id) {
      fetchAuthor();
    }
  }, [entry.strain_id, entry.author_id]);

  const fetchStrain = async () => {
    if (!entry.strain_id) return;
    const { data } = await supabase
      .from("strains")
      .select("*")
      .eq("id", entry.strain_id)
      .single();
    if (data) {
      setStrain(data);
    }
  };

  const fetchAuthor = async () => {
    if (!entry.author_id) return;
    const { data } = await supabase
      .from("users")
      .select("name")
      .eq("id", entry.author_id)
      .single();
    if (data) {
      setAuthorName(data.name || "Alpha Editorial");
    }
  };

  return (
    <>
      <Helmet>
        <title>{entry.title} | Alpha Community</title>
        <meta name="description" content={entry.excerpt || entry.content.substring(0, 155)} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Community
            </Button>
          </div>
        </header>

        <article className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Category & Strain badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {entry.category && (
                <Badge variant="outline" className={cn("text-sm", getCategoryColor(entry.category))}>
                  {entry.category}
                </Badge>
              )}
              {entry.strain_name && (
                <Badge variant="outline" className="text-sm bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1">
                  <Leaf className="w-3.5 h-3.5" />
                  {entry.strain_name}
                </Badge>
              )}
              {entry.consumption_method && (
                <Badge variant="outline" className="text-sm bg-blue-500/10 text-blue-400 border-blue-500/30 gap-1">
                  <Beaker className="w-3.5 h-3.5" />
                  {entry.consumption_method}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              {entry.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-secondary" />
                </div>
                <span>{authorName}</span>
              </div>
              {entry.created_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(entry.created_at), "MMMM d, yyyy")}</span>
                </div>
              )}
            </div>

            {/* Experience Rating */}
            {entry.experience_rating && (
              <div className="mb-6 p-4 bg-card/50 border border-border/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Experience Rating</p>
                {renderStars(entry.experience_rating)}
              </div>
            )}

            {/* Strain Details Card */}
            {strain && (
              <div className="mb-8 p-5 bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/20 rounded-xl">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{strain.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {strain.type && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {strain.type}
                        </Badge>
                      )}
                      {strain.thc_level && (
                        <span className="text-xs text-muted-foreground">
                          THC: {strain.thc_level}
                        </span>
                      )}
                      {strain.most_common_terpene && (
                        <span className="text-xs text-muted-foreground">
                          Terpene: {strain.most_common_terpene}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {strain.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {strain.description}
                  </p>
                )}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-invert prose-lg max-w-none mb-8">
              <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </div>
            </div>

            {/* Tags */}
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-border/50">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm px-3 py-1 bg-muted/50 text-muted-foreground rounded-full hover:bg-muted transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Interactions */}
            <div className="mb-10 p-5 bg-card/50 border border-border/50 rounded-xl">
              <p className="text-sm text-muted-foreground mb-3">What did you think?</p>
              <PostInteractions
                postId={entry.id}
                upvotes={entry.upvotes || 0}
                downvotes={entry.downvotes || 0}
                stars={entry.stars || 0}
              />
            </div>

            {/* Comments Section */}
            <div className="border-t border-border/50 pt-8">
              <PostCommentsSection postId={entry.id} />
            </div>
          </div>
        </article>
      </div>
    </>
  );
};

export default CommunityPostDetail;
