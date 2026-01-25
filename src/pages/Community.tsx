import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Users, Search, Tag, Calendar, ChevronRight, Leaf, Sparkles } from "lucide-react";
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

// Demo entries for when database is empty
const demoEntries: DiaryEntry[] = [
  {
    id: "demo-1",
    title: "Blue Dream: The Daytime Classic",
    excerpt: "A legendary sativa-dominant hybrid that delivers swift euphoria and full-body relaxation.",
    content: `Blue Dream remains one of the most popular strains for good reason. This sativa-dominant hybrid originated in California and has since become a staple for both novice and veteran consumers.

**Effects:** The high begins with a cerebral rush, bringing motivation and focus. As it progresses, a calming body sensation takes over without heavy sedation.

**Flavor Profile:** Sweet berry aroma reminiscent of blueberries, with earthy and herbal undertones.

**Best For:** Daytime use, creative activities, social situations, mild pain relief.

**THC Content:** Typically 17-24%

This strain is perfect for those seeking relief from depression, chronic pain, and nausea while remaining functional throughout the day.`,
    category: "strains",
    tags: ["sativa", "daytime", "creative", "california"],
    created_at: new Date().toISOString()
  },
  {
    id: "demo-2",
    title: "Morning Wellness Ritual",
    excerpt: "How to start your day with intention and botanical balance.",
    content: `A mindful morning sets the tone for the entire day. Here's how to create a wellness ritual that centers your mind and energizes your body.

**5:30 AM - Wake with Purpose**
Skip the snooze button. Set an intention for the day before your feet hit the floor.

**6:00 AM - Hydration First**
Warm water with lemon to activate your digestive system and flush toxins.

**6:30 AM - Movement**
15-30 minutes of yoga, stretching, or light exercise. Focus on breath work.

**7:00 AM - Botanical Support**
If part of your routine, this is an ideal time for a low-dose, sativa-dominant strain to enhance focus without drowsiness.

**7:30 AM - Nourish**
A nutrient-rich breakfast. Avoid processed sugars that lead to crashes.

Consistency is key. Start with one element and build gradually.`,
    category: "wellness",
    tags: ["morning", "ritual", "mindfulness", "health"],
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "demo-3",
    title: "The Rise of SA Cannabis Culture",
    excerpt: "Exploring the evolving landscape of cannabis culture in South Africa.",
    content: `South Africa's relationship with cannabis is undergoing a remarkable transformation. Since the Constitutional Court ruling in 2018, a vibrant culture has emerged.

**The Private Club Scene**
Members-only clubs have become the new social spaces, offering curated experiences, education, and community. These establishments prioritize quality, safety, and sophistication.

**Craft Cannabis Movement**
Local cultivators are developing unique strains adapted to South African terroir. Names like "Durban Poison" have global recognition, but new genetics are constantly emerging.

**The Fashion Connection**
Streetwear brands are embracing cannabis culture with subtle, sophisticated designs. It's no longer about loud statements but refined aesthetics.

**Looking Ahead**
As regulations evolve, expect to see more integration with wellness, hospitality, and lifestyle sectors. The future is premium, curated, and conscious.`,
    category: "culture",
    tags: ["south africa", "culture", "community", "lifestyle"],
    created_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: "demo-4",
    title: "OG Kush: The Legend",
    excerpt: "Understanding why OG Kush remains the backbone of countless modern strains.",
    content: `OG Kush needs no introduction. This iconic strain has shaped modern cannabis culture more than perhaps any other.

**Origins:** While debated, OG Kush is believed to have originated in Florida in the early 90s before making its way to Los Angeles.

**Effects:** A balanced hybrid that delivers both cerebral euphoria and physical relaxation. Expect stress relief, mood elevation, and a sense of calm focus.

**Flavor Profile:** Complex. Fuel, skunk, and spice with earthy, pine undertones. The aroma is unmistakable.

**Lineage Impact:** OG Kush has parented countless popular strains including GSC, Headband, and Bubba Kush.

**THC Content:** 19-26%

**Best For:** Evening relaxation, social settings, stress relief, appetite stimulation.

A true classic that continues to define quality cannabis.`,
    category: "strains",
    tags: ["indica", "classic", "evening", "legendary"],
    created_at: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: "demo-5",
    title: "Sleep Optimization with Botanicals",
    excerpt: "Natural approaches to improving sleep quality and duration.",
    content: `Quality sleep is the foundation of wellness. Here's how to optimize your rest using botanical support.

**The 10-3-2-1-0 Rule**
- 10 hours before bed: No more caffeine
- 3 hours before bed: No more food or alcohol
- 2 hours before bed: No more work
- 1 hour before bed: No more screens
- 0 times hitting snooze

**Botanical Support**
Indica-dominant strains with high myrcene content can promote relaxation. Look for strains with:
- Linalool (lavender-like, calming)
- Myrcene (sedating, musky)
- Caryophyllene (stress-relieving)

**Timing Matters**
Consume 1-2 hours before desired sleep time. Start with low doses and adjust.

**Environment**
Dark room, cool temperature (65-68°F), white noise if needed.

**Consistency**
Same bedtime, same wake time, even on weekends.`,
    category: "wellness",
    tags: ["sleep", "indica", "relaxation", "health"],
    created_at: new Date(Date.now() - 345600000).toISOString()
  }
];

const categories = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "strains", label: "Strains", icon: Leaf },
  { id: "wellness", label: "Wellness", icon: Sparkles },
  { id: "culture", label: "Culture", icon: Users },
];

const Community = () => {
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

    if (!error && data && data.length > 0) {
      setEntries(data);
      setFilteredEntries(data);
    } else {
      // Use demo entries if database is empty
      setEntries(demoEntries);
      setFilteredEntries(demoEntries);
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
      case "strains":
        return "bg-secondary/20 text-secondary border-secondary/30";
      case "wellness":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "culture":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (selectedEntry) {
    return (
      <>
        <Helmet>
          <title>{selectedEntry.title} | Alpha Community</title>
        </Helmet>

        <div className="min-h-screen bg-background pb-20">
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
            <div className="container mx-auto px-4 py-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEntry(null)}
                className="mb-2"
              >
                ← Back to Community
              </Button>
            </div>
          </header>

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
                <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {selectedEntry.content}
                </div>
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
        <title>Community | Alpha</title>
        <meta name="description" content="Explore the Alpha community knowledge hub - strains, wellness, and culture." />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-display font-bold text-foreground mb-4">Community</h1>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                </Button>
              ))}
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-card/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No entries found</h3>
              <p className="text-muted-foreground text-sm">
                Try adjusting your search or filters
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

export default Community;
