import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  Users, Search, Leaf, Sparkles, Settings, 
  ArrowUpDown, Star, Clock, Filter, X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import CommunityPostCard from "@/components/community/CommunityPostCard";
import CommunityPostDetail from "@/components/community/CommunityPostDetail";
import AdminDiaryManager from "@/components/community/AdminDiaryManager";

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
  author_id: string | null;
}

interface CommentCount {
  post_id: string;
  count: number;
}

type SortOption = "latest" | "most_starred" | "most_upvoted";

const categories = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "strains", label: "Strains", icon: Leaf },
  { id: "wellness", label: "Wellness", icon: Sparkles },
  { id: "culture", label: "Culture", icon: Users },
  { id: "review", label: "Reviews", icon: Star },
];

const Community = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [commentCounts, setCommentCounts] = useState<CommentCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [strainFilter, setStrainFilter] = useState<string>("");
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [showAdminManager, setShowAdminManager] = useState(false);

  // Get unique strain names from entries
  const strainNames = useMemo(() => {
    const names = entries
      .map(e => e.strain_name)
      .filter((name): name is string => !!name);
    return [...new Set(names)].sort();
  }, [entries]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/signup");
        return;
      }
      fetchEntries();
    };
    checkAuth();
  }, [navigate]);

  const fetchEntries = async () => {
    setLoading(true);
    
    // Fetch published entries
    const { data, error } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching entries:", error);
    } else {
      setEntries(data || []);
      
      // Fetch comment counts for all entries
      if (data && data.length > 0) {
        const postIds = data.map(e => e.id);
        const { data: comments } = await supabase
          .from("post_comments")
          .select("post_id")
          .in("post_id", postIds);
        
        if (comments) {
          const counts: CommentCount[] = [];
          const countMap = new Map<string, number>();
          comments.forEach(c => {
            if (c.post_id) {
              countMap.set(c.post_id, (countMap.get(c.post_id) || 0) + 1);
            }
          });
          countMap.forEach((count, post_id) => {
            counts.push({ post_id, count });
          });
          setCommentCounts(counts);
        }
      }
    }
    
    setLoading(false);
  };

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    let filtered = [...entries];

    // Category filter
    if (activeCategory !== "all") {
      filtered = filtered.filter((entry) => entry.category === activeCategory);
    }

    // Strain filter
    if (strainFilter) {
      filtered = filtered.filter((entry) => entry.strain_name === strainFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(query) ||
          entry.excerpt?.toLowerCase().includes(query) ||
          entry.content.toLowerCase().includes(query) ||
          entry.strain_name?.toLowerCase().includes(query) ||
          entry.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sorting
    switch (sortBy) {
      case "most_starred":
        filtered.sort((a, b) => (b.stars || 0) - (a.stars || 0));
        break;
      case "most_upvoted":
        filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
        break;
      case "latest":
      default:
        filtered.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
    }

    return filtered;
  }, [entries, activeCategory, strainFilter, searchQuery, sortBy]);

  const getCommentCount = (postId: string) => {
    return commentCounts.find(c => c.post_id === postId)?.count || 0;
  };

  const clearFilters = () => {
    setActiveCategory("all");
    setStrainFilter("");
    setSearchQuery("");
    setSortBy("latest");
  };

  const hasActiveFilters = activeCategory !== "all" || strainFilter || searchQuery || sortBy !== "latest";

  // Post Detail View
  if (selectedEntry) {
    return (
      <>
        <CommunityPostDetail
          entry={selectedEntry}
          onBack={() => setSelectedEntry(null)}
        />
        <BottomNav />
      </>
    );
  }

  // Admin Manager View
  if (showAdminManager) {
    return (
      <>
        <AdminDiaryManager onClose={() => {
          setShowAdminManager(false);
          fetchEntries();
        }} />
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Community | Alpha</title>
        <meta name="description" content="Explore the Alpha community - culture drops, strain reviews, and lifestyle stories." />
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">Community</h1>
                <p className="text-sm text-muted-foreground">Culture drops & curated stories</p>
              </div>
              {isAdmin && !adminLoading && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdminManager(true)}
                  className="gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Manage
                </Button>
              )}
            </div>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search posts, strains, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
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
                </Button>
              ))}
            </div>

            {/* Sort & Filter Row */}
            <div className="flex items-center gap-3 pt-1">
              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={(v: SortOption) => setSortBy(v)}>
                <SelectTrigger className="w-[160px] h-9 text-sm bg-card">
                  <ArrowUpDown className="w-3.5 h-3.5 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">
                    <span className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      Latest
                    </span>
                  </SelectItem>
                  <SelectItem value="most_starred">
                    <span className="flex items-center gap-2">
                      <Star className="w-3.5 h-3.5" />
                      Most Starred
                    </span>
                  </SelectItem>
                  <SelectItem value="most_upvoted">
                    <span className="flex items-center gap-2">
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      Most Upvoted
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Strain Filter */}
              {strainNames.length > 0 && (
                <Select value={strainFilter} onValueChange={setStrainFilter}>
                  <SelectTrigger className="w-[160px] h-9 text-sm bg-card">
                    <Leaf className="w-3.5 h-3.5 mr-2" />
                    <SelectValue placeholder="Filter by strain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Strains</SelectItem>
                    {strainNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs text-muted-foreground gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-card/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <Users className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No entries found</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {hasActiveFilters
                  ? "Try adjusting your search or filters"
                  : "The community is quiet... for now"}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Results count */}
              <p className="text-sm text-muted-foreground">
                {filteredEntries.length} {filteredEntries.length === 1 ? "post" : "posts"}
              </p>
              
              {/* Posts grid */}
              <div className="grid gap-4 md:grid-cols-2">
                {filteredEntries.map((entry) => (
                  <CommunityPostCard
                    key={entry.id}
                    entry={entry}
                    onClick={() => setSelectedEntry(entry)}
                    commentCount={getCommentCount(entry.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </>
  );
};

export default Community;
