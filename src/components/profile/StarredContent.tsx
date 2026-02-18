import { useNavigate } from "react-router-dom";
import { Star, Leaf, Palette, Globe, ChevronRight } from "lucide-react";

interface StarredContentProps {
  starredStrains: any[];
  starredArt: any[];
  starredCulture: any[];
}

const StarredContent = ({ starredStrains, starredArt, starredCulture }: StarredContentProps) => {
  const navigate = useNavigate();

  if (starredStrains.length === 0 && starredArt.length === 0 && starredCulture.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-8">
      {/* Starred Strains */}
      {starredStrains.length > 0 && (
        <div className="p-5 rounded-2xl border border-border/50 bg-card/30">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-yellow-400" />
            <h3 className="font-display font-semibold text-foreground text-sm">Starred Strains</h3>
            <span className="text-xs text-muted-foreground">({starredStrains.length})</span>
          </div>
          <div className="space-y-1.5">
            {starredStrains.map((strain) => (
              <button
                key={strain.id}
                onClick={() => navigate(`/strain/${strain.slug || strain.id}`)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border/30 bg-card/20 hover:border-secondary/50 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Leaf className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-foreground font-medium text-sm">{strain.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground capitalize">{strain.type || "—"}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Starred Art */}
      {starredArt.length > 0 && (
        <div className="p-5 rounded-2xl border border-border/50 bg-card/30">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-purple-400" />
            <h3 className="font-display font-semibold text-foreground text-sm">Starred Art</h3>
            <span className="text-xs text-muted-foreground">({starredArt.length})</span>
          </div>
          <div className="space-y-1.5">
            {starredArt.map((art) => (
              <div
                key={art.id}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border/30 bg-card/20"
              >
                <div className="flex items-center gap-2.5">
                  <Palette className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-foreground font-medium text-sm">{art.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">{art.artist_name || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Starred Culture */}
      {starredCulture.length > 0 && (
        <div className="p-5 rounded-2xl border border-border/50 bg-card/30">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-blue-400" />
            <h3 className="font-display font-semibold text-foreground text-sm">Starred Culture</h3>
            <span className="text-xs text-muted-foreground">({starredCulture.length})</span>
          </div>
          <div className="space-y-1.5">
            {starredCulture.map((post) => (
              <div
                key={post.id}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border/30 bg-card/20"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-foreground font-medium text-sm">{post.title}</span>
                </div>
                <span className="text-xs text-muted-foreground capitalize">{post.category || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StarredContent;
