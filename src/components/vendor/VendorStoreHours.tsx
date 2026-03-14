import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, Clock } from "lucide-react";

interface HourEntry {
  id?: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const defaultHours: HourEntry[] = Array.from({ length: 7 }, (_, i) => ({
  day_of_week: i,
  open_time: i === 0 ? "" : "09:00",
  close_time: i === 0 ? "" : "18:00",
  is_closed: i === 0,
}));

const VendorStoreHours = ({ partnerId }: { partnerId: string }) => {
  const { toast } = useToast();
  const [hours, setHours] = useState<HourEntry[]>(defaultHours);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHours();
  }, [partnerId]);

  const loadHours = async () => {
    const { data } = await supabase
      .from("partner_hours")
      .select("*")
      .eq("partner_id", partnerId)
      .order("day_of_week");

    if (data && data.length > 0) {
      const mapped = defaultHours.map((dh) => {
        const existing = data.find((d: any) => d.day_of_week === dh.day_of_week);
        return existing
          ? { id: existing.id, day_of_week: existing.day_of_week, open_time: existing.open_time || "", close_time: existing.close_time || "", is_closed: existing.is_closed }
          : dh;
      });
      setHours(mapped);
    }
    setLoading(false);
  };

  const updateHour = (day: number, field: keyof HourEntry, value: any) => {
    setHours((prev) =>
      prev.map((h) => (h.day_of_week === day ? { ...h, [field]: value } : h))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const h of hours) {
        const payload = {
          partner_id: partnerId,
          day_of_week: h.day_of_week,
          open_time: h.is_closed ? null : h.open_time || null,
          close_time: h.is_closed ? null : h.close_time || null,
          is_closed: h.is_closed,
        };

        if (h.id) {
          const { error } = await supabase.from("partner_hours").update(payload).eq("id", h.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("partner_hours").insert(payload);
          if (error) throw error;
        }
      }
      toast({ title: "Saved", description: "Store hours updated. Open Now status will reflect these hours." });
      loadHours();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">Store Hours</h2>
        <Button variant="sage" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Hours
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-secondary" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {hours.map((h) => (
              <div key={h.day_of_week} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                <span className="w-28 text-sm font-medium text-foreground">{DAY_NAMES[h.day_of_week]}</span>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={h.is_closed}
                    onChange={(e) => updateHour(h.day_of_week, "is_closed", e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-muted-foreground">Closed</span>
                </label>
                {!h.is_closed && (
                  <>
                    <Input
                      type="time"
                      value={h.open_time}
                      onChange={(e) => updateHour(h.day_of_week, "open_time", e.target.value)}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={h.close_time}
                      onChange={(e) => updateHour(h.day_of_week, "close_time", e.target.value)}
                      className="w-32"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorStoreHours;
