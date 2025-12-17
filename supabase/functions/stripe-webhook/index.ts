import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import Stripe from "https://esm.sh/stripe@14.10.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("❌ Missing stripe-signature header");
      return new Response(JSON.stringify({ error: "No signature" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // CRÍTICO: Ler body como raw bytes (não como texto ou JSON)
    // Stripe requer o body exato para validar a assinatura
    const bodyBuffer = await req.arrayBuffer();
    const bodyBytes = new Uint8Array(bodyBuffer);
    
    console.log(`📨 Webhook received - signature present, body size: ${bodyBytes.length} bytes`);
    
    let event: Stripe.Event;

    // Verificar assinatura do webhook (ASYNC - necessário para Deno/Edge Runtime)
    try {
      event = await stripe.webhooks.constructEventAsync(bodyBytes, signature, STRIPE_WEBHOOK_SECRET);
      console.log(`✅ Webhook signature verified for event: ${event.id} (${event.type})`);
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err);
      console.error("❌ Signature header:", signature?.substring(0, 20) + "...");
      return new Response(JSON.stringify({ error: "Invalid signature", details: err instanceof Error ? err.message : "Unknown" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // IDEMPOTÊNCIA: verificar se evento já foi processado
    const { data: existingEvent } = await supabase
      .from("billing_events")
      .select("id")
      .eq("stripe_event_id", event.id)
      .single();

    if (existingEvent) {
      console.log(`⚠️ Event ${event.id} already processed, skipping`);
      return new Response(JSON.stringify({ received: true, message: "Event already processed" }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Processar eventos
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Extrair client_id de client_reference_id ou metadata
      const clientId = session.client_reference_id || session.metadata?.client_id;

      if (!clientId) {
        console.error(`❌ No client_id found in session ${session.id}`);
        return new Response(JSON.stringify({ error: "No client_id in session" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`💰 Processing checkout for client: ${clientId}`);

      // Calcular premium_until (7 dias para plano semanal)
      const premiumUntil = new Date();
      premiumUntil.setDate(premiumUntil.getDate() + 7);

      // Extrair stripe_customer_id e promo info da sessão
      const stripeCustomerId = session.customer as string;
      const promoType = session.metadata?.promo_type || null;
      const isPromo = !!promoType;
      
      console.log(`💰 Checkout - promo: ${isPromo ? promoType : 'none'}, customer: ${stripeCustomerId}`);
      
      // Atualizar ou criar usuário como premium
      const { data: existingUser } = await supabase
        .from("xaveco_users")
        .select("*")
        .eq("client_id", clientId)
        .single();

      const updateData: any = { 
        is_premium: true,
        premium_until: premiumUntil.toISOString(),
        stripe_customer_id: stripeCustomerId
      };

      // Se for promoção, registrar
      if (isPromo) {
        updateData.promo_applied = true;
        updateData.promo_type = promoType;
      }

      if (existingUser) {
        const { error } = await supabase
          .from("xaveco_users")
          .update(updateData)
          .eq("client_id", clientId);

        if (error) {
          console.error(`❌ Error updating user to premium:`, error);
          throw error;
        }
      } else {
        const { error } = await supabase
          .from("xaveco_users")
          .insert({
            client_id: clientId,
            trial_start: new Date().toISOString(),
            used_count: 0,
            trial_messages_left: 0,
            ...updateData
          });

        if (error) {
          console.error(`❌ Error creating premium user:`, error);
          throw error;
        }
      }

      // Registrar evento na tabela de auditoria
      const { error: auditError } = await supabase
        .from("billing_events")
        .insert({
          stripe_event_id: event.id,
          client_id: clientId,
          amount: session.amount_total,
          plan: "weekly",
          raw_event: event as any,
        });

      if (auditError) {
        console.error(`⚠️ Error recording billing event:`, auditError);
        // Não falhar o webhook por erro de auditoria
      }

      console.log(`✅ Client ${clientId} upgraded to premium until ${premiumUntil.toISOString()}`);
    }

    // Handle subscription events
    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const clientId = subscription.metadata?.client_id;

      if (!clientId) {
        console.log("No client_id in subscription metadata");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // If subscription is canceled or not active, remove premium status
      if (subscription.status !== 'active') {
        const { error } = await supabase
          .from("xaveco_users")
          .update({ is_premium: false })
          .eq("client_id", clientId);

        if (error) {
          console.error("Error removing premium status:", error);
        } else {
          console.log(`Client ${clientId} premium removed due to subscription status: ${subscription.status}`);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});