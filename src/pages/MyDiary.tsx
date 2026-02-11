import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Plus, BookOpen, Star, Trash2, Edit2, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
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

const MyDiary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
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

      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={() => navigate("/profile")} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="font-display text-lg font-semibold text-foreground">My Diary</h1>
            <Link to="/">
              <img src={logoLight} alt="Alpha" className="h-6" />
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          {/* Add Entry Button */}
          <Button
            onClick={() => {
              setEditingEntry(null);
              setFormData({ strain_name: "", experience_notes: "", rating: 5, entry_date: new Date().toISOString().split("T")[0] });
              setShowForm(true);
            }}
            className="w-full mb-6 bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Entry
          </Button>

          {/* Entry Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md animate-scale-in">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    {editingEntry ? "Edit Entry" : "New Entry"}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="entry_date">Date</Label>
                    <Input
                      id="entry_date"
                      type="date"
                      value={formData.entry_date}
                      onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Label htmlFor="strain_name">Strain Name</Label>
                    <Input
                      id="strain_name"
                      value={formData.strain_name}
                      onChange={(e) => setFormData({ ...formData, strain_name: e.target.value })}
                      placeholder="e.g., Blue Dream"
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <div className="flex gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: num })}
                          className="p-2"
                        >
                          <Star
                            className={`w-6 h-6 ${num <= formData.rating ? "fill-secondary text-secondary" : "text-muted-foreground"}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="experience_notes">Experience Notes</Label>
                    <Textarea
                      id="experience_notes"
                      value={formData.experience_notes}
                      onChange={(e) => setFormData({ ...formData, experience_notes: e.target.value })}
                      placeholder="Describe your experience..."
                      className="bg-background min-h-[100px]"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-secondary text-secondary-foreground">
                    {editingEntry ? "Update Entry" : "Save Entry"}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* Entries List */}
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No entries yet</h3>
              <p className="text-muted-foreground text-sm">Start tracking your experiences</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-card/50 border border-border/50 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {format(new Date(entry.entry_date), "MMMM d, yyyy")}
                      </p>
                      <h3 className="font-medium text-foreground">
                        {entry.strain_name || "Untitled"}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      {entry.rating && (
                        <div className="flex items-center gap-0.5 mr-2">
                          {[...Array(entry.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-secondary text-secondary" />
                          ))}
                        </div>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)} className="h-8 w-8">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)} className="h-8 w-8 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {entry.experience_notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{entry.experience_notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </>
  );
};

export default MyDiary;