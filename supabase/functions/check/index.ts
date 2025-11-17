import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-xaveco-client-id',
};

// WARNING: In-memory storage. In production, use Supabase database or Redis.
// These will reset when the function restarts.
const trialStore: Record<string, { trialStart: number; usedCount: number }> = {};
const premiumStore: Record<string, boolean> = {};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TRIAL_LIMIT = parseInt(Deno.env.get('TRIAL_LIMIT') || '10');
    const TRIAL_DAYS = parseInt(Deno.env.get('TRIAL_DAYS') || '3');

    // Get clientId from header
    const clientId = req.headers.get('x-xaveco-client-id');
    if (!clientId) {
      return new Response(JSON.stringify({ error: 'Missing x-xaveco-client-id header' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check premium status
    const isPremium = premiumStore[clientId] === true;

    // Get trial info
    const trial = trialStore[clientId];
    const usedCount = trial ? trial.usedCount : 0;
    const trialStart = trial ? trial.trialStart : Date.now();
    const trialDuration = TRIAL_DAYS * 24 * 60 * 60 * 1000; // days to ms
    const expiresAt = trialStart + trialDuration;

    return new Response(JSON.stringify({
      premium: isPremium,
      usedCount: usedCount,
      limit: TRIAL_LIMIT,
      expiresAt: expiresAt
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in check function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
