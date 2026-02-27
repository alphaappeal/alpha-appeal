import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, Leaf, Palette, Car, Shirt, Heart, Trash2, Edit, Plus } from "lucide-react";
import StrainsTab from "./StrainsTab";

interface CultureItem {
  id: string;
  name: string;
  category: string;
  creator: string | null;
  description: string | null;
  img_url: string | null;
  type: string | null;
  year: string | null;
  upvotes: number;
  stars: number;
  published: boolean;
  created_at: string;
}

const categoryConfig: Record<string, { icon: typeof Leaf; label: string }> = {
  fashion: { icon: Shirt, label: "Fashion" },
  wellness: { icon: Heart, label: "Wellness" },
  artwork: { icon: Palette, label: "Artwork" },
  cars: { icon: Car, label: "Cars" },
};

const CultureTab = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<CultureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("strains");

  useEffect(() => {
    if (activeCategory !== "strains") {
      fetchCultureItems();
    }
  }, [activeCategory]);

  const fetchCultureItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("culture_items")
      .select("*")
      .eq("category", activeCategory)
      .order("name");

    if (error) {
      console.error("Error fetching culture items:", error);
    }
    setItems((data as CultureItem[]) || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("culture_items").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted" });
      fetchCultureItems();
    }
  };

  const togglePublished = async (id: string, current: boolean) => {
    const { error } = await supabase.from("culture_items").update({ published: !current }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      fetchCultureItems();
    }
  };

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.creator?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (cat: string) => {
    const Icon = categoryConfig[cat]?.icon || Leaf;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="bg-card/50 border border-border/50 p-1 h-auto flex-wrap">
          <TabsTrigger value="strains" className="gap-2">
            <Leaf className="w-4 h-4" /> Strains
          </TabsTrigger>
          {Object.entries(categoryConfig).map(([key, { icon: Icon, label }]) => (
            <TabsTrigger key={key} value={key} className="gap-2">
              <Icon className="w-4 h-4" /> {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="strains">
          <StrainsTab />
        </TabsContent>

        {Object.keys(categoryConfig).map((cat) => (
          <TabsContent key={cat} value={cat}>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${categoryConfig[cat].label}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Badge variant="secondary">{filtered.length} items</Badge>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-xl border border-border/50 p-4 space-y-3">
                      <Skeleton className="h-32 w-full rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-border/50">
                  {getCategoryIcon(cat)}
                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
                    No {categoryConfig[cat].label} items found
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Import items via the Culture Data import page.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((item) => (
                    <div
                      key={item.id}
                      className="bg-card/50 border border-border/50 rounded-xl overflow-hidden"
                    >
                      {item.img_url && (
                        <div className="h-32 overflow-hidden">
                          <img
                            src={item.img_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-foreground text-sm line-clamp-1">
                            {item.name}
                          </h3>
                          <Badge
                            variant={item.published ? "default" : "secondary"}
                            className="text-[10px] shrink-0 ml-2"
                          >
                            {item.published ? "Live" : "Draft"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {item.creator || "Unknown"} {item.year ? `· ${item.year}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {item.description || "No description"}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span>⬆ {item.upvotes ?? 0}</span>
                          <span>⭐ {item.stars ?? 0}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => togglePublished(item.id, item.published)}
                          >
                            {item.published ? "Unpublish" : "Publish"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CultureTab;
