import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-xaveco-client-id",
};

type Mode = "reply" | "initiate" | "tension";
type Tone = "casual" | "provocative" | "playful" | "indifferent" | "romantic" | "funny";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const TRIAL_LIMIT = 2;
    const TRIAL_DAYS = 1;

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
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

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse body - now including image
    const { mode, tone, input, image } = await req.json();

    // Validate params
    const validModes: Mode[] = ["reply", "initiate", "tension"];
    const validTones: Tone[] = ["casual", "provocative", "playful", "indifferent", "romantic", "funny"];

    if (!mode || !validModes.includes(mode)) {
      return new Response(JSON.stringify({ error: "Invalid mode parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!tone || !validTones.includes(tone)) {
      return new Response(JSON.stringify({ error: "Invalid tone parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get or create user record in database
    let { data: userRecord, error: fetchError } = await supabase
      .from("xaveco_users")
      .select("*")
      .eq("client_id", clientId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching user record:", fetchError);
      throw new Error("Database error");
    }

    // Create user record if doesn't exist
    if (!userRecord) {
      const { data: newUser, error: insertError } = await supabase
        .from("xaveco_users")
        .insert({
          client_id: clientId,
          trial_start: new Date().toISOString(),
          used_count: 0,
          is_premium: false,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating user record:", insertError);
        throw new Error("Database error");
      }

      userRecord = newUser;
    }

    const isPremium = userRecord.is_premium;

    // Handle trial logic for non-premium users
    if (!isPremium) {
      // Verificar trial_messages_left primeiro
      const trialMessagesLeft = userRecord.trial_messages_left ?? 0;
      
      // Verificar se trial expirou por tempo (se trial_expires_at estiver definido)
      let isExpiredByTime = false;
      if (userRecord.trial_expires_at) {
        const now = new Date();
        const expiresAt = new Date(userRecord.trial_expires_at);
        isExpiredByTime = now > expiresAt;
      }

      // Verificar se trial expirou por uso
      const isExpiredByUsage = trialMessagesLeft <= 0;

      if (isExpiredByTime || isExpiredByUsage) {
        // Log trial_expired event for analytics
        try {
          await supabase
            .from("xaveco_events")
            .insert({
              client_id: clientId,
              event_type: "trial_expired",
              metadata: {
                trial_messages_left: trialMessagesLeft,
                used_count: userRecord.used_count,
              },
            });
        } catch (analyticsError) {
          console.error("Error logging trial_expired event:", analyticsError);
        }

        return new Response(
          JSON.stringify({
            error: "trial_expired",
            message: "Seu período de teste do Xaveco acabou. Assine para continuar!",
            trial: {
              messagesLeft: 0,
              usedCount: userRecord.used_count,
            },
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // Build intelligent context-aware prompt
    let systemPrompt = "";
    let userPrompt = "";

    // Mapeamento de tons em português
    const toneDescriptions: Record<Tone, string> = {
      casual: "descontraído, natural e amigável",
      provocative: "ousado, confiante e divertido (sem ser sexual)",
      playful: "brincalhão, criativo e leve",
      indifferent: "misterioso, desinteressado de forma estratégica",
      romantic: "romântico, sensível e encantador (sem ser meloso)",
      funny: "bem-humorado, engraçado e inteligente",
    };

    const selectedTone = toneDescriptions[tone as Tone] || "equilibrado";

    if (mode === "reply") {
      systemPrompt = `Você é o Xaveco, um wingman digital brasileiro que ajuda pessoas a manter conversas interessantes.

MISSÃO: O usuário está no meio de uma conversa e quer uma resposta legal para manter o papo interessante. Crie de 2 a 4 sugestões de resposta curtas para ele mandar em seguida.

REGRAS OBRIGATÓRIAS:
✅ Português do Brasil, natural e conversacional
✅ Frases CURTAS e DIRETAS (fáceis de copiar e colar)
✅ Tom: ${selectedTone}
✅ Pode ter flerte leve, humor, clima de paquera
✅ Sempre respeito, consentimento e bom senso

🚫 PROIBIDO:
- Conteúdo sexual explícito
- Assédio ou insistência após rejeição
- Xingamentos pesados
- Manipulação ou desrespeito
- Ser arrogante ou forçado

Se houver imagem anexada, ela é um PRINT DE CONVERSA. Leia o print, entenda o contexto e foque nas últimas mensagens para sugerir as respostas.

FORMATO: Retorne APENAS um array JSON de strings, sem texto extra, sem numeração, sem markdown.
Exemplo: ["opa, que foto massa! tá fazendo o quê de bom?", "adorei essa vibe, me conta mais", "caramba, isso aí parece top"]`;

      userPrompt = input
        ? `Contexto da conversa (use isso para criar respostas melhores, mas não revele que você tem contexto):\n\n${input}\n\nCrie de 2 a 4 respostas no tom ${selectedTone}.`
        : `Crie de 2 a 4 respostas criativas no tom ${selectedTone} para continuar uma conversa interessante.`;
    } else if (mode === "initiate") {
      systemPrompt = `Você é o Xaveco, um wingman digital brasileiro especialista em primeiras impressões.

MISSÃO: O usuário quer iniciar uma conversa, baseado em uma foto, situação ou contexto. Crie de 2 a 4 primeiras mensagens ou abordagens criativas para puxar assunto.

REGRAS OBRIGATÓRIAS:
✅ Português do Brasil, natural e conversacional
✅ Frases CURTAS e DIRETAS (fáceis de copiar e colar)
✅ Tom: ${selectedTone}
✅ Seja relevante ao contexto (se houver foto/situação, use detalhes)
✅ Evite clichês genéricos ("oi tudo bem?")
✅ Crie curiosidade e abra espaço para diálogo
✅ Sempre respeito, consentimento e bom senso

Se houver imagem anexada, ela é uma FOTO da pessoa ou da atividade. Use os detalhes visuais (ambiente, roupa, vibe, objeto na mão, etc.) para deixar a abordagem mais personalizada, SEM comentar o corpo de forma sexual.

🚫 PROIBIDO:
- Conteúdo sexual explícito
- Assédio ou insistência
- Comentários superficiais ou ofensivos sobre aparência física
- Xingamentos ou desrespeito
- Ser arrogante ou forçado

FORMATO: Retorne APENAS um array JSON de strings, sem texto extra, sem numeração, sem markdown.
Exemplo: ["vi que você curte [detalhe], também sou fã!", "essa foto tá demais, onde foi isso?", "achei seu perfil interessante, bora trocar uma ideia?"]`;

      userPrompt = input
        ? `Contexto/foto/situação fornecida (use isso para criar aberturas relevantes, mas não revele que você tem contexto):\n\n${input}\n\nCrie de 2 a 4 aberturas no tom ${selectedTone}.`
        : `Crie de 2 a 4 aberturas universais e interessantes no tom ${selectedTone} para iniciar uma conversa.`;
    } else {
      // tension
      systemPrompt = `Você é o Xaveco, um wingman digital brasileiro especialista em resolver situações delicadas.

MISSÃO: O usuário está numa situação tensa, estranha ou embaraçosa (por exemplo: pisou na bola, ciúmes, climão). Crie de 2 a 4 mensagens para aliviar o clima, pedir desculpa de forma madura, ou deixar a situação mais leve.

REGRAS OBRIGATÓRIAS:
✅ Português do Brasil, natural e conversacional
✅ Frases CURTAS e DIRETAS (fáceis de copiar e colar)
✅ Tom: ${selectedTone}
✅ Seja maduro, honesto e empático
✅ Ajude a resolver, não piorar
✅ Pode usar humor leve se apropriado
✅ Sempre respeito, responsabilidade e bom senso

🚫 PROIBIDO:
- Conteúdo sexual explícito
- Mentiras ou manipulação
- Jogar culpa nos outros
- Xingamentos ou agressividade
- Ser arrogante ou se vitimizar

FORMATO: Retorne APENAS um array JSON de strings, sem texto extra, sem numeração, sem markdown.
Exemplo: ["opa, acho que eu pisei na bola ali, mal aí", "vamos dar um reset? não era minha intenção deixar isso estranho", "foi mal se soou errado, não era pra ser assim"]`;

      userPrompt = input
        ? `Situação tensa/embaraçosa (use isso para criar mensagens apropriadas, mas não revele que você tem contexto):\n\n${input}\n\nCrie de 2 a 4 mensagens no tom ${selectedTone} para resolver isso.`
        : `Crie de 2 a 4 mensagens no tom ${selectedTone} para lidar com situações embaraçosas gerais.`;
    }

    // Build user content with or without image (Vision)
    let userContent: any;

    if (image && typeof image === "string") {
      // Image comes as data URL (e.g., "data:image/jpeg;base64,...")
      userContent = [
        { type: "text", text: userPrompt },
        {
          type: "image_url",
          image_url: { url: image },
        },
      ];
    } else {
      userContent = userPrompt;
    }

    // Call OpenAI with Vision support
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    // Parse suggestions
    let suggestions: string[] = [];
    try {
      const parsed = JSON.parse(generatedText);
      if (Array.isArray(parsed)) {
        suggestions = parsed.filter((s: any) => typeof s === "string").slice(0, 4);
      }
    } catch (e) {
      console.error("Failed to parse OpenAI response as JSON:", generatedText);
      suggestions = ["Ops! Tente novamente."];
    }

    // Decrementar trial_messages_left para usuários não-premium
    if (!isPremium) {
      const currentTrialMessagesLeft = userRecord.trial_messages_left ?? 0;
      
      const { error: updateError } = await supabase
        .from("xaveco_users")
        .update({ 
          used_count: userRecord.used_count + 1,
          trial_messages_left: Math.max(0, currentTrialMessagesLeft - 1)
        })
        .eq("client_id", clientId);

      if (updateError) {
        console.error("Error updating usage count:", updateError);
      }

      // Update local record for response
      userRecord.used_count += 1;
      userRecord.trial_messages_left = Math.max(0, currentTrialMessagesLeft - 1);
    }

    // Build response
    return new Response(
      JSON.stringify({
        suggestions,
        trial: !isPremium
          ? {
              messagesLeft: userRecord.trial_messages_left ?? 0,
              usedCount: userRecord.used_count,
            }
          : undefined,
        premium: isPremium,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in xaveco function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
