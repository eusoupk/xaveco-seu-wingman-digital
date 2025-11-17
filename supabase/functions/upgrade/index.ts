import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration missing");
    }

    const { clientId } = await req.json();

    if (!clientId) {
      return new Response(JSON.stringify({ error: 'Missing clientId parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if user exists
    const { data: existingUser } = await supabase
      .from("xaveco_users")
      .select("*")
      .eq("client_id", clientId)
      .single();

    if (existingUser) {
      // Update existing user to premium
      const { error: updateError } = await supabase
        .from("xaveco_users")
        .update({ is_premium: true })
        .eq("client_id", clientId);

      if (updateError) {
        console.error("Error updating user to premium:", updateError);
        throw new Error("Database error");
      }
    } else {
      // Create new premium user
      const { error: insertError } = await supabase
        .from("xaveco_users")
        .insert({
          client_id: clientId,
          is_premium: true,
          trial_start: new Date().toISOString(),
          used_count: 0,
        });

      if (insertError) {
        console.error("Error creating premium user:", insertError);
        throw new Error("Database error");
      }
    }

    console.log(`Client ${clientId} upgraded to premium`);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in upgrade function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
