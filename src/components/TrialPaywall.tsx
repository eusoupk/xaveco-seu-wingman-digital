import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import trialHero from "@/assets/trial-hero.jpg";
import { xavecoClient } from "@/lib/xavecoClient";
import { supabase } from "@/integrations/supabase/client";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-purple-900 via-purple-950 to-gray-950">
      <Card className="max-w-md w-full bg-gradient-to-b from-purple-900/50 via-purple-950/50 to-gray-950/50 border-purple-800/30 backdrop-blur-sm p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-white">
            Destravar Premium
          </h1>
          <p className="text-purple-200/80 text-base">
            Você usou seus 2 testes gratuitos.<br/>
            Para continuar usando o Xaveco, assine o plano Premium.
          </p>
        </div>

        {/* Hero Image */}
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <img 
              src={slides[currentSlide]} 
              alt="Casal se divertindo"
              className="w-full h-64 object-cover"
            />
          </div>
          
          <div className="flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white w-6' : 'bg-white/40'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-purple-100">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium">Xavecos ilimitados</span>
          </div>
          <div className="flex items-center gap-2 text-purple-100">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium">Cancele quando quiser</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleCheckoutClick}
          size="lg"
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02]"
        >
          Destravar Premium — R$19,90/semana
        </Button>

        {/* Bottom Links */}
        <div className="flex items-center justify-center gap-6 pt-2">
          <button
            onClick={onAlreadyHaveAccess}
            className="text-sm text-purple-300/80 hover:text-purple-200 underline transition-colors"
          >
            Restaurar acesso
          </button>
          <button
            onClick={() => alert("Termos ainda não disponíveis")}
            className="text-sm text-purple-300/80 hover:text-purple-200 underline transition-colors"
          >
            Termos
          </button>
        </div>
      </Card>
    </div>
  );
}