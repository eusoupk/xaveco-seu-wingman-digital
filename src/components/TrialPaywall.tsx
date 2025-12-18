import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import trialHero from "@/assets/trial-hero.jpg";
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [trialHero];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      <PixelBackground showCity={false} />
      
      <PixelCard className="max-w-md w-full p-6 space-y-5 z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <PixelHeart className="w-12 h-12 mx-auto mb-2" />
          <h1 className="font-pixel text-lg text-pixel-yellow">
            Destravar Premium
          </h1>
          <p className="font-pixel text-[10px] text-muted-foreground leading-relaxed">
            Você usou seus 2 testes gratuitos.<br/>
            Para continuar, assine o Premium.
          </p>
        </div>

        {/* Hero Image */}
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-sm border-2 border-pixel-purple-light/30"
               style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.3)' }}>
            <img 
              src={slides[currentSlide]} 
              alt="Casal se divertindo"
              className="w-full h-48 object-cover"
            />
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-foreground">
            <div className="w-5 h-5 bg-pixel-green flex items-center justify-center rounded-sm">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="font-pixel text-[10px]">Xavecos ilimitados</span>
          </div>
          <div className="flex items-center gap-3 text-foreground">
            <div className="w-5 h-5 bg-pixel-green flex items-center justify-center rounded-sm">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="font-pixel text-[10px]">Cancele quando quiser</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleCheckoutClick}
          size="lg"
          className="w-full font-pixel text-xs py-6 bg-pixel-green hover:bg-pixel-green-dark text-white border-b-4 border-pixel-green-dark hover:border-b-2 hover:translate-y-[2px] active:border-b-0 active:translate-y-1 transition-all duration-75 rounded-sm"
          style={{ boxShadow: '0 4px 0 hsl(120 60% 30%)' }}
        >
          Premium — R$19,90/semana
        </Button>

        {/* Bottom Links */}
        <div className="flex items-center justify-center gap-6 pt-2">
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
