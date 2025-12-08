import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-xaveco-client-id, x-forwarded-for",
};

// Função para obter IP do usuário
function getClientIP(req: Request): string {
  // Tentar headers comuns de proxy/CDN
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP.trim();
  }
  
  const cfConnectingIP = req.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }
  
  // Fallback para IP desconhecido
  return "unknown";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Obter IP do usuário
    const userIP = getClientIP(req);
    console.log(`🔍 Checking trial for client ${clientId} with IP: ${userIP}`);

    // Verificar se IP já usou trial (apenas se IP não é "unknown")
    if (userIP !== "unknown") {
      const { data: existingIP, error: ipError } = await supabase
        .from("trial_ips")
        .select("*")
        .eq("ip_address", userIP)
        .maybeSingle();

      if (ipError) {
        console.error("Error checking IP:", ipError);
      }

      if (existingIP) {
        console.log(`🚫 IP ${userIP} already used trial on ${existingIP.first_seen}`);
        return new Response(JSON.stringify({ 
          error: "trial_already_used",
          message: "Este dispositivo já utilizou o período de teste gratuito. Assine para continuar usando."
        }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Verificar se usuário já existe
    const { data: existingUser } = await supabase
      .from("xaveco_users")
      .select("*")
      .eq("client_id", clientId)
      .single();

    // Calcular trial_expires_at (2 dias a partir de agora)
    const trialExpiresAt = new Date();
    trialExpiresAt.setDate(trialExpiresAt.getDate() + 2);

    if (existingUser) {
      // Se usuário já usou todo o trial, não permitir reset
      if (existingUser.trial_messages_left === 0 && existingUser.used_count > 0) {
        console.log(`🚫 Client ${clientId} already exhausted trial`);
        return new Response(JSON.stringify({ 
          error: "trial_already_used",
          message: "Você já utilizou seu período de teste gratuito. Assine para continuar usando."
        }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Atualizar usuário existente com trial de 2 mensagens
      const { error } = await supabase
        .from("xaveco_users")
        .update({
          trial_messages_left: 2,
          trial_expires_at: trialExpiresAt.toISOString(),
        })
        .eq("client_id", clientId);

      if (error) {
        console.error("Error updating trial for user:", error);
        throw new Error("Database error");
      }
    } else {
      // Criar novo usuário com trial de 2 mensagens
      const { error } = await supabase
        .from("xaveco_users")
        .insert({
          client_id: clientId,
          is_premium: false,
          trial_messages_left: 2,
          trial_expires_at: trialExpiresAt.toISOString(),
          trial_start: new Date().toISOString(),
          used_count: 0,
        });

      if (error) {
        console.error("Error creating trial user:", error);
        throw new Error("Database error");
      }
    }

    // Registrar IP na tabela trial_ips (apenas se IP não é "unknown")
    if (userIP !== "unknown") {
      const { error: ipInsertError } = await supabase
        .from("trial_ips")
        .insert({
          ip_address: userIP,
          client_id: clientId,
        });

      if (ipInsertError && !ipInsertError.message.includes("duplicate")) {
        console.error("Error registering IP:", ipInsertError);
        // Não falhar por erro de IP
      } else {
        console.log(`📝 Registered IP ${userIP} for client ${clientId}`);
      }
    }

    console.log(`✅ Trial started for client ${clientId}: 2 messages, expires at ${trialExpiresAt.toISOString()}`);

    // Log evento de trial iniciado
    try {
      await supabase
        .from("xaveco_events")
        .insert({
          client_id: clientId,
          event_type: "trial_started",
          metadata: {
            trial_messages_left: 2,
            trial_expires_at: trialExpiresAt.toISOString(),
            ip_address: userIP,
          },
        });
    } catch (analyticsError) {
      console.error("Error logging trial_started event:", analyticsError);
      // Não falhar por erro de analytics
    }

    return new Response(JSON.stringify({ 
      ok: true,
      trial: {
        messagesLeft: 2,
        expiresAt: trialExpiresAt.toISOString(),
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in start-trial function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});