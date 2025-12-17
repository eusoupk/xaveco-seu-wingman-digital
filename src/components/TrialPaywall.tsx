import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";
import trialHero from "@/assets/trial-hero.jpg";
import { xavecoClient } from "@/lib/xavecoClient";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [loadingPromo, setLoadingPromo] = useState(false);
  const slides = [trialHero];

  // Checkout normal R$19,90
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

  // Checkout promocional R$1
  const handlePromoClick = async () => {
    setLoadingPromo(true);
    const clientId = xavecoClient.getClientId();

    try {
      supabase.functions.invoke("analytics", {
        body: { type: "checkout_click_promo", clientId },
      }).catch(() => {});
    } catch {}

    try {
      const response = await xavecoClient.createPromoCheckout();
      if (response.ok && response.url) {
        window.location.href = response.url;
      } else {
        toast.error("Erro ao criar checkout promocional");
      }
    } catch (error: any) {
      if (error.message?.includes("promo_already_used")) {
        toast.error("Você já utilizou esta promoção. Use o checkout normal.");
        // Fallback para checkout normal
        handleCheckoutClick();
      } else if (error.message?.includes("already_premium")) {
        toast.success("Você já é assinante premium!");
      } else {
        toast.error(error.message || "Erro ao iniciar checkout");
      }
    } finally {
      setLoadingPromo(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-purple-900 via-purple-950 to-gray-950">
      <Card className="max-w-md w-full bg-gradient-to-b from-purple-900/50 via-purple-950/50 to-gray-950/50 border-purple-800/30 backdrop-blur-sm p-8 space-y-6">
        {/* Promo Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-full">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-300">Oferta de Entrada</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-white">
            Destrave o Xaveco por 7 dias
          </h1>
          <p className="text-purple-200/80 text-base">
            por apenas <span className="text-2xl font-bold text-green-400">R$1</span>
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
            <span className="text-sm font-medium">7 dias de acesso completo</span>
          </div>
          <div className="flex items-center gap-2 text-purple-100">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium">Xavecos ilimitados</span>
          </div>
          <div className="flex items-center gap-2 text-purple-100">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium">Cancele quando quiser</span>
          </div>
        </div>

        {/* Promo CTA Button */}
        <Button
          onClick={handlePromoClick}
          disabled={loadingPromo}
          size="lg"
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-600/30 transition-all hover:scale-[1.02]"
        >
          {loadingPromo ? "Carregando..." : "Ativar por R$1 💎"}
        </Button>

        {/* Transparency Notice - OBRIGATÓRIO */}
        <div className="bg-purple-950/50 border border-purple-700/30 rounded-lg p-3">
          <p className="text-center text-xs text-purple-200/90">
            Acesso por <strong>R$1</strong> nos primeiros 7 dias.<br/>
            Após esse período, a assinatura será renovada automaticamente por <strong>R$19,90/semana</strong>.
          </p>
        </div>

        {/* Normal Price Option */}
        <button
          onClick={handleCheckoutClick}
          className="w-full text-center text-sm text-purple-300/70 hover:text-purple-200 underline transition-colors"
        >
          Ou assine direto por R$19,90/semana
        </button>

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
