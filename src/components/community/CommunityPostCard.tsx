import { ThumbsUp, ThumbsDown, Star, Calendar, Leaf, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
  published: boolean | null;
}

interface CommunityPostCardProps {
  entry: DiaryEntry;
  onClick: () => void;
  commentCount?: number;
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
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "w-3.5 h-3.5",
            star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
};

export const CommunityPostCard = ({ entry, onClick, commentCount = 0 }: CommunityPostCardProps) => {
  return (
    <article
      onClick={onClick}
      className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden hover:bg-card/80 hover:border-border transition-all cursor-pointer"
    >
      <div className="p-5">
        {/* Header with category and strain */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {entry.category && (
              <Badge variant="outline" className={cn("text-xs", getCategoryColor(entry.category))}>
                {entry.category}
              </Badge>
            )}
            {entry.strain_name && (
              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1">
                <Leaf className="w-3 h-3" />
                {entry.strain_name}
              </Badge>
            )}
          </div>
          {entry.experience_rating && renderStars(entry.experience_rating)}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground group-hover:text-secondary transition-colors mb-2 line-clamp-2">
          {entry.title}
        </h3>

        {/* Excerpt */}
        {entry.excerpt && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {entry.excerpt}
          </p>
        )}

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {entry.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-muted/50 text-muted-foreground rounded-full"
              >
                #{tag}
              </span>
            ))}
            {entry.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{entry.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer with stats */}
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <div className="flex items-center gap-4">
            {/* Upvotes */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{entry.upvotes || 0}</span>
            </div>
            {/* Downvotes */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>{entry.downvotes || 0}</span>
            </div>
            {/* Stars */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Star className="w-3.5 h-3.5" />
              <span>{entry.stars || 0}</span>
            </div>
            {/* Comments */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{commentCount}</span>
            </div>
          </div>

          {/* Date */}
          {entry.created_at && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{format(new Date(entry.created_at), "MMM d, yyyy")}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default CommunityPostCard;
