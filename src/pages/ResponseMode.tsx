import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { xavecoClient, Tone } from "@/lib/xavecoClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Sparkles, Copy } from "lucide-react";
import { toast } from "sonner";
import { PaywallOverlay } from "@/components/PaywallOverlay";

const tones: { id: Tone; label: string }[] = [
  { id: "casual", label: "Casual" },
  { id: "provocative", label: "Provocante" },
  { id: "playful", label: "Brincalhão" },
  { id: "indifferent", label: "Indiferente" },
  { id: "romantic", label: "Romântico" },
  { id: "funny", label: "Engraçado" },
];

export default function ResponseMode() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null);
  const [additionalContext, setAdditionalContext] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trialInfo, setTrialInfo] = useState<any>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTone) {
      toast.error("Escolha um tom primeiro");
      return;
    }

    setLoading(true);
    setSuggestions([]);

    try {
      const context = additionalContext || "Usuário enviou uma captura de tela de conversa";
      const response = await xavecoClient.generateSuggestions("reply", selectedTone, context);

      setSuggestions(response.suggestions);
      if (response.trial) {
        setTrialInfo(response.trial);
      }
      toast.success("Sugestões geradas!");
    } catch (error: any) {
      if (error.code === "trial_expired") {
        setTrialInfo(error.trial);
        setShowPaywall(true);
      } else {
        toast.error(error.message || "Erro ao gerar sugestões");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
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
        toast.success("Acesso premium liberado!");
      } else {
        toast.error("Acesso premium não encontrado para este dispositivo.");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao verificar status");
    }
  };

  if (showPaywall) {
    return (
      <PaywallOverlay
        visible={showPaywall}
        trialInfo={trialInfo}
        onUpgrade={handleUpgradeClick}
        onAlreadyHaveAccess={handleAlreadyHaveAccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧙</span>
            <h1 className="text-xl font-bold">Wizard</h1>
          </div>
        </div>

        {!suggestions.length ? (
          <div className="space-y-6">
            {/* Image Upload */}
            <Card className="p-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                {selectedImage ? (
                  <img src={selectedImage} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Clique para fazer upload da captura de tela</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Tone Selection */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Tonalidade</h2>
              <div className="flex flex-wrap gap-2">
                {tones.map((tone) => (
                  <Button
                    key={tone.id}
                    variant={selectedTone === tone.id ? "default" : "outline"}
                    onClick={() => setSelectedTone(tone.id)}
                    className="rounded-full"
                  >
                    {tone.label}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Additional Context */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Personalizar</h2>
              {!showContext ? (
                <Button variant="outline" onClick={() => setShowContext(true)}>
                  Adicionar contexto +
                </Button>
              ) : (
                <Textarea
                  placeholder="Se há algo que você quer que eu considere apenas lmk"
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  className="min-h-24"
                />
              )}
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={loading || !selectedTone}
              size="lg"
              className="w-full bg-green-500 hover:bg-green-600 text-white text-lg h-14"
            >
              {loading ? (
                "Processando..."
              ) : (
                <>
                  Abracadabra! <Sparkles className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>

            {trialInfo && !trialInfo.premium && (
              <div className="text-center text-sm text-muted-foreground">
                Você usou {trialInfo.usedCount} de {trialInfo.limit} Xavecos grátis.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-6">
              {selectedImage && (
                <img src={selectedImage} alt="Context" className="max-h-48 mx-auto rounded-lg mb-4" />
              )}
              <h2 className="text-2xl font-bold mb-2">Feito!</h2>
              <p className="text-sm text-muted-foreground">Sinta-se à vontade para ajustar ao seu gosto</p>
            </div>

            {suggestions.map((suggestion, index) => (
              <Card key={index} className="p-4 bg-card/80">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-1">Dica {index + 1}</p>
                    <p className="text-foreground">{suggestion}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(suggestion)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            <Button variant="outline" onClick={() => setSuggestions([])} className="w-full">
              Gerar Novamente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
