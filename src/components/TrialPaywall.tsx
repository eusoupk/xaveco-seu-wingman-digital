import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import pixelCouple from "@/assets/pixel-couple.png";
import { xavecoClient } from "@/lib/xavecoClient";
import { supabase } from "@/integrations/supabase/client";
import { PixelBackground, PixelHeart, PixelCard } from "@/components/PixelBackground";
import { pixelSound } from "@/lib/pixelSound";

interface TrialPaywallProps {
  visible: boolean;
  trialInfo: any;
  onUpgrade: () => void;
  onAlreadyHaveAccess: () => void;
}

export function TrialPaywall({
  visible,
  trialInfo,
  onUpgrade,
  onAlreadyHaveAccess,
}: TrialPaywallProps) {
  const handleCheckoutClick = async () => {
    pixelSound.playStart();
    const CHECKOUT_URL = "https://buy.stripe.com/3cI3cveNM7A95mj1l69oc03";
    const clientId = xavecoClient.getClientId();

    try {
      supabase.functions.invoke("analytics", {
        body: { type: "checkout_click_trial", clientId },
      }).catch(() => {});
    } catch {}

    window.location.href = `${CHECKOUT_URL}?client_reference_id=${clientId}`;
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <PixelBackground showCity={false} />
      
      <PixelCard className="max-w-md w-full p-5 space-y-4 z-10 my-auto">
        {/* Header */}
        <div className="text-center space-y-2">
          <PixelHeart className="w-10 h-10 mx-auto mb-1" />
          <h1 className="font-pixel text-lg text-pixel-yellow">
            Destravar Premium
          </h1>
          <p className="font-pixel text-[10px] text-pixel-yellow leading-relaxed">
            🔥 Sua mensagem já está pronta.
          </p>
        </div>

        {/* Main copy */}
        <div className="text-center space-y-2">
          <p className="font-pixel text-[10px] text-foreground leading-relaxed">
            A gente analisou a conversa e criou a melhor mensagem pra você enviar agora.
          </p>
          <p className="font-pixel text-[10px] text-foreground leading-relaxed">
            Ela já está pronta.
          </p>
          <p className="font-pixel text-[10px] text-foreground leading-relaxed">
            Falta só desbloquear para copiar e mandar.
          </p>
        </div>

        {/* Social proof */}
        <p className="font-pixel text-[8px] text-muted-foreground text-center leading-relaxed">
          🔥 Mais de 1.300 pessoas já usaram para não serem ignoradas.
        </p>

        {/* Pixel Art Image */}
        <div className="relative overflow-hidden rounded-sm border-2 border-pixel-purple-light/30"
             style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.3)' }}>
          <img 
            src={pixelCouple} 
            alt="Casal pixel art com rosa e corações"
            className="w-full h-48 object-contain bg-pixel-purple-mid"
          />
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-foreground">
            <div className="w-5 h-5 bg-pixel-green flex items-center justify-center rounded-sm flex-shrink-0">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="font-pixel text-[10px]">Mensagens personalizadas pra cada situação</span>
          </div>
          <div className="flex items-center gap-3 text-foreground">
            <div className="w-5 h-5 bg-pixel-green flex items-center justify-center rounded-sm flex-shrink-0">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="font-pixel text-[10px]">Nunca mais travar na conversa</span>
          </div>
          <div className="flex items-center gap-3 text-foreground">
            <div className="w-5 h-5 bg-pixel-green flex items-center justify-center rounded-sm flex-shrink-0">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="font-pixel text-[10px]">Cancele quando quiser</span>
          </div>
        </div>

        {/* Micro urgency */}
        <p className="font-pixel text-[9px] text-pixel-yellow text-center leading-relaxed">
          ⚡ Sua resposta está bloqueada esperando você.
        </p>

        {/* CTA Button */}
        <Button
          onClick={handleCheckoutClick}
          size="lg"
          className="w-full font-pixel text-[9px] sm:text-xs py-6 bg-pixel-green hover:bg-pixel-green-dark text-white border-b-4 border-pixel-green-dark hover:border-b-2 hover:translate-y-[2px] active:border-b-0 active:translate-y-1 transition-all duration-75 rounded-sm leading-relaxed"
          style={{ boxShadow: '0 4px 0 hsl(120 60% 30%)' }}
        >
          Ver minha mensagem agora — R$19,90/semana
        </Button>

        {/* Bottom Links */}
        <div className="flex items-center justify-center gap-6 pt-1">
          <button
            onClick={onAlreadyHaveAccess}
            className="font-pixel text-[8px] text-muted-foreground hover:text-pixel-purple-light underline transition-colors"
          >
            Restaurar acesso
          </button>
          <button
            onClick={() => alert("Termos ainda não disponíveis")}
            className="font-pixel text-[8px] text-muted-foreground hover:text-pixel-purple-light underline transition-colors"
          >
            Termos
          </button>
        </div>
      </PixelCard>
    </div>
  );
}
