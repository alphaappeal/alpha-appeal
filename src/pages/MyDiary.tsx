import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Plus, BookOpen, Star, Trash2, Edit2, Loader2, X, Clock, Filter, Pin, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import logoLight from "@/assets/alpha-logo-light.png";

interface DiaryEntry {
  id: string;
  user_id: string;
  entry_date: string;
  strain_name: string | null;
  experience_notes: string | null;
  rating: number | null;
  created_at: string;
}

type FilterType = "all" | "recent" | "favorites" | "archived";

const MyDiary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [formData, setFormData] = useState({
    strain_name: "",
    experience_notes: "",
    rating: 5,
    entry_date: new Date().toISOString().split("T")[0],
  });

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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("personal_diary_entries")
      .select("*")
      .eq("user_id", session.user.id)
      .order("entry_date", { ascending: false });

    if (!error && data) {
      setEntries(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (editingEntry) {
      const { error } = await supabase
        .from("personal_diary_entries")
        .update({
          strain_name: formData.strain_name,
          experience_notes: formData.experience_notes,
          rating: formData.rating,
          entry_date: formData.entry_date,
        })
        .eq("id", editingEntry.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update entry", variant: "destructive" });
      } else {
        toast({ title: "Entry updated" });
        fetchEntries();
      }
    } else {
      const { error } = await supabase
        .from("personal_diary_entries")
        .insert({
          user_id: session.user.id,
          strain_name: formData.strain_name,
          experience_notes: formData.experience_notes,
          rating: formData.rating,
          entry_date: formData.entry_date,
        });

      if (error) {
        toast({ title: "Error", description: "Failed to create entry", variant: "destructive" });
      } else {
        toast({ title: "Entry created" });
        fetchEntries();
      }
    }

    setShowForm(false);
    setEditingEntry(null);
    setFormData({ strain_name: "", experience_notes: "", rating: 5, entry_date: new Date().toISOString().split("T")[0] });
  };

  const handleEdit = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setFormData({
      strain_name: entry.strain_name || "",
      experience_notes: entry.experience_notes || "",
      rating: entry.rating || 5,
      entry_date: entry.entry_date,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("personal_diary_entries")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete entry", variant: "destructive" });
    } else {
      toast({ title: "Entry deleted" });
      fetchEntries();
    }
  };

  const filteredEntries = entries.filter((entry) => {
    if (activeFilter === "favorites") return entry.rating && entry.rating >= 4;
    if (activeFilter === "recent") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(entry.entry_date) >= weekAgo;
    }
    return true;
  });

  const featuredEntry = filteredEntries[0];
  const gridEntries = filteredEntries.slice(1);

  const getReadTime = (notes: string | null) => {
    if (!notes) return "1 min read";
    const words = notes.split(/\s+/).length;
    const mins = Math.max(1, Math.ceil(words / 200));
    return `${mins} min read`;
  };

  const accentColors = [
    "border-l-secondary",
    "border-l-gold",
    "border-l-destructive",
    "border-l-accent",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Diary | Alpha</title>
        <meta name="description" content="Your personal strain diary and experiences." />
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={() => navigate("/profile")} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="font-display text-lg font-semibold text-foreground">My Journal</h1>
            <Link to="/">
              <img src={logoLight} alt="Alpha" className="h-6" />
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Stats Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-card border border-border/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{entries.length}</p>
              <p className="text-xs text-muted-foreground">Total Entries</p>
            </div>
            <div className="flex-1 bg-card border border-border/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-secondary">
                {entries.filter(e => e.rating && e.rating >= 4).length}
              </p>
              <p className="text-xs text-muted-foreground">Favorites</p>
            </div>
            <div className="flex-1 bg-card border border-border/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gold">
                {entries.length > 0
                  ? (entries.reduce((sum, e) => sum + (e.rating || 0), 0) / entries.length).toFixed(1)
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </div>
          </div>

          {/* Filter Row + New Entry */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 gap-1.5 text-muted-foreground"
              onClick={() => {
                setEditingEntry(null);
                setFormData({ strain_name: "", experience_notes: "", rating: 5, entry_date: new Date().toISOString().split("T")[0] });
                setShowForm(true);
              }}
            >
              <Plus className="w-4 h-4" />
              New Entry
            </Button>
            <div className="h-5 w-px bg-border shrink-0" />
            {(["all", "recent", "favorites"] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeFilter === filter
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {filter === "all" ? "All Time" : filter === "recent" ? "Recent" : "Favorites"}
              </button>
            ))}
          </div>

          {/* Entry Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center">
              <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-lg animate-slide-up sm:animate-scale-in max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      {editingEntry ? "Edit Entry" : "New Reflection"}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">Capture your experience</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="rounded-full">
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="entry_date" className="text-xs text-muted-foreground mb-1.5 block">Date</Label>
                      <Input
                        id="entry_date"
                        type="date"
                        value={formData.entry_date}
                        onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                        className="bg-background border-border/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="strain_name" className="text-xs text-muted-foreground mb-1.5 block">Strain</Label>
                      <Input
                        id="strain_name"
                        value={formData.strain_name}
                        onChange={(e) => setFormData({ ...formData, strain_name: e.target.value })}
                        placeholder="e.g., Blue Dream"
                        className="bg-background border-border/50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Rating</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: num })}
                          className="p-1.5 rounded-lg transition-colors hover:bg-muted/50"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              num <= formData.rating
                                ? "fill-secondary text-secondary"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="experience_notes" className="text-xs text-muted-foreground mb-1.5 block">Notes</Label>
                    <Textarea
                      id="experience_notes"
                      value={formData.experience_notes}
                      onChange={(e) => setFormData({ ...formData, experience_notes: e.target.value })}
                      placeholder="Describe your experience..."
                      className="bg-background border-border/50 min-h-[120px] resize-none"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 h-11">
                    {editingEntry ? "Update Entry" : "Save Reflection"}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* Content */}
          {filteredEntries.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-7 h-7 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-display font-medium text-foreground mb-2">No reflections yet</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                Start documenting your experiences to build your personal journal
              </p>
              <Button
                onClick={() => {
                  setEditingEntry(null);
                  setFormData({ strain_name: "", experience_notes: "", rating: 5, entry_date: new Date().toISOString().split("T")[0] });
                  setShowForm(true);
                }}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Write First Entry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Featured Entry */}
              {featuredEntry && (
                <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-gold to-secondary" />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                        Featured Entry
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(featuredEntry.entry_date), "MMM d, yyyy")}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      {featuredEntry.strain_name || "Untitled Reflection"}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                      {featuredEntry.experience_notes || "No notes recorded for this entry."}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {getReadTime(featuredEntry.experience_notes)}
                        </span>
                        {featuredEntry.rating && (
                          <div className="flex items-center gap-0.5">
                            {[...Array(featuredEntry.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-secondary text-secondary" />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(featuredEntry)} className="h-8 w-8 rounded-full">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(featuredEntry.id)} className="h-8 w-8 rounded-full text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid Entries */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {gridEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`group relative bg-card/60 border border-border/40 rounded-xl p-4 transition-all hover:bg-card hover:border-border/80 border-l-2 ${accentColors[index % accentColors.length]}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[11px] text-muted-foreground">
                        {format(new Date(entry.entry_date), "MMM d, yyyy")}
                      </p>
                      {entry.strain_name && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                          <span className="text-[11px] font-medium text-secondary truncate">
                            {entry.strain_name}
                          </span>
                        </>
                      )}
                    </div>

                    <h4 className="font-medium text-foreground text-sm mb-1.5 line-clamp-1">
                      {entry.strain_name || "Untitled"}
                    </h4>

                    {entry.experience_notes && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                        {entry.experience_notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {getReadTime(entry.experience_notes)}
                        </span>
                        {entry.rating && (
                          <div className="flex items-center gap-0.5">
                            {[...Array(entry.rating)].map((_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 fill-secondary text-secondary" />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)} className="h-7 w-7 rounded-full">
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)} className="h-7 w-7 rounded-full text-destructive">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
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

export default MyDiary;
