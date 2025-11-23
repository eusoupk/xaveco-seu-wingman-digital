import Stripe from 'https://esm.sh/stripe@17.5.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', { 
  apiVersion: '2025-11-17.clover' 
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();
    
    if (!session_id) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing session_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Confirming checkout for session:', session_id);

    // Recuperar session do Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log('Session retrieved:', { 
      id: session.id, 
      payment_status: session.payment_status,
      status: session.status 
    });

    // Confirmar pagamento
    const paid = session.payment_status === 'paid' || 
                 session.status === 'complete' || 
                 session.subscription;

    if (!paid) {
      return new Response(
        JSON.stringify({ ok: false, isPremium: false, message: 'Payment not completed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Recuperar client_id
    const clientId = session.client_reference_id || session.metadata?.user_id;
    
    if (!clientId) {
      console.error('No client_id found in session');
      return new Response(
        JSON.stringify({ ok: false, error: 'No client_id in session' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Updating premium status for client:', clientId);

    // Atualizar no banco (idempotente)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { data, error } = await supabase
      .from('xaveco_users')
      .upsert({
        client_id: clientId,
        is_premium: true,
        premium_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'client_id'
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ ok: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Premium activated for client:', clientId);

    return new Response(
      JSON.stringify({ ok: true, isPremium: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
