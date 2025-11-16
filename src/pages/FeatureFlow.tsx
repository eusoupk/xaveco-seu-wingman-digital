import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToneSelector } from "@/components/ToneSelector";
import { ResponseCard } from "@/components/ResponseCard";
import { ArrowLeft } from "lucide-react";
import xavecoIcon from "@/assets/xaveco-icon.png";

interface FeatureFlowProps {
  feature: string;
  onBack: () => void;
}

const FeatureFlow = ({ feature, onBack }: FeatureFlowProps) => {
  const [step, setStep] = useState<"input" | "tone" | "custom" | "results">("input");
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [customContext, setCustomContext] = useState("");

  const getFeatureTitle = () => {
    switch (feature) {
      case "responses":
        return "Vamos testar suas habilidades...";
      case "starter":
        return "Como começar essa conversa?";
      case "emotions":
        return "Vamos entender as emoções...";
      default:
        return "";
    }
  };

  const getInputPlaceholder = () => {
    switch (feature) {
      case "responses":
        return "Não estou bravo com você, apenas não gosto de como nossas conversas têm sido ultimamente";
      case "starter":
        return "Descreva a pessoa ou situação...";
      case "emotions":
        return "Descreva a situação...";
      default:
        return "";
    }
  };

  const handleContinue = () => {
    if (step === "input") {
      setStep("tone");
    } else if (step === "tone" && selectedTone) {
      setStep("custom");
    } else if (step === "custom") {
      setStep("results");
    }
  };

  const mockResponses = [
    {
      emoji: "😊",
      label: "Versão sutil",
      response: "Ei, sumida. Tô sentindo falta daquele seu sorriso.",
    },
    {
      emoji: "🔥",
      label: "Versão ousada",
      response: "Se você fosse um story, eu deixava no destaque.",
    },
    {
      emoji: "😂",
      label: "Versão zueira",
      response: "Se eu te mandar um áudio cantando, você responde ou me bloqueia?",
    },
  ];

  if (step === "results") {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div className="flex flex-col items-center mb-8">
            <img src={xavecoIcon} alt="Xaveco" className="w-16 h-16 mb-4" />
            <h2 className="text-2xl font-bold text-foreground text-center mb-2">
              Feito! 🏆
            </h2>
            <p className="text-muted-foreground text-center">
              Agora é só copiar e colar
            </p>
          </div>

          <div className="space-y-4">
            {mockResponses.map((response, index) => (
              <ResponseCard key={index} {...response} />
            ))}
          </div>

          <Button
            variant="default"
            size="lg"
            onClick={onBack}
            className="w-full mt-8 h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90"
          >
            Fazer outro xaveco
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="flex flex-col items-center mb-8">
          <img src={xavecoIcon} alt="Xaveco" className="w-16 h-16 mb-4" />
          <h2 className="text-2xl font-bold text-foreground text-center">
            {step === "input" && getFeatureTitle()}
            {step === "tone" && "Escolha o estilo do papo:"}
            {step === "custom" && "Personalizar"}
          </h2>
          {step === "custom" && (
            <p className="text-muted-foreground text-center mt-2">
              Se há algo que você quer que eu considere apenas me diga
            </p>
          )}
        </div>

        {step === "input" && (
          <>
            <div className="mb-6 p-4 bg-card rounded-xl border border-border/50">
              <p className="text-muted-foreground text-sm mb-3">
                {getInputPlaceholder()}
              </p>
            </div>
            <Textarea
              placeholder="Digite aqui"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px] mb-6 bg-card border-border/50"
            />
          </>
        )}

        {step === "tone" && (
          <div className="mb-6">
            <ToneSelector
              selectedTone={selectedTone}
              onSelectTone={setSelectedTone}
            />
          </div>
        )}

        {step === "custom" && (
          <>
            <Textarea
              placeholder="Este é meu amigo Adun. Estou muito interessado nela, mas ainda estamos indo devagar. Hoje é o aniversário dela."
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              className="min-h-[150px] mb-4 bg-card border-border/50"
            />
            <p className="text-xs text-muted-foreground italic mb-6">
              Não precisa se você apenas quer uma resposta direta
            </p>
          </>
        )}

        <Button
          variant="default"
          size="lg"
          onClick={handleContinue}
          disabled={step === "input" && !inputText}
          className="w-full h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90"
        >
          {step === "input" && "Avalie minha resposta"}
          {step === "tone" && "Mandar Bala ✨"}
          {step === "custom" && "Processar ✨"}
        </Button>
      </div>
    </div>
  );
};

export default FeatureFlow;
