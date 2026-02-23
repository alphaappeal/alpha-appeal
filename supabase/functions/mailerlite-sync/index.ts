import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MAILERLITE_API_KEY = Deno.env.get("MAILERLITE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
  name: string;
  tier: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseAuth = createClient(
      SUPABASE_URL!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const authenticatedUserId = claimsData.claims.sub;

    const { email, name, tier, userId }: SubscribeRequest = await req.json();

    // Ensure the userId matches the authenticated user
    if (userId !== authenticatedUserId) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Adding subscriber: ${email}, tier: ${tier}`);

    if (!MAILERLITE_API_KEY) {
      throw new Error("MAILERLITE_API_KEY not configured");
    }

    // Add subscriber to MailerLite
    const response = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MAILERLITE_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        fields: {
          name,
          last_name: "",
        },
        groups: [],
        status: "active",
      }),
    });

    const subscriberData = await response.json();
    console.log("MailerLite subscriber response:", subscriberData);

    // Tag the subscriber with their tier
    if (subscriberData.data?.id) {
      const subscriberId = subscriberData.data.id;

      // Update user in Supabase with MailerLite subscriber ID
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        await supabase
          .from("users")
          .update({ mailerlite_subscriber_id: subscriberId })
          .eq("id", userId);

        // Log email activity
        await supabase.from("email_logs").insert({
          user_id: userId,
          email_type: "welcome",
          recipient_email: email,
          subject: `Welcome to Alpha - ${tier} Tier`,
          status: "sent",
          sent_at: new Date().toISOString(),
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: subscriberData }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in mailerlite-sync:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
