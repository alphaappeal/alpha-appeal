import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
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
    title: "The Art of Mindful Consumption",
    excerpt: "Exploring the intersection of cannabis culture and intentional living.",
    content: "Full content here...",
    category: "culture",
    tags: ["mindfulness", "lifestyle", "wellness"],
    created_at: new Date().toISOString()
  },
  {
    id: "demo-2",
    title: "Curating Your Cannabis Experience",
    excerpt: "A guide to selecting products that align with your lifestyle and values.",
    content: "Full content here...",
    category: "education",
    tags: ["guide", "products", "selection"],
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "demo-3",
    title: "Community Spotlight: Local Artisans",
    excerpt: "Meet the craftspeople behind our premium accessories.",
    content: "Full content here...",
    category: "community",
    tags: ["artisans", "local", "craftsmanship"],
    created_at: new Date(Date.now() - 172800000).toISOString()
  }
];

const Community = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: "all", name: "All", icon: "grid_view" },
    { id: "culture", name: "Culture", icon: "palette" },
    { id: "education", name: "Education", icon: "school" },
    { id: "wellness", name: "Wellness", icon: "spa" },
    { id: "community", name: "Community", icon: "groups" }
  ];

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("diary_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setEntries(data);
      } else {
        setEntries(demoEntries);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
      setEntries(demoEntries);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Helmet>
        <title>Journal | Alpha Appeal</title>
        <meta name="description" content="Insights, stories, and education from the Alpha Appeal community" />
      </Helmet>

      <div className="min-h-screen bg-background-dark">
        {/* Hero Section */}
        <div className="bg-surface-dark border-b border-white/10 py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl">
              <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-4">
                The Journal
              </h1>
              <p className="text-gray-400 text-lg">
                Insights, stories, and education from our community of mindful enthusiasts
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12">
          {/* Filters */}
          <div className="mb-12">
            {/* Search */}
            <div className="max-w-xl mb-8">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  search
                </span>
                <Input
                  type="search"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-surface-dark border-border-dark h-12 text-white"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id === "all" ? null : category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${(selectedCategory === category.id || (!selectedCategory && category.id === "all"))
                      ? "bg-primary border-primary text-white"
                      : "bg-transparent border-border-dark text-gray-400 hover:border-primary hover:text-primary"
                    }`}
                >
                  <span className="material-symbols-outlined text-sm">{category.icon}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-gray-600 text-6xl mb-4 block">article</span>
              <p className="text-gray-400">No articles found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEntries.map((entry) => (
                <article
                  key={entry.id}
                  onClick={() => navigate(`/community/${entry.id}`)}
                  className="card-dark card-hover cursor-pointer group"
                >
                  {/* Category Badge */}
                  {entry.category && (
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs uppercase tracking-wider">
                        {entry.category}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="font-display text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                    {entry.title}
                  </h2>

                  {/* Excerpt */}
                  {entry.excerpt && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {entry.excerpt}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      {entry.created_at && format(new Date(entry.created_at), "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-1 text-primary text-sm group-hover:translate-x-1 transition-transform">
                      Read more
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {entry.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Community;
