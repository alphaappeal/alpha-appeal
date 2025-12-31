import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BookOpen, Search, Tag, Calendar, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  created_at: string | null;
}

const categories = [
  { id: "all", label: "All" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "wellness", label: "Wellness" },
  { id: "culture", label: "Culture" },
  { id: "reviews", label: "Reviews" },
];

const Diary = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);

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
    const { data, error } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setEntries(data);
      setFilteredEntries(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    let filtered = entries;
    
    if (activeCategory !== "all") {
      filtered = filtered.filter((entry) => entry.category === activeCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(query) ||
          entry.excerpt?.toLowerCase().includes(query) ||
          entry.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredEntries(filtered);
  }, [activeCategory, searchQuery, entries]);

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case "lifestyle":
        return "bg-secondary/20 text-secondary border-secondary/30";
      case "wellness":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "culture":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "reviews":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (selectedEntry) {
    return (
      <>
        <Helmet>
          <title>{selectedEntry.title} | Alpha Diary</title>
        </Helmet>

        <div className="min-h-screen bg-background pb-20">
          {/* Article Header */}
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
            <div className="container mx-auto px-4 py-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEntry(null)}
                className="mb-2"
              >
                ← Back to Diary
              </Button>
            </div>
          </header>

          {/* Article Content */}
          <article className="container mx-auto px-4 py-6">
            <div className="max-w-2xl mx-auto">
              {selectedEntry.category && (
                <Badge variant="outline" className={cn("mb-4", getCategoryColor(selectedEntry.category))}>
                  {selectedEntry.category}
                </Badge>
              )}
              
              <h1 className="text-3xl font-display font-bold text-foreground mb-4">
                {selectedEntry.title}
              </h1>
              
              {selectedEntry.created_at && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(selectedEntry.created_at), "MMMM d, yyyy")}</span>
                </div>
              )}
              
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {selectedEntry.content}
                </p>
              </div>
              
              {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    {selectedEntry.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>

          <BottomNav />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Diary | Alpha</title>
        <meta name="description" content="Explore the Alpha community knowledge hub - lifestyle, wellness, culture and reviews." />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-display font-bold text-foreground mb-4">Diary</h1>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "whitespace-nowrap",
                    activeCategory === cat.id && "bg-secondary text-secondary-foreground"
                  )}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </header>

        {/* Entries List */}
        <main className="container mx-auto px-4 py-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-card/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No entries found</h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Community entries will appear here soon"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className="w-full text-left bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:bg-card/80 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      {entry.category && (
                        <Badge variant="outline" className={cn("mb-2", getCategoryColor(entry.category))}>
                          {entry.category}
                        </Badge>
                      )}
                      <h3 className="font-medium text-foreground group-hover:text-secondary transition-colors">
                        {entry.title}
                      </h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors" />
                  </div>
                  
                  {entry.excerpt && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {entry.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    {entry.created_at && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.created_at), "MMM d, yyyy")}
                      </span>
                    )}
                    
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex gap-1">
                        {entry.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {entry.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{entry.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </>
  );
};

export default Diary;
