import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Users, Search, ChevronRight, Leaf, Sparkles, Loader2, Shirt, Heart, Palette, Car } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CommunityItem {
  id: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  tags: string[] | null;
  created_at: string | null;
  type?: string | null;
  source: "diary" | "strain" | "culture";
  slug?: string | null;
  thc_level?: string | null;
  strain_name?: string | null;
  creator?: string | null;
  img_url?: string | null;
  _weight?: number;
}

const PAGE_SIZE = 30;

const categories = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "strains", label: "Strains", icon: Leaf },
  { id: "fashion", label: "Fashion", icon: Shirt },
  { id: "wellness", label: "Wellness", icon: Heart },
  { id: "artwork", label: "Artwork", icon: Palette },
  { id: "cars", label: "Cars", icon: Car },
  { id: "culture", label: "Culture", icon: Users },
];

const CULTURE_CATEGORIES = ["fashion", "wellness", "artwork", "cars"];

const Community = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CommunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState<Record<string, number>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  // Reset on filter/search change
  useEffect(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
  }, [activeCategory, searchQuery]);

  // Fetch data
  useEffect(() => {
    fetchItems(page);
  }, [page, activeCategory, searchQuery]);

  // Fetch counts once
  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    const [strainRes, cultureRes, ...cultureCountRes] = await Promise.all([
      supabase.from("strains").select("id", { count: "exact", head: true }).eq("published", true),
      supabase.from("diary_entries").select("id", { count: "exact", head: true }).eq("published", true).eq("category", "culture"),
      ...CULTURE_CATEGORIES.map(cat =>
        supabase.from("culture_items").select("id", { count: "exact", head: true }).eq("published", true).eq("category", cat)
      ),
    ]);

    const counts: Record<string, number> = {
      strains: strainRes.count || 0,
      culture: cultureRes.count || 0,
    };
    CULTURE_CATEGORIES.forEach((cat, i) => {
      counts[cat] = cultureCountRes[i]?.count || 0;
    });
    setTotalCount(counts);
  };

  const fetchItems = async (pageNum: number) => {
    if (pageNum === 0) { setLoading(true); setFetchError(null); }
    else setLoadingMore(true);

    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const query = searchQuery.toLowerCase();

    try {
      const results: CommunityItem[] = [];

      // Strains tab — prioritize name matches, then type, then description
      if (activeCategory === "all" || activeCategory === "strains") {
        let strainQuery = supabase
          .from("strains")
          .select("id, name, slug, type, thc_level, description, effects, created_at, most_common_terpene")
          .eq("published", true);

        if (query) {
          strainQuery = strainQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,type.ilike.%${query}%,most_common_terpene.ilike.%${query}%`);
        }
        strainQuery = strainQuery.order("name", { ascending: true }).range(from, to);

        const { data: strains } = await strainQuery;
        if (strains) {
          for (const s of strains) {
            const effects = s.effects as Record<string, string> | null;
            const effectTags = effects ? Object.keys(effects).filter(k =>
              !["dry_mouth", "dry_eyes", "dizzy", "paranoid", "anxious"].includes(k)
            ).slice(0, 4) : [];

            // Compute relevance weight: name match > type match > description match
            let _weight = 0;
            if (query) {
              const q = query;
              if (s.name?.toLowerCase().includes(q)) _weight += 100;
              if (s.type?.toLowerCase().includes(q)) _weight += 50;
              if (s.description?.toLowerCase().includes(q)) _weight += 10;
            }

            results.push({
              id: s.id,
              title: s.name,
              excerpt: s.description ? s.description.substring(0, 150) + (s.description.length > 150 ? "..." : "") : null,
              category: "strains",
              tags: effectTags,
              created_at: s.created_at,
              type: s.type,
              source: "strain",
              slug: s.slug,
              thc_level: s.thc_level,
              _weight,
            });
          }
        }
      }

      // Culture items (fashion, wellness, artwork, cars) — prioritize name/category matches
      if (activeCategory === "all" || CULTURE_CATEGORIES.includes(activeCategory)) {
        let cultureQuery = supabase
          .from("culture_items")
          .select("id, name, slug, category, type, img_url, description, creator, year, created_at, upvotes, feelings")
          .eq("published", true);

        if (CULTURE_CATEGORIES.includes(activeCategory)) {
          cultureQuery = cultureQuery.eq("category", activeCategory);
        }

        if (query) {
          cultureQuery = cultureQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,type.ilike.%${query}%,category.ilike.%${query}%,creator.ilike.%${query}%`);
        }
        cultureQuery = cultureQuery.order("name", { ascending: true }).range(from, to);

        const { data: cultureItems } = await cultureQuery;
        if (cultureItems) {
          for (const c of cultureItems) {
            const feelings = c.feelings as Record<string, string> | null;
            const topFeelings = feelings
              ? Object.entries(feelings)
                  .filter(([, v]) => parseInt(v) >= 70)
                  .sort(([, a], [, b]) => parseInt(b) - parseInt(a))
                  .slice(0, 3)
                  .map(([k]) => k.replace(/_/g, " "))
              : [];

            let _weight = 0;
            if (query) {
              const q = query;
              if (c.name?.toLowerCase().includes(q)) _weight += 100;
              if (c.category?.toLowerCase().includes(q)) _weight += 50;
              if (c.type?.toLowerCase().includes(q)) _weight += 30;
              if (c.creator?.toLowerCase().includes(q)) _weight += 20;
              if (c.description?.toLowerCase().includes(q)) _weight += 10;
            }

            results.push({
              id: c.id,
              title: c.name,
              excerpt: c.description ? c.description.substring(0, 150) + (c.description.length > 150 ? "..." : "") : null,
              category: c.category,
              tags: topFeelings,
              created_at: c.created_at,
              type: c.type,
              source: "culture",
              slug: c.slug,
              creator: c.creator,
              img_url: c.img_url,
              _weight,
            });
          }
        }
      }

      // Diary entries (culture category)
      if (activeCategory === "all" || activeCategory === "culture") {
        let diaryQuery = supabase
          .from("diary_entries")
          .select("id, title, excerpt, content, category, tags, created_at, strain_name")
          .eq("published", true)
          .order("created_at", { ascending: false });

        if (activeCategory === "culture") {
          diaryQuery = diaryQuery.eq("category", "culture");
        } else if (activeCategory === "all") {
          diaryQuery = diaryQuery.in("category", ["wellness", "culture"]);
        }

        if (query) {
          diaryQuery = diaryQuery.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%,strain_name.ilike.%${query}%`);
        }
        diaryQuery = diaryQuery.range(from, to);

        const { data: entries } = await diaryQuery;
        if (entries) {
          for (const e of entries) {
            let _weight = 0;
            if (query) {
              const q = query;
              if (e.title?.toLowerCase().includes(q)) _weight += 100;
              if (e.tags?.some((t: string) => t.toLowerCase().includes(q))) _weight += 60;
              if (e.strain_name?.toLowerCase().includes(q)) _weight += 40;
              if (e.excerpt?.toLowerCase().includes(q)) _weight += 10;
            }

            results.push({
              id: e.id,
              title: e.title,
              excerpt: e.excerpt,
              category: e.category,
              tags: e.tags,
              created_at: e.created_at,
              source: "diary",
              strain_name: e.strain_name,
              _weight,
            });
          }
        }
      }

      // Sort by relevance weight when searching, otherwise keep default order
      if (query) {
        results.sort((a: any, b: any) => (b._weight || 0) - (a._weight || 0));
      }

      // Strip internal weight before setting state
      const cleaned = results.map(({ _weight, ...rest }: any) => rest);

      if (pageNum === 0) setItems(cleaned);
      else setItems(prev => [...prev, ...cleaned]);
      setHasMore(results.length >= PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching community items:", error);
      if (pageNum === 0) setFetchError("Unable to load community content. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Infinite scroll observer
  const lastItemRef = useCallback((node: HTMLElement | null) => {
    if (loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loadingMore, hasMore]);

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case "strains": return "bg-secondary/20 text-secondary border-secondary/30";
      case "wellness": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "culture": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "fashion": return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      case "artwork": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "cars": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTypeColor = (type: string | null | undefined) => {
    switch (type?.toLowerCase()) {
      case "indica": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "sativa": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "hybrid": return "bg-secondary/20 text-secondary border-secondary/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleItemClick = (item: CommunityItem) => {
    if (item.source === "strain") {
      navigate(`/strain/${item.slug || item.id}`);
    } else if (item.source === "culture") {
      navigate(`/culture/${item.slug || item.id}`);
    } else {
      navigate(`/community/${item.id}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>Community | Alpha</title>
        <meta name="description" content="Explore the Alpha community knowledge hub - strains, fashion, wellness, artwork, cars, and culture." />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-display font-bold text-foreground mb-4">Community</h1>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search strains, fashion, wellness, art, cars..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "whitespace-nowrap flex items-center gap-2",
                    activeCategory === cat.id && "bg-secondary text-secondary-foreground"
                  )}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                  {cat.id !== "all" && totalCount[cat.id] !== undefined && (
                    <span className="text-xs opacity-70">
                      ({totalCount[cat.id] > 999 ? `${(totalCount[cat.id] / 1000).toFixed(1)}k` : totalCount[cat.id]})
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-28 bg-card/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : fetchError ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-destructive opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">Something went wrong</h3>
              <p className="text-muted-foreground text-sm mb-4">{fetchError}</p>
              <Button variant="outline" onClick={() => { setPage(0); fetchItems(0); }}>Try Again</Button>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No entries found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <button
                  key={`${item.source}-${item.id}`}
                  ref={index === items.length - 1 ? lastItemRef : undefined}
                  onClick={() => handleItemClick(item)}
                  className="w-full text-left bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:bg-card/80 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    {item.source === "culture" && item.img_url && (
                      <img
                        src={item.img_url}
                        alt={item.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        loading="lazy"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {item.source === "strain" && item.type && (
                          <Badge variant="outline" className={cn("text-xs", getTypeColor(item.type))}>
                            {item.type}
                          </Badge>
                        )}
                        {item.category && (
                          <Badge variant="outline" className={cn("text-xs", getCategoryColor(item.category))}>
                            {item.category}
                          </Badge>
                        )}
                        {item.source === "strain" && item.thc_level && (
                          <span className="text-xs text-muted-foreground">THC {item.thc_level}</span>
                        )}
                        {item.source === "culture" && item.creator && (
                          <span className="text-xs text-muted-foreground">{item.creator}</span>
                        )}
                      </div>
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-foreground group-hover:text-secondary transition-colors truncate">
                          {item.title}
                        </h3>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors flex-shrink-0 ml-2" />
                      </div>

                      {item.excerpt && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.excerpt}</p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        {item.created_at && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(item.created_at), "MMM d, yyyy")}
                          </span>
                        )}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap justify-end">
                            {item.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs capitalize">
                                {tag}
                              </Badge>
                            ))}
                            {item.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{item.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              {loadingMore && (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-secondary" />
                </div>
              )}

              {!hasMore && items.length > 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">You've reached the end</p>
              )}
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </>
  );
};

export default Community;
