import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-xaveco-client-id',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = req.headers.get('x-xaveco-client-id');
    
    if (!clientId) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing client_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Checking status for client:', clientId);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { data: user, error } = await supabase
      .from('xaveco_users')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ ok: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      // Usuário novo, retornar trial disponível
      return new Response(
        JSON.stringify({ 
          ok: true, 
          isPremium: false, 
          freePlaysLeft: 2 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Checar se premium ainda válido
    const now = new Date();
    const premiumUntil = user.premium_until ? new Date(user.premium_until) : null;
    const isPremium = user.is_premium && premiumUntil && premiumUntil > now;

    const freePlaysLeft = user.trial_messages_left || 0;

    // Calcular dias restantes
    let daysLeft = null;
    if (isPremium && premiumUntil) {
      const diffMs = premiumUntil.getTime() - now.getTime();
      daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    console.log('Status:', { isPremium, freePlaysLeft, daysLeft, premiumUntil: user.premium_until });

    return new Response(
      JSON.stringify({ 
        ok: true, 
        isPremium, 
        freePlaysLeft,
        daysLeft,
        premiumUntil: user.premium_until
      }),
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
