import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { xavecoClient } from "@/lib/xavecoClient";
import { useEffect, useState } from "react";
import { Heart, Mail, Settings, Sparkles } from "lucide-react";
import { PixelBackground, PixelHeart } from "@/components/PixelBackground";
import { pixelSound } from "@/lib/pixelSound";

const Welcome = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
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
    pixelSound.playStart();
    navigate("/trial");
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <PixelBackground />
        <div className="text-center z-10">
          <PixelHeart className="w-16 h-16 mx-auto mb-4 animate-bounce" />
          <p className="text-muted-foreground font-pixel text-xs">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-6 pb-8 relative overflow-hidden">
      <PixelBackground />
      
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md w-full z-10">
        <PixelHeart className="w-24 h-24 mb-4 animate-pulse" />
        
        <h1 className="font-pixel text-3xl sm:text-4xl text-foreground mb-4 tracking-wide"
            style={{
              textShadow: '3px 3px 0 hsl(0 70% 40%), 6px 6px 0 rgba(0,0,0,0.3)',
              color: '#ff6b6b'
            }}>
          XAVECO
        </h1>
        
        <p className="font-pixel text-sm text-pixel-yellow mb-6">
          Desenrola com estilo ❤️🔥
        </p>
        
        <p className="font-pixel text-[10px] text-muted-foreground mb-8 leading-relaxed px-4">
          O app brasileiro pra você parar de travar na hora de falar com ela
        </p>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex flex-col gap-3">
            <Heart className="w-6 h-6 text-pixel-pink opacity-70" />
            <Mail className="w-6 h-6 text-pixel-purple-light opacity-70" />
          </div>
          
          <Button 
            size="lg" 
            onClick={handleStartTrial} 
            className="font-pixel text-sm px-8 py-6 bg-pixel-green hover:bg-pixel-green-dark text-white border-b-4 border-pixel-green-dark hover:border-b-2 hover:translate-y-[2px] active:border-b-0 active:translate-y-1 transition-all duration-75 rounded-sm shadow-lg"
            style={{
              boxShadow: '0 4px 0 hsl(120 60% 30%), 0 6px 10px rgba(0,0,0,0.3)'
            }}
          >
            Começar
          </Button>
          
          <div className="flex flex-col gap-3">
            <Settings className="w-6 h-6 text-muted-foreground opacity-70" />
            <Sparkles className="w-6 h-6 text-pixel-yellow opacity-70" />
          </div>
        </div>

        <p className="font-pixel text-[8px] text-center text-muted-foreground px-4 leading-relaxed">
          <span className="underline decoration-pixel-purple-light cursor-pointer hover:text-pixel-purple-light">
            Termos de servicios
          </span>
          {" "}e{" "}
          <span className="underline decoration-pixel-purple-light cursor-pointer hover:text-pixel-purple-light">
            Política de privacidade
          </span>
        </p>
      </div>
    </div>
  );
};

export default Welcome;
