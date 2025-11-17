import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-xaveco-client-id',
};

// WARNING: In-memory storage. In production, use Supabase database or Redis.
// These will reset when the function restarts.
const trialStore: Record<string, { trialStart: number; usedCount: number }> = {};
const premiumStore: Record<string, boolean> = {};

type Mode = "reply" | "initiate" | "tension";
type Tone = "casual" | "provocative" | "playful" | "indifferent" | "romantic" | "funny";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const TRIAL_LIMIT = parseInt(Deno.env.get('TRIAL_LIMIT') || '10');
    const TRIAL_DAYS = parseInt(Deno.env.get('TRIAL_DAYS') || '3');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Get clientId from header
    const clientId = req.headers.get('x-xaveco-client-id');
    if (!clientId) {
      return new Response(JSON.stringify({ error: 'Missing x-xaveco-client-id header' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse body
    const { mode, tone, input } = await req.json();

    // Validate params
    const validModes: Mode[] = ["reply", "initiate", "tension"];
    const validTones: Tone[] = ["casual", "provocative", "playful", "indifferent", "romantic", "funny"];

    if (!mode || !validModes.includes(mode)) {
      return new Response(JSON.stringify({ error: 'Invalid mode parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!tone || !validTones.includes(tone)) {
      return new Response(JSON.stringify({ error: 'Invalid tone parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if premium
    const isPremium = premiumStore[clientId] === true;

    // Handle trial logic for non-premium users
    if (!isPremium) {
      const now = Date.now();
      
      // Initialize trial if first time
      if (!trialStore[clientId]) {
        trialStore[clientId] = {
          trialStart: now,
          usedCount: 0
        };
      }

      const trial = trialStore[clientId];
      const trialDuration = TRIAL_DAYS * 24 * 60 * 60 * 1000; // days to ms
      const expiresAt = trial.trialStart + trialDuration;

      // Check if trial expired by time or usage
      const isExpiredByTime = now > expiresAt;
      const isExpiredByUsage = trial.usedCount >= TRIAL_LIMIT;

      if (isExpiredByTime || isExpiredByUsage) {
        return new Response(JSON.stringify({
          error: 'trial_expired',
          message: 'Seu período de teste do Xaveco acabou.',
          trial: {
            usedCount: trial.usedCount,
            limit: TRIAL_LIMIT,
            trialStart: trial.trialStart,
            expiresAt: expiresAt
          }
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Increment usage count
      trial.usedCount++;
    }

    // Build prompt based on mode and tone
    let systemPrompt = `Você é o Xaveco, um wingman digital especialista em criar mensagens de paquera em português brasileiro.
Gere 2 a 4 sugestões de mensagens curtas e criativas.
Tom: ${tone}
Modo: ${mode === 'reply' ? 'responder' : mode === 'initiate' ? 'iniciar conversa' : 'criar tensão sexual'}

IMPORTANTE: Responda APENAS com um array JSON de strings, sem texto adicional.
Exemplo: ["mensagem 1", "mensagem 2", "mensagem 3"]`;

    const userPrompt = input ? `Contexto: ${input}` : 'Gere sugestões criativas.';

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    // Parse suggestions
    let suggestions: string[] = [];
    try {
      const parsed = JSON.parse(generatedText);
      if (Array.isArray(parsed)) {
        suggestions = parsed.filter((s: any) => typeof s === 'string').slice(0, 4);
      }
    } catch (e) {
      console.error('Failed to parse OpenAI response as JSON:', generatedText);
      suggestions = ["Ops! Tente novamente."];
    }

    // Build response
    const trial = trialStore[clientId];
    const trialDuration = TRIAL_DAYS * 24 * 60 * 60 * 1000;
    const expiresAt = trial ? trial.trialStart + trialDuration : Date.now();

    return new Response(JSON.stringify({
      suggestions,
      trial: trial ? {
        usedCount: trial.usedCount,
        limit: TRIAL_LIMIT,
        trialStart: trial.trialStart,
        expiresAt: expiresAt
      } : undefined,
      premium: isPremium
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in xaveco function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
