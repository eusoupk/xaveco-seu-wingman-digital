import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { MessageSquare, Image as ImageIcon, Frown } from "lucide-react";
import { xavecoClient, CheckResponse } from "@/lib/xavecoClient";
interface ModeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  stars: number;
  tipsCount: string;
  onClick: () => void;
}
const ModeCard = ({
  icon,
  title,
  description,
  stars,
  tipsCount,
  onClick
}: ModeCardProps) => {
  return <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 cursor-pointer hover:bg-card/90 transition-all hover:scale-[1.02]" onClick={onClick}>
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="text-5xl">{icon}</div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        <div className="flex gap-1 text-yellow-400">
          {Array.from({
          length: stars
        }).map((_, i) => <span key={i}>⭐</span>)}
        </div>
        <p className="text-xs text-muted-foreground">{tipsCount}</p>
      </div>
    </Card>;
};
export default function Home() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<CheckResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar status premium ao carregar a página
  useEffect(() => {
    const checkPremium = async () => {
      try {
        const result = await xavecoClient.checkStatus();
        console.log("Status checked on /wizard:", result);
        setStatus(result);
        
        // Se não é premium e não tem plays grátis, redirecionar para Welcome
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

  // Função para formatar texto de expiração
  const getExpirationText = () => {
    if (!status) return null;
    
    if (status.isPremium && status.daysLeft !== null && status.daysLeft !== undefined) {
      if (status.daysLeft <= 0) {
        return "Último dia do seu acesso Premium! 🔥";
      } else if (status.daysLeft === 1) {
        return "Seu acesso Premium expira amanhã! ⚠️";
      } else {
        return `Seu acesso Premium expira em ${status.daysLeft} dias`;
      }
    } else if (!status.isPremium && status.freePlaysLeft && status.freePlaysLeft > 0) {
      return `Você tem ${status.freePlaysLeft} jogada${status.freePlaysLeft > 1 ? 's' : ''} grátis restante${status.freePlaysLeft > 1 ? 's' : ''}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🧙</div>
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  const expirationText = getExpirationText();

  return <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <div className="mb-4 text-6xl">🧙</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-destructive-foreground">
            ​Xaveco.ia
          </h1>
          <h2 className="text-xl font-semibold mb-2 text-foreground">
            Melhore suas habilidades sociais durante a noite!
          </h2>
          
          {/* Contador de expiração */}
          {expirationText && (
            <div className={`mt-4 px-4 py-2 rounded-full inline-block text-sm font-medium ${
              status?.isPremium && status?.daysLeft !== null && status?.daysLeft !== undefined && status.daysLeft <= 1
                ? 'bg-destructive/20 text-destructive border border-destructive/30'
                : status?.isPremium
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-muted text-muted-foreground border border-border'
            }`}>
              {expirationText}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <ModeCard icon="📝" title="Obtenha sugestões de respostas" description="Envie uma captura de tela de chat para sugestões de resposta inteligentes" stars={5} tipsCount="892.5k dicas dadas" onClick={() => navigate("/response-mode")} />

          <ModeCard icon="💬" title="Inicie uma conversa" description="Faça upload de uma foto de uma pessoa ou atividade para iniciar a conversa" stars={5} tipsCount="783.8k dicas dadas" onClick={() => navigate("/start-conversation")} />

          <ModeCard icon="😰" title="Ajuda com situação embaraçosa" description="Forneça os detalhes da situação para o Melhor conselho!" stars={5} tipsCount="649.8k dicas dadas" onClick={() => navigate("/embarrassing-mode")} />
        </div>
      </div>
    </div>;
}