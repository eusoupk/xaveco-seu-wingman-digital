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

    // Build intelligent context-aware prompt
    let systemPrompt = '';
    let userPrompt = '';

    if (mode === 'reply') {
      systemPrompt = `Você é o Xaveco, um wingman digital especialista em análise social e comunicação romântica em português brasileiro.

MISSÃO: Analise a conversa/print fornecido e crie 3 respostas perfeitas que:
1. Correspondam ao TOM solicitado (${tone})
2. Mantenham o contexto da conversa
3. Sejam naturais e não forçadas
4. Gerem interesse ou avancem a interação

ANÁLISE CONTEXTUAL:
- Identifique o nível de intimidade atual
- Detecte sinais de interesse (ou falta dele)
- Avalie o humor/energia da conversa
- Considere o timing (primeira mensagem? continuação? resposta atrasada?)

TONS EXPLICADOS:
- casual: descontraído, amigável, leve
- provocative: ousado, confiante, com tensão
- playful: brincalhão, divertido, com piadas
- indifferent: indiferente com classe, mysterioso
- romantic: romântico, sensível, emocional
- funny: humorístico, engraçado, leve

FORMATO: Retorne APENAS um array JSON com 3 strings.
Exemplo: ["resposta 1", "resposta 2", "resposta 3"]`;

      userPrompt = input 
        ? `CONTEXTO DA CONVERSA:\n${input}\n\nAnalise o contexto acima e gere 3 respostas inteligentes no tom "${tone}".`
        : `Gere 3 respostas criativas no tom "${tone}" para iniciar ou continuar uma conversa interessante.`;

    } else if (mode === 'initiate') {
      systemPrompt = `Você é o Xaveco, especialista em primeiras impressões e abordagens iniciais em português brasileiro.

MISSÃO: Baseado na foto/situação, crie 3 aberturas perfeitas que:
1. Sejam relevantes ao contexto visual/situacional
2. Usem o TOM solicitado (${tone})
3. Não sejam genéricas ou clichês
4. Criem curiosidade e abram espaço para diálogo

ANÁLISE CONTEXTUAL:
- Se houver foto: observe detalhes (local, atividade, estilo, expressão)
- Se houver situação: entenda o cenário e oportunidades
- Identifique "ganchos" naturais para conversa
- Evite comentários superficiais sobre aparência

TONS EXPLICADOS:
- casual: natural, simples, amigável
- provocative: ousado, direto, com confiança
- playful: brincalhão, criativo, leve
- indifferent: misterioso, desinteressado estrategicamente
- romantic: poético, sensível, encantador
- funny: bem-humorado, divertido, inteligente

FORMATO: Retorne APENAS um array JSON com 3 strings.
Exemplo: ["abertura 1", "abertura 2", "abertura 3"]`;

      userPrompt = input
        ? `CONTEXTO/FOTO:\n${input}\n\nCrie 3 aberturas criativas e contextualizadas no tom "${tone}".`
        : `Crie 3 aberturas universais e interessantes no tom "${tone}" para iniciar uma conversa.`;

    } else { // tension
      systemPrompt = `Você é o Xaveco, especialista em gestão de situações sociais delicadas e recuperação de conversas em português brasileiro.

MISSÃO: Analise a situação embaraçosa e crie 3 saídas inteligentes que:
1. Dissolvam o constrangimento naturalmente
2. Usem o TOM solicitado (${tone})
3. Recuperem ou redirecionem a interação
4. Demonstrem inteligência emocional

ANÁLISE CONTEXTUAL:
- Identifique a fonte do embaraço
- Avalie a gravidade da situação
- Detecte possíveis saídas honrosas
- Considere o relacionamento entre as pessoas

ESTRATÉGIAS:
- casual: normalize a situação com leveza
- provocative: assuma com confiança, vire o jogo
- playful: use humor para desarmar
- indifferent: minimize com indiferença calculada
- romantic: use vulnerabilidade autêntica
- funny: ria da situação, quebre o gelo

FORMATO: Retorne APENAS um array JSON com 3 strings.
Exemplo: ["saída 1", "saída 2", "saída 3"]`;

      userPrompt = input
        ? `SITUAÇÃO EMBARAÇOSA:\n${input}\n\nAnalise e crie 3 formas inteligentes de lidar com isso no tom "${tone}".`
        : `Crie 3 frases para lidar com situações embaraçosas gerais no tom "${tone}".`;
    }

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
