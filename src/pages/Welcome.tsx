import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import xavecoIcon from "@/assets/xaveco-icon.png";
import { xavecoClient } from "@/lib/xavecoClient";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
const Welcome = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    // Checar status premium ao carregar
    const checkPremiumStatus = async () => {
      try {
        const result = await xavecoClient.checkStatus();
        if (result.isPremium) {
          console.log('✅ User is premium, redirecting to wizard');
          navigate("/wizard");
          return;
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
      } finally {
        setChecking(false);
      }
    };
    checkPremiumStatus();
  }, [navigate]);
  const handleCheckoutClick = async () => {
    const CHECKOUT_URL = "https://buy.stripe.com/3cI3cveNM7A95mj1l69oc03";
    const clientId = xavecoClient.getClientId();

    // Fire-and-forget analytics
    try {
      supabase.functions.invoke("analytics", {
        body: {
          type: "checkout_click_welcome",
          clientId: clientId
        }
      }).catch(() => {});
    } catch {
      // Ignora erro de analytics
    }

    // Redireciona para Stripe com client_reference_id
    window.location.href = `${CHECKOUT_URL}?client_reference_id=${clientId}`;
  };
  const handleTrialClick = () => {
    navigate("/trial");
  };
  if (checking) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={xavecoIcon} alt="Xaveco" className="w-24 h-24 mb-4 mx-auto animate-bounce" />
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background flex flex-col items-center justify-between p-6 pb-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md w-full">
        <img alt="Xaveco" className="w-32 h-32 mb-6 animate-bounce" src="/lovable-uploads/ada81d60-eafb-42e3-b3c2-a554a0d578a9.png" />
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
        <Button size="lg" onClick={handleCheckoutClick} className="w-full h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
          Quero destravar minha coragem 💥
        </Button>
        <button onClick={handleTrialClick} className="text-sm text-muted-foreground hover:text-foreground underline transition-colors w-full text-center">
          Quero testar antes
        </button>
      </div>
    </div>;
};
export default Welcome;