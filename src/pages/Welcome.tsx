import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { xavecoClient } from "@/lib/xavecoClient";
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
  const handleStartTrial = () => {
    navigate("/trial");
  };
  if (checking) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img alt="Xaveco" className="w-24 h-24 mb-4 mx-auto animate-bounce" src="/lovable-uploads/60cda92c-f044-47d4-a8d5-998548807f4f.jpg" />
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background flex flex-col items-center justify-between p-6 pb-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md w-full">
        <img alt="Xaveco" className="w-32 h-32 mb-6 animate-bounce" src="/lovable-uploads/83212dba-4f69-47c7-8e61-cf2ab51be0c2.png" />
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
        <Button size="lg" onClick={handleStartTrial} className="w-full h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
          Quero destravar minha coragem 💥
        </Button>
      </div>
    </div>;
};
export default Welcome;