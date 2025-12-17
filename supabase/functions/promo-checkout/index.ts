import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import Stripe from "https://esm.sh/stripe@14.10.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-xaveco-client-id',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ Missing environment variables");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const clientId = req.headers.get("x-xaveco-client-id");
    if (!clientId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const successUrl = body.success_url || "https://xaveco.app/checkout-success";
    const cancelUrl = body.cancel_url || "https://xaveco.app";

    // Verificar se usuário já usou a promo
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: existingUser } = await supabase
      .from("xaveco_users")
      .select("promo_applied, is_premium")
      .eq("client_id", clientId)
      .single();

    if (existingUser?.promo_applied) {
      console.log(`❌ User ${clientId} already used promo`);
      return new Response(JSON.stringify({ 
        error: "promo_already_used",
        message: "Você já utilizou esta promoção" 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (existingUser?.is_premium) {
      console.log(`❌ User ${clientId} is already premium`);
      return new Response(JSON.stringify({ 
        error: "already_premium",
        message: "Você já é assinante premium" 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    console.log(`🎁 Creating promo checkout for client: ${clientId}`);

    // Criar sessão de checkout com:
    // 1. Taxa de ativação de R$1 (100 centavos)
    // 2. Assinatura com 7 dias de trial, depois R$19,90/semana
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      client_reference_id: clientId,
      metadata: {
        client_id: clientId,
        promo_type: 'activation_week_R$1'
      },
      line_items: [
        // Taxa de ativação R$1
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Taxa de Ativação - Semana de Ativação',
              description: 'Acesso completo ao Xaveco por 7 dias'
            },
            unit_amount: 100, // R$1,00 em centavos
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          client_id: clientId,
          promo_type: 'activation_week_R$1'
        },
        items: [
          {
            price: 'price_1RRu49JYfK09xsAOuR49F9O9', // Price ID do plano semanal R$19,90
            quantity: 1,
          }
        ]
      },
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&promo=activation`,
      cancel_url: cancelUrl,
    });

    console.log(`✅ Promo checkout session created: ${session.id}`);

    return new Response(JSON.stringify({ 
      ok: true,
      url: session.url,
      sessionId: session.id
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("❌ Promo checkout error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
