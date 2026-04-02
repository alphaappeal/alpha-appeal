import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, createCorsPreflightResponse } from "../_shared/cors.ts";

interface RawItem {
  name: string;
  img_url?: string;
  description?: string;
  type?: string;
  year?: string;
  era?: string;
  feelings?: Record<string, string>;
  // Category-specific creator fields
  designer?: string;
  artist?: string;
  manufacturer?: string;
  origin?: string;
  // Category-specific medium fields
  most_common_material?: string;
  most_common_medium?: string;
  most_common_engine?: string;
  most_common_form?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return createCorsPreflightResponse(req.headers.get("Origin") || null);
  }

  const corsHeaders = getCorsHeaders(req.headers.get("Origin") || null);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { category, data } = await req.json() as { category: string; data: RawItem[] };

    if (!category || !data || !Array.isArray(data)) {
      return new Response(JSON.stringify({ error: "Missing category or data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validCategories = ["fashion", "wellness", "artwork", "cars"];
    if (!validCategories.includes(category)) {
      return new Response(JSON.stringify({ error: "Invalid category" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rows = data.map((item) => ({
      name: item.name,
      category,
      type: item.type || null,
      img_url: item.img_url || null,
      description: item.description || null,
      creator: item.designer || item.artist || item.manufacturer || item.origin || null,
      medium: item.most_common_material || item.most_common_medium || item.most_common_engine || item.most_common_form || null,
      year: item.year || item.era || null,
      feelings: item.feelings || {},
      published: true,
    }));

    // Batch insert in chunks of 50
    let inserted = 0;
    for (let i = 0; i < rows.length; i += 50) {
      const chunk = rows.slice(i, i + 50);
      const { error } = await supabase.from("culture_items").insert(chunk);
      if (error) {
        console.error(`Chunk error at ${i}:`, error);
        return new Response(JSON.stringify({ error: error.message, inserted }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      inserted += chunk.length;
    }

    return new Response(JSON.stringify({ success: true, inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Import error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
