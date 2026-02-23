import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const CATEGORIES = [
  { key: "fashion", file: "/data/fashion_culture_data.json" },
  { key: "wellness", file: "/data/wellness_data.json" },
  { key: "artwork", file: "/data/artwork_culture_data.json" },
  { key: "cars", file: "/data/car_culture_data.json" },
];

const ImportCultureData = () => {
  const [status, setStatus] = useState<Record<string, { loading: boolean; result?: string; error?: string }>>({});

  const importCategory = async (category: string, filePath: string) => {
    setStatus(prev => ({ ...prev, [category]: { loading: true } }));
    try {
      const res = await fetch(filePath);
      const data = await res.json();

      const { data: fnData, error } = await supabase.functions.invoke("import-culture-items", {
        body: { category, data },
      });

      if (error) throw error;
      setStatus(prev => ({ ...prev, [category]: { loading: false, result: `Imported ${fnData.inserted} items` } }));
    } catch (err: any) {
      setStatus(prev => ({ ...prev, [category]: { loading: false, error: err.message } }));
    }
  };

  const importAll = async () => {
    for (const cat of CATEGORIES) {
      await importCategory(cat.key, cat.file);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold text-foreground">Import Culture Data</h2>
      <p className="text-sm text-muted-foreground">Click to import all 4 culture datasets into the database.</p>

      <Button onClick={importAll} className="w-full">Import All Categories</Button>

      <div className="space-y-2">
        {CATEGORIES.map(cat => {
          const s = status[cat.key];
          return (
            <div key={cat.key} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
              <div>
                <span className="capitalize font-medium text-foreground">{cat.key}</span>
                {s?.result && <p className="text-xs text-green-400">{s.result}</p>}
                {s?.error && <p className="text-xs text-red-400">{s.error}</p>}
              </div>
              <div>
                {s?.loading && <Loader2 className="w-4 h-4 animate-spin text-secondary" />}
                {s?.result && <CheckCircle className="w-4 h-4 text-green-400" />}
                {s?.error && <XCircle className="w-4 h-4 text-red-400" />}
                {!s && (
                  <Button size="sm" variant="outline" onClick={() => importCategory(cat.key, cat.file)}>
                    Import
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImportCultureData;
