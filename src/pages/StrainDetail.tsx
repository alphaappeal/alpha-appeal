import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Calendar, Tag, ArrowLeft, Leaf, Loader2, Droplets } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import PostInteractions from "@/components/PostInteractions";
import { ThreadedComments } from "@/components/ThreadedComments";

interface Strain {
  id: string;
  name: string;
  slug: string | null;
  type: string | null;
  thc_level: string | null;
  most_common_terpene: string | null;
  description: string | null;
  img_url: string | null;
  effects: Record<string, string> | null;
  upvotes: number | null;
  downvotes: number | null;
  stars: number | null;
  created_at: string | null;
}

const StrainDetail = () => {
  const { strainSlug } = useParams();
  const navigate = useNavigate();
  const [strain, setStrain] = useState<Strain | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStrain();
  }, [strainSlug]);

  const fetchStrain = async () => {
    setLoading(true);
    // Try slug first, then id
    let query = supabase.from("strains").select("*");
    
    if (strainSlug?.match(/^[0-9a-f]{8}-/)) {
      query = query.eq("id", strainSlug);
    } else {
      query = query.eq("slug", strainSlug);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      console.error("Strain not found:", error);
    } else {
      setStrain(data as Strain);
    }
    setLoading(false);
  };

  const getTypeColor = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case "indica": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "sativa": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "hybrid": return "bg-secondary/20 text-secondary border-secondary/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const categorizeEffects = (effects: Record<string, string> | null) => {
    if (!effects) return { positive: [], negative: [], medical: [] };
    
    const negativeKeys = ["dry_mouth", "dry_eyes", "dizzy", "paranoid", "anxious"];
    const medicalKeys = ["stress", "pain", "depression", "anxiety", "insomnia", "fatigue", "headaches", "nausea", "lack_of_appetite"];
    
    const positive: [string, string][] = [];
    const negative: [string, string][] = [];
    const medical: [string, string][] = [];

    Object.entries(effects).forEach(([key, value]) => {
      const label = key.replace(/_/g, " ");
      if (negativeKeys.includes(key)) negative.push([label, value]);
      else if (medicalKeys.includes(key)) medical.push([label, value]);
      else positive.push([label, value]);
    });

    return { positive, negative, medical };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!strain) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-12 text-center">
          <Leaf className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold text-foreground mb-2">Strain not found</h2>
          <Button variant="outline" onClick={() => navigate("/community")}>
            Back to Community
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const { positive, negative, medical } = categorizeEffects(strain.effects);

  return (
    <>
      <Helmet>
        <title>{strain.name} | Alpha Community</title>
        <meta name="description" content={strain.description?.substring(0, 160) || `Learn about ${strain.name}`} />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/community")}
              className="gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Community
            </Button>
          </div>
        </header>

        <article className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {strain.type && (
                <Badge variant="outline" className={cn(getTypeColor(strain.type))}>
                  {strain.type}
                </Badge>
              )}
              {strain.thc_level && (
                <Badge variant="outline" className="border-border text-muted-foreground">
                  THC {strain.thc_level}
                </Badge>
              )}
              {strain.most_common_terpene && (
                <Badge variant="outline" className="border-border text-muted-foreground">
                  <Droplets className="w-3 h-3 mr-1" />
                  {strain.most_common_terpene}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              {strain.name}
            </h1>

            {strain.created_at && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(strain.created_at), "MMMM d, yyyy")}</span>
              </div>
            )}

            {/* Image */}
            {strain.img_url && (
              <div className="rounded-xl overflow-hidden mb-6 bg-card border border-border">
                <img
                  src={strain.img_url}
                  alt={strain.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}

            {/* Description */}
            {strain.description && (
              <div className="text-foreground/90 leading-relaxed mb-8">
                {strain.description}
              </div>
            )}

            {/* Effects */}
            {positive.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">Effects</h3>
                <div className="space-y-2">
                  {positive.map(([label, value]) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-sm text-foreground capitalize w-24">{label}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-secondary rounded-full transition-all"
                          style={{ width: value }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {medical.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">May help with</h3>
                <div className="space-y-2">
                  {medical.map(([label, value]) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-sm text-foreground capitalize w-24">{label}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500/60 rounded-full transition-all"
                          style={{ width: value }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {negative.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">Possible negatives</h3>
                <div className="flex flex-wrap gap-2">
                  {negative.map(([label, value]) => (
                    <Badge key={label} variant="outline" className="text-xs border-destructive/30 text-destructive/70 capitalize">
                      {label} {value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Interactions */}
            <div className="py-4 border-t border-b border-border mb-6">
              <PostInteractions
                strainId={strain.id}
                upvotes={strain.upvotes || 0}
                downvotes={strain.downvotes || 0}
                stars={strain.stars || 0}
              />
            </div>

            {/* Tags */}
            {strain.effects && Object.keys(strain.effects).length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {Object.keys(strain.effects)
                    .filter(k => !["dry_mouth", "dry_eyes", "dizzy", "paranoid", "anxious"].includes(k))
                    .slice(0, 6)
                    .map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs capitalize">
                        {tag.replace(/_/g, " ")}
                      </Badge>
                    ))}
                </div>
              </div>
            )}

            {/* Threaded Comments */}
            <ThreadedComments strainId={strain.id} />
          </div>
        </article>

        <BottomNav />
      </div>
    </>
  );
};

export default StrainDetail;
