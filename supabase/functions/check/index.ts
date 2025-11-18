import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-xaveco-client-id",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const TRIAL_LIMIT = 2;
    const TRIAL_DAYS = 1;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration missing");
    }

    // Get clientId from header
    const clientId = req.headers.get("x-xaveco-client-id");
    if (!clientId) {
      return new Response(JSON.stringify({ error: "Missing x-xaveco-client-id header" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user record from database
    const { data: userRecord } = await supabase
      .from("xaveco_users")
      .select("*")
      .eq("client_id", clientId)
      .single();

    // If no record exists, return default trial info
    const isPremium = userRecord?.is_premium || false;
    const usedCount = userRecord?.used_count || 0;
    const trialStart = userRecord?.trial_start 
      ? new Date(userRecord.trial_start).getTime()
      : Date.now();
    const trialDuration = TRIAL_DAYS * 24 * 60 * 60 * 1000; // days to ms
    const expiresAt = trialStart + trialDuration;

    return new Response(
      JSON.stringify({
        premium: isPremium,
        usedCount: usedCount,
        limit: TRIAL_LIMIT,
        expiresAt: expiresAt,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in check function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
