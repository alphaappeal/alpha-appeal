import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Search,
  Loader2,
  Leaf,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Strain {
  id: string;
  name: string;
  type: string;
  thc_level: string | null;
  most_common_terpene: string | null;
  description: string | null;
  img_url: string | null;
  effects: Record<string, string>;
  upvotes: number;
  downvotes: number;
  stars: number;
  created_at: string;
}

const StrainsTab = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [strains, setStrains] = useState<Strain[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStrain, setEditingStrain] = useState<Strain | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "hybrid",
    thc_level: "",
    most_common_terpene: "",
    description: "",
    img_url: "",
  });

  useEffect(() => {
    fetchStrains();
  }, []);

  const fetchStrains = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("strains")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching strains:", error);
    } else {
      setStrains((data as Strain[]) || []);
    }
    setLoading(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    try {
      const text = await file.text();
      const strainsData = JSON.parse(text);

      if (!Array.isArray(strainsData)) {
        throw new Error("Invalid JSON format - expected an array");
      }

      // Import directly to Supabase
      const batchSize = 100;
      let imported = 0;

      for (let i = 0; i < strainsData.length; i += batchSize) {
        const batch = strainsData.slice(i, i + batchSize).map((strain: any) => ({
          name: strain.name,
          type: strain.type?.toLowerCase() || "hybrid",
          thc_level: strain.thc_level,
          most_common_terpene: strain.most_common_terpene,
          description: strain.description,
          img_url: strain.img_url,
          effects: strain.effects || {},
        }));

        const { error } = await supabase
          .from("strains")
          .upsert(batch, { onConflict: "name" });

        if (!error) {
          imported += batch.length;
        }
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported ${imported} strains.`,
      });

      fetchStrains();
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editingStrain) {
        await supabase
          .from("strains")
          .update({
            name: formData.name,
            type: formData.type,
            thc_level: formData.thc_level,
            most_common_terpene: formData.most_common_terpene,
            description: formData.description,
            img_url: formData.img_url,
          })
          .eq("id", editingStrain.id);
      } else {
        await supabase.from("strains").insert([formData]);
      }

      toast({
        title: "Success",
        description: `Strain ${editingStrain ? "updated" : "created"} successfully.`,
      });

      setShowModal(false);
      setEditingStrain(null);
      setFormData({
        name: "",
        type: "hybrid",
        thc_level: "",
        most_common_terpene: "",
        description: "",
        img_url: "",
      });
      fetchStrains();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save strain.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this strain?")) return;

    const { error } = await supabase.from("strains").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete strain.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Deleted", description: "Strain deleted successfully." });
      fetchStrains();
    }
  };

  const openEditModal = (strain: Strain) => {
    setEditingStrain(strain);
    setFormData({
      name: strain.name,
      type: strain.type || "hybrid",
      thc_level: strain.thc_level || "",
      most_common_terpene: strain.most_common_terpene || "",
      description: strain.description || "",
      img_url: strain.img_url || "",
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingStrain(null);
    setFormData({
      name: "",
      type: "hybrid",
      thc_level: "",
      most_common_terpene: "",
      description: "",
      img_url: "",
    });
    setShowModal(true);
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "indica":
        return "bg-purple-500/20 text-purple-400";
      case "sativa":
        return "bg-green-500/20 text-green-400";
      case "hybrid":
        return "bg-secondary/20 text-secondary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredStrains = strains.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Strain Database</h2>
          <p className="text-sm text-muted-foreground">
            {strains.length} strains in database
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            {importing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Import JSON
          </Button>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Strain
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search strains..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Strains Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      ) : filteredStrains.length === 0 ? (
        <div className="text-center py-12">
          <Leaf className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No strains found
          </h3>
          <p className="text-muted-foreground text-sm">
            Import strains from a JSON file or add them manually.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStrains.map((strain) => (
            <div
              key={strain.id}
              className="bg-card/50 border border-border/50 rounded-xl overflow-hidden"
            >
              {strain.img_url && (
                <div className="h-32 overflow-hidden">
                  <img
                    src={strain.img_url}
                    alt={strain.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{strain.name}</h3>
                  <Badge className={getTypeColor(strain.type)}>
                    {strain.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {strain.description || "No description available"}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>THC: {strain.thc_level || "N/A"}</span>
                  <span>⭐ {strain.stars || 0}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditModal(strain)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(strain.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingStrain ? "Edit Strain" : "Add New Strain"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Strain name"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Type</label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indica">Indica</SelectItem>
                  <SelectItem value="sativa">Sativa</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  THC Level
                </label>
                <Input
                  value={formData.thc_level}
                  onChange={(e) =>
                    setFormData({ ...formData, thc_level: e.target.value })
                  }
                  placeholder="e.g., 20%"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Terpene
                </label>
                <Input
                  value={formData.most_common_terpene}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      most_common_terpene: e.target.value,
                    })
                  }
                  placeholder="e.g., Myrcene"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Image URL
              </label>
              <Input
                value={formData.img_url}
                onChange={(e) =>
                  setFormData({ ...formData, img_url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the strain..."
                rows={4}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StrainsTab;
