import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { MessageSquare, Image as ImageIcon, Frown } from "lucide-react";
import { xavecoClient } from "@/lib/xavecoClient";
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

  // Verificar status premium ao carregar a página
  useEffect(() => {
    const checkPremium = async () => {
      try {
        const status = await xavecoClient.checkStatus();
        console.log("Status checked on /wizard:", status);
      } catch (error) {
        console.error("Error checking status:", error);
      }
    };
    checkPremium();
  }, []);
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
        </div>

        <div className="space-y-4">
          <ModeCard icon="📝" title="Obtenha sugestões de respostas" description="Envie uma captura de tela de chat para sugestões de resposta inteligentes" stars={5} tipsCount="892.5k dicas dadas" onClick={() => navigate("/response-mode")} />

          <ModeCard icon="💬" title="Inicie uma conversa" description="Faça upload de uma foto de uma pessoa ou atividade para iniciar a conversa" stars={5} tipsCount="783.8k dicas dadas" onClick={() => navigate("/start-conversation")} />

          <ModeCard icon="😰" title="Ajuda com situação embaraçosa" description="Forneça os detalhes da situação para o Melhor conselho!" stars={5} tipsCount="649.8k dicas dadas" onClick={() => navigate("/embarrassing-mode")} />
        </div>
      </div>
    </div>;
}