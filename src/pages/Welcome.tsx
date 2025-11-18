import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import xavecoIcon from "@/assets/xaveco-icon.png";
import { xavecoClient } from "@/lib/xavecoClient";
import { supabase } from "@/integrations/supabase/client";

const Welcome = () => {
  const navigate = useNavigate();

  const handleCheckoutClick = async () => {
    const CHECKOUT_URL = "https://buy.stripe.com/your-checkout-url-here"; // IMPORTANTE: Substituir pela URL do Stripe Checkout para R$ 19,90/semana
    const clientId = xavecoClient.getClientId();

    // Fire-and-forget analytics
    try {
      supabase.functions.invoke("analytics", {
        body: {
          type: "checkout_click_welcome",
          clientId: clientId,
        },
      }).catch(() => {});
    } catch {
      // Ignora erro de analytics
    }

    // Redireciona para Stripe
    window.location.href = `${CHECKOUT_URL}?client_reference_id=${clientId}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-6 pb-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md w-full">
        <img src={xavecoIcon} alt="Xaveco" className="w-32 h-32 mb-6 animate-bounce" />
        <h1 className="text-5xl font-black text-foreground mb-4 tracking-tight">
          Xaveco
        </h1>
        <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
          Desenrola com estilo 🏖️
          <br />
          <span className="text-base">
            O app brasileiro pra você parar de travar na hora de falar com ela
          </span>
        </p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <p className="text-xs text-center text-muted-foreground px-4">
          Ao tocar em Começar, você concorda com o nosso{" "}
          <span className="underline">Termos de Serviço</span> e{" "}
          <span className="underline">Política de Privacidade</span>
        </p>
        <Button
          size="lg"
          onClick={handleCheckoutClick}
          className="w-full h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
        >
          Quero destravar minha coragem 💥
        </Button>
        <button
          onClick={() => navigate("/trial")}
          className="text-sm text-muted-foreground hover:text-foreground underline transition-colors w-full text-center"
        >
          Quero testar antes
        </button>
      </div>
    </div>
  );
};

export default Welcome;
