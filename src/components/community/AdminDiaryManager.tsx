import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

interface Strain {
  id: string;
  name: string;
}

interface AdminDiaryManagerProps {
  onClose: () => void;
}

const CATEGORIES = ["strains", "wellness", "culture", "review", "lifestyle"];
const CONSUMPTION_METHODS = ["Smoked", "Vaped", "Edible", "Tincture", "Topical", "Other"];

export const AdminDiaryManager = ({ onClose }: AdminDiaryManagerProps) => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [strains, setStrains] = useState<Strain[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [tagsInput, setTagsInput] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: [] as string[],
    strain_id: "",
    strain_name: "",
    experience_rating: 0,
    consumption_method: "",
    published: false,
  });

  useEffect(() => {
    fetchEntries();
    fetchStrains();
  }, []);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from("diary_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching entries:", error);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  const fetchStrains = async () => {
    const { data } = await supabase
      .from("strains")
      .select("id, name")
      .order("name");
    setStrains(data || []);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "",
      tags: [],
      strain_id: "",
      strain_name: "",
      experience_rating: 0,
      consumption_method: "",
      published: false,
    });
    setTagsInput("");
    setEditingEntry(null);
  };

  const openEditor = (entry?: DiaryEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        title: entry.title,
        excerpt: entry.excerpt || "",
        content: entry.content,
        category: entry.category || "",
        tags: entry.tags || [],
        strain_id: entry.strain_id || "",
        strain_name: entry.strain_name || "",
        experience_rating: entry.experience_rating || 0,
        consumption_method: entry.consumption_method || "",
        published: entry.published || false,
      });
      setTagsInput((entry.tags || []).join(", "));
    } else {
      resetForm();
    }
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    const entryData = {
      title: formData.title.trim(),
      excerpt: formData.excerpt.trim() || null,
      content: formData.content.trim(),
      category: formData.category || null,
      tags: formData.tags.length > 0 ? formData.tags : null,
      strain_id: formData.strain_id || null,
      strain_name: formData.strain_name || null,
      experience_rating: formData.experience_rating || null,
      consumption_method: formData.consumption_method || null,
      published: formData.published,
      author_id: editingEntry?.author_id || user?.id || null,
    };

    let error;
    if (editingEntry) {
      const result = await supabase
        .from("diary_entries")
        .update(entryData)
        .eq("id", editingEntry.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("diary_entries")
        .insert(entryData);
      error = result.error;
    }

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingEntry ? "update" : "create"} entry.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Entry ${editingEntry ? "updated" : "created"} successfully.`,
      });
      setShowEditor(false);
      resetForm();
      fetchEntries();
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry? This action cannot be undone.")) {
      return;
    }

    const { error } = await supabase
      .from("diary_entries")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete entry.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Entry deleted successfully.",
      });
      fetchEntries();
    }
  };

  const togglePublished = async (entry: DiaryEntry) => {
    const { error } = await supabase
      .from("diary_entries")
      .update({ published: !entry.published })
      .eq("id", entry.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update entry.",
        variant: "destructive",
      });
    } else {
      fetchEntries();
    }
  };

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    const tags = value.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleStrainSelect = (strainId: string) => {
    const strain = strains.find(s => s.id === strainId);
    setFormData(prev => ({
      ...prev,
      strain_id: strainId,
      strain_name: strain?.name || "",
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-auto">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Diary Management</h2>
            <p className="text-muted-foreground text-sm">Create and manage community posts</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => openEditor()} className="gap-2">
              <Plus className="w-4 h-4" />
              New Entry
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Entries List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground mb-4">No diary entries yet</p>
            <Button onClick={() => openEditor()}>Create First Entry</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground truncate">
                      {entry.title}
                    </h3>
                    {entry.published ? (
                      <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Draft
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {entry.category && <span className="capitalize">{entry.category}</span>}
                    {entry.strain_name && <span>• {entry.strain_name}</span>}
                    {entry.created_at && (
                      <span>• {format(new Date(entry.created_at), "MMM d, yyyy")}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePublished(entry)}
                    title={entry.published ? "Unpublish" : "Publish"}
                  >
                    {entry.published ? (
                      <Eye className="w-4 h-4 text-green-400" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditor(entry)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(entry.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "Edit Entry" : "Create New Entry"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter post title..."
                className="bg-background"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Input
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Brief summary for preview..."
                className="bg-background"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your post content..."
                className="min-h-[200px] bg-background resize-y"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Strain */}
              <div className="space-y-2">
                <Label>Linked Strain</Label>
                <Select
                  value={formData.strain_id}
                  onValueChange={handleStrainSelect}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select strain (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {strains.map((strain) => (
                      <SelectItem key={strain.id} value={strain.id}>
                        {strain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Consumption Method */}
              <div className="space-y-2">
                <Label>Consumption Method</Label>
                <Select
                  value={formData.consumption_method}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, consumption_method: value }))}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSUMPTION_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Experience Rating */}
              <div className="space-y-2">
                <Label>Experience Rating</Label>
                <Select
                  value={formData.experience_rating ? formData.experience_rating.toString() : ""}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, experience_rating: parseInt(value) }))}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Rate 1-5" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating} Star{rating !== 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="e.g., relaxation, creativity, evening"
                className="bg-background"
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Published Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <Label htmlFor="published" className="font-medium">Publish Entry</Label>
                <p className="text-xs text-muted-foreground">
                  Published entries are visible in the Community feed
                </p>
              </div>
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowEditor(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingEntry ? "Update" : "Create"} Entry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDiaryManager;
