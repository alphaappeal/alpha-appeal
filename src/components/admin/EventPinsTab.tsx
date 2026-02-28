import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, MapPin, Calendar, Save, X } from "lucide-react";

interface MapEvent {
  id: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  event_date: string | null;
  event_type: string | null;
  event_url: string | null;
  active: boolean;
  created_at: string | null;
}

const emptyForm = {
  title: "", description: "", latitude: "", longitude: "",
  event_date: "", event_type: "standard", event_url: "",
};

const EventPinsTab = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<MapEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("map_events").select("*").order("created_at", { ascending: false });
    setEvents((data as MapEvent[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.title || !form.latitude || !form.longitude) {
      toast({ title: "Title and coordinates are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("map_events").insert({
      title: form.title,
      description: form.description || null,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      event_date: form.event_date || null,
      event_type: form.event_type,
      event_url: form.event_url || null,
      active: true,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event pin created ✓" });
      setCreating(false);
      setForm(emptyForm);
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event pin?")) return;
    const { error } = await supabase.from("map_events").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event pin deleted" });
      load();
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    await supabase.from("map_events").update({ active: !active }).eq("id", id);
    load();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-secondary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{events.length} event pins</p>
        <Button size="sm" onClick={() => setCreating(!creating)} className="gap-2">
          <Plus className="w-4 h-4" /> Drop Event Pin
        </Button>
      </div>

      {creating && (
        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground font-semibold">New Event Pin</h3>
            <Button variant="ghost" size="sm" onClick={() => setCreating(false)}><X className="w-4 h-4" /></Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input placeholder="Event title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Event type (standard/special)" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })} />
            <Input placeholder="Latitude *" type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
            <Input placeholder="Longitude *" type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
            <Input placeholder="Event date" type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
            <Input placeholder="Event URL (optional)" value={form.event_url} onChange={(e) => setForm({ ...form, event_url: e.target.value })} />
          </div>
          <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button onClick={handleCreate} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Create Pin
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {events.map((ev) => (
          <div key={ev.id} className="p-4 rounded-xl border border-border/50 bg-card/30 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-secondary" />
                <h3 className="font-semibold text-foreground text-sm">{ev.title}</h3>
                <Badge variant={ev.active ? "default" : "secondary"} className="text-xs">
                  {ev.active ? "Active" : "Hidden"}
                </Badge>
                {ev.event_type && ev.event_type !== "standard" && (
                  <Badge variant="outline" className="text-xs capitalize">{ev.event_type}</Badge>
                )}
              </div>
              {ev.description && <p className="text-muted-foreground text-xs mb-1">{ev.description}</p>}
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>{ev.latitude.toFixed(4)}, {ev.longitude.toFixed(4)}</span>
                {ev.event_date && (
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(ev.event_date).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => handleToggle(ev.id, ev.active)}>
                {ev.active ? "Hide" : "Show"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(ev.id)} className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventPinsTab;
