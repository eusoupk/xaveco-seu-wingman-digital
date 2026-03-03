import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-xaveco-client-id",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate admin secret
    const adminSecret = Deno.env.get("ADMIN_SECRET");
    const providedSecret = req.headers.get("x-admin-secret");
    if (!adminSecret || providedSecret !== adminSecret) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clientId = req.headers.get("x-xaveco-client-id");
    if (!clientId) {
      return new Response(JSON.stringify({ ok: false, error: "Missing client_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Upsert: create user if not exists, then set admin + premium
    const { data: existing } = await supabase
      .from("xaveco_users")
      .select("client_id")
      .eq("client_id", clientId)
      .single();

    if (existing) {
      await supabase
        .from("xaveco_users")
        .update({ is_admin: true, is_premium: true })
        .eq("client_id", clientId);
    } else {
      await supabase
        .from("xaveco_users")
        .insert({
          client_id: clientId,
          is_admin: true,
          is_premium: true,
          trial_messages_left: 9999,
        });
    }

    return new Response(JSON.stringify({ ok: true, message: "Admin activated" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
