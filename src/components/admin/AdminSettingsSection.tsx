import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Save, Loader2, Globe, Shield, Database } from "lucide-react";

const AdminSettingsSection = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("site_settings").select("key, value");
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((d: any) => { map[d.key] = d.value || ""; });
        setSettings(map);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (key: string, value: string) => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Setting saved" });
    }
    setSaving(false);
  };

  const settingGroups = [
    {
      title: "Branding",
      icon: Globe,
      fields: [
        { key: "hero_title", label: "Hero Title" },
        { key: "hero_subtitle", label: "Hero Subtitle" },
        { key: "logo_url", label: "Logo URL" },
      ],
    },
    {
      title: "Platform",
      icon: Database,
      fields: [
        { key: "philosophy_text", label: "Philosophy Text" },
        { key: "support_email", label: "Support Email" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Site-wide configuration and CMS values</p>
      </div>

      {/* System Status */}
      <div className="p-4 rounded-xl bg-admin-surface border border-admin-border">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-admin-emerald" />
          <h3 className="text-sm font-semibold text-foreground">System Status</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "API", status: "Operational" },
            { label: "Database", status: "Operational" },
            { label: "Edge Functions", status: "Operational" },
          ].map(({ label, status }) => (
            <div key={label} className="flex items-center justify-between p-3 rounded-lg bg-admin-bg border border-admin-border">
              <span className="text-sm text-foreground">{label}</span>
              <Badge variant="outline" className="bg-admin-emerald/10 text-admin-emerald border-admin-emerald/20 text-[10px]">
                {status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* CMS Settings */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : (
        settingGroups.map(group => {
          const Icon = group.icon;
          return (
            <div key={group.title} className="p-5 rounded-xl bg-admin-surface border border-admin-border space-y-4">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-admin-indigo" />
                <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
              </div>
              <div className="space-y-3">
                {group.fields.map(field => (
                  <div key={field.key} className="flex flex-col sm:flex-row gap-2">
                    <label className="text-xs text-muted-foreground min-w-[140px] pt-2">{field.label}</label>
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={settings[field.key] || ""}
                        onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                        className="bg-admin-bg border-admin-border text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 border-admin-border"
                        onClick={() => handleSave(field.key, settings[field.key] || "")}
                        disabled={saving}
                      >
                        <Save className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AdminSettingsSection;
