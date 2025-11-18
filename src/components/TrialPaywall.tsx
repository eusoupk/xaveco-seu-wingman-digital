import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import trialHero from "@/assets/trial-hero.jpg";
import { xavecoClient } from "@/lib/xavecoClient";

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
  const slides = [trialHero]; // Can add more images later

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-purple-900 via-purple-950 to-gray-950">
      <Card className="max-w-md w-full bg-gradient-to-b from-purple-900/50 via-purple-950/50 to-gray-950/50 border-purple-800/30 backdrop-blur-sm p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-white">
            Melhore sua vida social
          </h1>
          <p className="text-purple-200/80 text-base">
            Fique melhor em puxar assunto e responder mensagens
          </p>
        </div>

        {/* Hero Image Carousel */}
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <img 
              src={slides[currentSlide]} 
              alt="Casal se divertindo"
              className="w-full h-64 object-cover"
            />
          </div>
          
          {/* Carousel Dots */}
          <div className="flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-white w-6' 
                    : 'bg-white/40'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* No Payment Now */}
        <div className="flex items-center justify-center gap-2 text-purple-100">
          <Check className="w-5 h-5 text-green-400" />
          <span className="text-sm font-medium">Nenhuma cobrança agora</span>
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => {
            const CHECKOUT_URL = "https://buy.stripe.com/4gMbJ1eNM3jT9Cz3te9oc02";
            const clientId = xavecoClient.getClientId();
            window.location.href = `${CHECKOUT_URL}?client_id=${clientId}`;
          }}
          size="lg"
          className="w-full h-14 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02]"
        >
          Testar de graça 🙌
        </Button>

        {/* Pricing Text */}
        <p className="text-center text-sm text-purple-300/70">
          3 dias grátis, depois R$ 39,90/semana
        </p>

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
