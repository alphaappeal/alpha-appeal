import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, X, Save, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  category: string | null;
  in_stock: boolean | null;
  active: boolean | null;
}

interface ProductsTabProps {
  products: Product[];
  onRefresh: () => void;
}

const emptyForm = {
  name: "",
  description: "",
  price: "",
  image_url: "",
  stock_quantity: "",
  category: "",
};

const ProductsTab = ({ products, onRefresh }: ProductsTabProps) => {
  const { toast } = useToast();
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setCreating(true);
  };

  const startEdit = (p: Product) => {
    setCreating(false);
    setEditing(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      image_url: p.image_url || "",
      stock_quantity: String(p.stock_quantity ?? 0),
      category: p.category || "",
    });
  };

  const cancel = () => {
    setEditing(null);
    setCreating(false);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast({ title: "Name and price are required", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      image_url: form.image_url || null,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      category: form.category || null,
      in_stock: (parseInt(form.stock_quantity) || 0) > 0,
      active: true,
    };

    let error;
    if (creating) {
      ({ error } = await supabase.from("products").insert(payload));
    } else if (editing) {
      ({ error } = await supabase.from("products").update(payload).eq("id", editing));
    }

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: creating ? "Product created" : "Product updated" });
      cancel();
      onRefresh();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product deleted" });
      onRefresh();
    }
  };

  const formUI = (
    <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground font-semibold">{creating ? "New Product" : "Edit Product"}</h3>
        <Button variant="ghost" size="sm" onClick={cancel}><X className="w-4 h-4" /></Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input placeholder="Product name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <Input placeholder="Price (ZAR) *" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
        <Input placeholder="Image URL" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
        <Input placeholder="Stock quantity" type="number" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))} />
        <Input placeholder="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
      </div>
      <Textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      <Button onClick={handleSave} disabled={saving} className="gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {creating ? "Create" : "Save"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{products.length} products</p>
        <Button size="sm" onClick={startCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {(creating || editing) && formUI}

      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Product</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Price</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Stock</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-muted/10">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {p.image_url && (
                        <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="text-foreground font-medium text-sm">{p.name}</p>
                        <p className="text-muted-foreground text-xs line-clamp-1">{p.description || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-foreground text-sm">R{p.price}</td>
                  <td className="p-4 text-foreground text-sm">{p.stock_quantity ?? 0}</td>
                  <td className="p-4">
                    <Badge variant="outline" className="text-xs capitalize">{p.category || "—"}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant={p.active ? "default" : "secondary"}>
                      {p.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(p)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No products yet. Click "Add Product" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductsTab;
