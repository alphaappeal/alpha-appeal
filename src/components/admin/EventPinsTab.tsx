import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2, MapPin, Calendar, Save, X } from "lucide-react";

interface MapEvent {
  id: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  event_date: string | null;
  event_type: string | null;
  event_type_id: string | null;
  event_url: string | null;
  active: boolean;
  created_at: string | null;
  start_date: string | null;
  end_date: string | null;
  // from view join
  event_type_name?: string | null;
  event_icon?: string | null;
  event_color?: string | null;
}

interface EventType {
  id: string;
  name: string;
  icon: string;
  color: string | null;
}

const emptyForm = {
  title: "", description: "", latitude: "", longitude: "",
  event_type_id: "", event_url: "", start_date: "", end_date: "",
};

const EventPinsTab = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<MapEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("map_events_with_types")
      .select("*")
      .order("created_at", { ascending: false });
    setEvents((data as MapEvent[]) || []);
    setLoading(false);
  };

  const loadEventTypes = async () => {
    const { data } = await supabase.from("event_types").select("*").order("name");
    if (data) setEventTypes(data as EventType[]);
  };

  useEffect(() => {
    load();
    loadEventTypes();
  }, []);

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
      event_type_id: form.event_type_id || null,
      event_url: form.event_url || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
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
            <Select value={form.event_type_id} onValueChange={(val) => setForm({ ...form, event_type_id: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map(et => (
                  <SelectItem key={et.id} value={et.id}>
                    <span className="flex items-center gap-2">
                      {et.color && (
                        <span className="w-3 h-3 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: et.color }} />
                      )}
                      {et.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Latitude *" type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
            <Input placeholder="Longitude *" type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Start date</label>
              <Input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">End date (optional)</label>
              <Input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
            <Input placeholder="Event URL (optional)" value={form.event_url} onChange={(e) => setForm({ ...form, event_url: e.target.value })} className="md:col-span-2" />
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
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <MapPin className="w-4 h-4 text-secondary" />
                <h3 className="font-semibold text-foreground text-sm">{ev.title}</h3>
                <Badge variant={ev.active ? "default" : "secondary"} className="text-xs">
                  {ev.active ? "Active" : "Hidden"}
                </Badge>
                {ev.event_type_name && (
                  <Badge variant="outline" className="text-xs capitalize" style={ev.event_color ? { borderColor: ev.event_color, color: ev.event_color } : {}}>
                    {ev.event_type_name}
                  </Badge>
                )}
                {!ev.event_type_name && ev.event_type && ev.event_type !== "standard" && (
                  <Badge variant="outline" className="text-xs capitalize">{ev.event_type}</Badge>
                )}
              </div>
              {ev.description && <p className="text-muted-foreground text-xs mb-1">{ev.description}</p>}
              <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
                <span>{Number(ev.latitude).toFixed(4)}, {Number(ev.longitude).toFixed(4)}</span>
                {ev.start_date && (
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Start: {new Date(ev.start_date).toLocaleDateString()}</span>
                )}
                {ev.end_date && (
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />End: {new Date(ev.end_date).toLocaleDateString()}</span>
                )}
                {!ev.start_date && ev.event_date && (
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
