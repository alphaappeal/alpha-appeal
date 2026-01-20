import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StrainData {
  name: string;
  img_url?: string;
  type: string;
  thc_level?: string;
  most_common_terpene?: string;
  description?: string;
  effects?: Record<string, string>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if the user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: hasRole, error: roleError } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (roleError || !hasRole) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get strain data from request body
    const { strains } = await req.json() as { strains: StrainData[] };

    if (!strains || !Array.isArray(strains)) {
      return new Response(JSON.stringify({ error: "Invalid strain data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process strains in batches
    const batchSize = 100;
    let imported = 0;
    let errors: string[] = [];

    for (let i = 0; i < strains.length; i += batchSize) {
      const batch = strains.slice(i, i + batchSize).map((strain) => ({
        name: strain.name,
        type: strain.type?.toLowerCase() || "hybrid",
        thc_level: strain.thc_level,
        most_common_terpene: strain.most_common_terpene,
        description: strain.description,
        img_url: strain.img_url,
        effects: strain.effects || {},
      }));

      const { data, error } = await supabase
        .from("strains")
        .upsert(batch, { 
          onConflict: "name",
          ignoreDuplicates: false 
        });

      if (error) {
        errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
      } else {
        imported += batch.length;
      }
    }

    // Log admin action
    await supabase.from("admin_actions").insert({
      admin_id: user.id,
      action_type: "upload",
      target_table: "strains",
      new_data: { count: imported, errors: errors.length },
    });

    return new Response(
      JSON.stringify({
        success: true,
        imported,
        total: strains.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Import error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
