// Supabase Edge Function (Deno)
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
    const { email, name, tier, userId }: SubscribeRequest = await req.json();

    // Debug: adding subscriber (console.log removed to avoid noisy logs in production)

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
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Log error for debugging (consider using proper logging service in production)
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
