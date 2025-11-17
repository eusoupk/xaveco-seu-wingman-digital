import { useState } from "react";
import { xavecoClient, Mode, Tone } from "@/lib/xavecoClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PaywallOverlay } from "@/components/PaywallOverlay";

const modes: { id: Mode; label: string; emoji: string }[] = [
  { id: "reply", label: "Destravar Resposta", emoji: "💬" },
  { id: "initiate", label: "Iniciar Conversa", emoji: "🚀" },
  { id: "tension", label: "Situação Tensa", emoji: "😬" },
];

const tones: { id: Tone; label: string; emoji: string }[] = [
  { id: "casual", label: "Casual", emoji: "😎" },
  { id: "provocative", label: "Provocativo", emoji: "😏" },
  { id: "playful", label: "Brincalhão", emoji: "😄" },
  { id: "indifferent", label: "Indiferente", emoji: "🤷" },
  { id: "romantic", label: "Romântico", emoji: "💕" },
  { id: "funny", label: "Engraçado", emoji: "🤣" },
];

export default function XavecoMain() {
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null);
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trialInfo, setTrialInfo] = useState<any>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleGenerate = async () => {
    if (!selectedMode || !selectedTone || context.trim().length < 3) {
      toast.error("Preencha todos os campos para gerar o Xaveco");
      return;
    }

    setLoading(true);
    setSuggestions([]);

    try {
      const response = await xavecoClient.generateSuggestions(
        selectedMode,
        selectedTone,
        context
      );

      setSuggestions(response.suggestions);
      if (response.trial) {
        setTrialInfo(response.trial);
      }
      toast.success("Xaveco gerado com sucesso!");
    } catch (error: any) {
      if (error.code === "trial_expired") {
        setTrialInfo(error.trial);
        setShowPaywall(true);
      } else {
        toast.error(error.message || "Erro ao gerar Xaveco");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Xaveco copiado!");
  };

  const handleUpgradeClick = () => {
    const checkoutUrl = import.meta.env.VITE_CHECKOUT_URL;
    if (checkoutUrl) {
      window.location.href = `${checkoutUrl}?client_id=${xavecoClient.getClientId()}`;
    } else {
      alert("Link de checkout não configurado.");
    }
  };

  const handleAlreadyHaveAccess = async () => {
    try {
      const status = await xavecoClient.checkStatus();
      if (status.premium) {
        setShowPaywall(false);
        toast.success("Acesso premium liberado. Aproveite o Xaveco ilimitado!");
      } else {
        toast.error("Não foi encontrado acesso premium para esse dispositivo.");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao verificar status");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            XAVECO
          </h1>
          <p className="text-muted-foreground">
            Seu wingman pessoal para qualquer situação
          </p>
        </div>

        {!showPaywall && (
          <div className="space-y-6">
            {/* Mode Selection */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Escolha a Função</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {modes.map((mode) => (
                  <Button
                    key={mode.id}
                    variant={selectedMode === mode.id ? "default" : "outline"}
                    size="lg"
                    onClick={() => setSelectedMode(mode.id)}
                    className="h-auto py-4 flex flex-col gap-2"
                  >
                    <span className="text-2xl">{mode.emoji}</span>
                    <span>{mode.label}</span>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Tone Selection */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Escolha o Tom</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {tones.map((tone) => (
                  <Button
                    key={tone.id}
                    variant={selectedTone === tone.id ? "default" : "outline"}
                    size="lg"
                    onClick={() => setSelectedTone(tone.id)}
                    className="h-auto py-4 flex flex-col gap-2"
                  >
                    <span className="text-2xl">{tone.emoji}</span>
                    <span>{tone.label}</span>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Context Input */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Contexto</h2>
              <Textarea
                placeholder="Digite o print, mensagem, situação ou contexto aqui..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="min-h-32"
              />
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={loading || !selectedMode || !selectedTone || context.trim().length < 3}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>Gerando Xaveco...</>
              ) : (
                <>
                  <Sparkles className="mr-2" />
                  Gerar Xaveco
                </>
              )}
            </Button>

            {/* Trial Info */}
            {trialInfo && !trialInfo.premium && (
              <div className="text-center text-sm text-muted-foreground">
                Você já usou {trialInfo.usedCount} de {trialInfo.limit} Xavecos grátis.
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Sugestões</h2>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-muted rounded-lg"
                    >
                      <p className="flex-1 text-foreground">{suggestion}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(suggestion)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        <PaywallOverlay
          visible={showPaywall}
          trialInfo={trialInfo}
          onUpgrade={handleUpgradeClick}
          onAlreadyHaveAccess={handleAlreadyHaveAccess}
        />
      </div>
    </div>
  );
}
