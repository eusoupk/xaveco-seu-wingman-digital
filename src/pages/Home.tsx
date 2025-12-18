import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { xavecoClient, CheckResponse } from "@/lib/xavecoClient";
import { PixelBackground, PixelHeart, PixelCard } from "@/components/PixelBackground";

interface ModeCardProps {
  emoji: string;
  title: string;
  description: string;
  stars: number;
  tipsCount: string;
  onClick: () => void;
}

const ModeCard = ({ emoji, title, description, stars, tipsCount, onClick }: ModeCardProps) => {
  return (
    <PixelCard onClick={onClick} className="hover:scale-[1.02] transition-transform">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="text-4xl">{emoji}</div>
        <h3 className="font-pixel text-xs text-pixel-yellow">{title}</h3>
        <p className="font-pixel text-[8px] text-muted-foreground leading-relaxed">{description}</p>
        <div className="flex gap-1 text-pixel-yellow text-xs">
          {Array.from({ length: stars }).map((_, i) => (
            <span key={i}>⭐</span>
          ))}
        </div>
        <p className="font-pixel text-[8px] text-muted-foreground">{tipsCount}</p>
      </div>
    </PixelCard>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<CheckResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPremium = async () => {
      try {
        const result = await xavecoClient.checkStatus();
        console.log("Status checked on /wizard:", result);
        setStatus(result);
        
        if (!result.isPremium && (result.freePlaysLeft ?? 0) <= 0) {
          console.log("Access expired, redirecting to Welcome");
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking status:", error);
      } finally {
        setLoading(false);
      }
    };
    checkPremium();
  }, [navigate]);

  const getExpirationText = () => {
    if (!status) return null;
    
    if (status.isPremium && status.daysLeft !== null && status.daysLeft !== undefined) {
      if (status.daysLeft <= 0) {
        return "Último dia do Premium! 🔥";
      } else if (status.daysLeft === 1) {
        return "Premium expira amanhã! ⚠️";
      } else {
        return `Premium: ${status.daysLeft} dias`;
      }
    } else if (!status.isPremium && status.freePlaysLeft && status.freePlaysLeft > 0) {
      return `${status.freePlaysLeft} jogada${status.freePlaysLeft > 1 ? 's' : ''} grátis`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <PixelBackground />
        <div className="text-center z-10">
          <PixelHeart className="w-16 h-16 mx-auto mb-4 animate-bounce" />
          <p className="font-pixel text-xs text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  const expirationText = getExpirationText();

  return (
    <div className="min-h-screen bg-background p-6 relative overflow-hidden">
      <PixelBackground showCity={false} />
      
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-center mb-8 pt-6">
          <PixelHeart className="w-16 h-16 mx-auto mb-4" />
          <h1 className="font-pixel text-2xl mb-2"
              style={{
                textShadow: '2px 2px 0 hsl(0 70% 40%), 4px 4px 0 rgba(0,0,0,0.3)',
                color: '#ff6b6b'
              }}>
            XAVECO
          </h1>
          <p className="font-pixel text-[10px] text-muted-foreground mb-4">
            Melhore suas habilidades sociais!
          </p>
          
          {expirationText && (
            <div className={`font-pixel text-[10px] px-4 py-2 rounded-sm inline-block ${
              status?.isPremium && status?.daysLeft !== null && status?.daysLeft !== undefined && status.daysLeft <= 1
                ? 'bg-pixel-red/20 text-pixel-red border border-pixel-red/30'
                : status?.isPremium
                  ? 'bg-pixel-green/20 text-pixel-green border border-pixel-green/30'
                  : 'bg-pixel-purple-mid text-pixel-yellow border border-pixel-purple-light/30'
            }`}>
              {expirationText}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <ModeCard 
            emoji="📝" 
            title="Sugestões de respostas" 
            description="Envie uma captura de tela de chat para sugestões inteligentes" 
            stars={5} 
            tipsCount="892.5k dicas" 
            onClick={() => navigate("/response-mode")} 
          />

          <ModeCard 
            emoji="💬" 
            title="Iniciar conversa" 
            description="Upload de foto para iniciar a conversa" 
            stars={5} 
            tipsCount="783.8k dicas" 
            onClick={() => navigate("/start-conversation")} 
          />

          <ModeCard 
            emoji="😰" 
            title="Situação embaraçosa" 
            description="Detalhes da situação para o melhor conselho!" 
            stars={5} 
            tipsCount="649.8k dicas" 
            onClick={() => navigate("/embarrassing-mode")} 
          />
        </div>
      </div>
    </div>
  );
}
