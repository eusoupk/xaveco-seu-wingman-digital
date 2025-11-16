import { FeatureCard } from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import xavecoIcon from "@/assets/xaveco-icon.png";

interface MainMenuProps {
  onSelectFeature: (feature: string) => void;
}

const MainMenu = ({ onSelectFeature }: MainMenuProps) => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto">
        <div className="flex flex-col items-center mb-8 pt-8">
          <img src={xavecoIcon} alt="Xaveco" className="w-20 h-20 mb-4" />
          <h2 className="text-2xl font-bold text-foreground text-center">
            O que precisa melhorar?
          </h2>
        </div>

        <div className="space-y-4">
          <FeatureCard
            emoji="💬"
            title="Jogo de respostas"
            description="Mantenha as conversas envolventes"
            onClick={() => onSelectFeature("responses")}
          />
          
          <FeatureCard
            emoji="📝"
            title="Iniciar conversas"
            description="Conheça as pessoas"
            onClick={() => onSelectFeature("starter")}
          />
          
          <FeatureCard
            emoji="😰"
            title="Ler emoções"
            description="Entenda melhor as pessoas"
            onClick={() => onSelectFeature("emotions")}
          />
        </div>

        <Button
          variant="default"
          size="lg"
          className="w-full mt-8 h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90"
          onClick={() => {}}
        >
          Melhore isso 🙌
        </Button>
      </div>
    </div>
  );
};

export default MainMenu;
