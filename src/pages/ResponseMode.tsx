import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { xavecoClient, Tone } from "@/lib/xavecoClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Sparkles, Copy } from "lucide-react";
import { toast } from "sonner";
import { TrialPaywall } from "@/components/TrialPaywall";
import { PixelBackground, PixelHeart, PixelCard } from "@/components/PixelBackground";

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
      const response = await xavecoClient.generateSuggestions("reply", selectedTone, context, selectedImage || undefined);
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
    const CHECKOUT_URL = "https://buy.stripe.com/3cI3cveNM7A95mj1l69oc03";
    const clientId = xavecoClient.getClientId();
    window.location.href = `${CHECKOUT_URL}?client_reference_id=${clientId}`;
  };

  const handleAlreadyHaveAccess = async () => {
    try {
      const status = await xavecoClient.checkStatus();
      if (status.ok && status.isPremium) {
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
    return <TrialPaywall visible={showPaywall} trialInfo={trialInfo} onUpgrade={handleUpgradeClick} onAlreadyHaveAccess={handleAlreadyHaveAccess} />;
  }

  return (
    <div className="min-h-screen bg-background p-4 relative overflow-hidden">
      <PixelBackground showCity={false} />
      
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/wizard")}
            className="text-foreground hover:bg-pixel-purple-mid"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <PixelHeart className="w-8 h-8" />
            <h1 className="font-pixel text-sm text-pixel-yellow">Respostas</h1>
          </div>
        </div>

        {!suggestions.length ? (
          <div className="space-y-4">
            {/* Image Upload */}
            <PixelCard>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              <div 
                onClick={() => fileInputRef.current?.click()} 
                className="border-2 border-dashed border-pixel-purple-light/50 rounded-sm p-6 text-center cursor-pointer hover:border-pixel-purple-light transition-colors"
              >
                {selectedImage ? (
                  <img src={selectedImage} alt="Preview" className="max-h-48 mx-auto rounded-sm" />
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-10 h-10 mx-auto text-pixel-purple-light" />
                    <p className="font-pixel text-[9px] text-muted-foreground">Upload da captura de tela</p>
                  </div>
                )}
              </div>
            </PixelCard>

            {/* Tone Selection */}
            <PixelCard>
              <h2 className="font-pixel text-xs text-pixel-yellow mb-3">Tonalidade</h2>
              <div className="flex flex-wrap gap-2">
                {tones.map(tone => (
                  <Button 
                    key={tone.id} 
                    onClick={() => setSelectedTone(tone.id)} 
                    className={`font-pixel text-[8px] px-3 py-2 rounded-sm border-b-2 transition-all ${
                      selectedTone === tone.id 
                        ? 'bg-pixel-green border-pixel-green-dark text-white' 
                        : 'bg-pixel-purple-mid border-pixel-purple-light/30 text-foreground hover:bg-pixel-purple-light/20'
                    }`}
                  >
                    {tone.label}
                  </Button>
                ))}
              </div>
            </PixelCard>

            {/* Additional Context */}
            <PixelCard>
              <h2 className="font-pixel text-xs text-pixel-yellow mb-3">Personalizar</h2>
              {!showContext ? (
                <Button 
                  onClick={() => setShowContext(true)}
                  className="font-pixel text-[8px] bg-pixel-purple-mid border border-pixel-purple-light/30 text-foreground hover:bg-pixel-purple-light/20"
                >
                  Adicionar contexto +
                </Button>
              ) : (
                <Textarea 
                  placeholder="Se há algo que você quer que eu considere..." 
                  value={additionalContext} 
                  onChange={e => setAdditionalContext(e.target.value)} 
                  className="min-h-20 font-pixel text-[10px] bg-pixel-purple-dark border-pixel-purple-light/30 text-foreground placeholder:text-muted-foreground" 
                />
              )}
            </PixelCard>

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate} 
              disabled={loading || !selectedTone} 
              size="lg" 
              className="w-full font-pixel text-xs py-5 bg-pixel-green hover:bg-pixel-green-dark text-white border-b-4 border-pixel-green-dark hover:border-b-2 hover:translate-y-[2px] active:border-b-0 active:translate-y-1 transition-all duration-75 rounded-sm disabled:opacity-50"
              style={{ boxShadow: '0 4px 0 hsl(120 60% 30%)' }}
            >
              {loading ? "Processando..." : (
                <>Abracadabra! <Sparkles className="ml-2 w-4 h-4" /></>
              )}
            </Button>

            {trialInfo && !trialInfo.premium && (
              <p className="font-pixel text-[8px] text-muted-foreground mt-2 text-center">
                {trialInfo.usedCount < trialInfo.limit 
                  ? `${trialInfo.usedCount}/${trialInfo.limit} Xavecos usados` 
                  : `Todos os Xavecos grátis usados`}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-6">
              {selectedImage && <img src={selectedImage} alt="Context" className="max-h-40 mx-auto rounded-sm mb-4" />}
              <h2 className="font-pixel text-lg text-pixel-yellow mb-2">Feito! ✨</h2>
              <p className="font-pixel text-[9px] text-muted-foreground">Ajuste ao seu gosto</p>
            </div>

            {suggestions.map((suggestion, index) => (
              <PixelCard key={index}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-pixel text-[10px] text-pixel-yellow mb-1">Dica {index + 1}</p>
                    <p className="text-sm text-foreground">{suggestion}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleCopy(suggestion)}
                    className="text-pixel-purple-light hover:text-pixel-yellow"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </PixelCard>
            ))}

            <Button 
              onClick={() => setSuggestions([])} 
              className="w-full font-pixel text-[10px] bg-pixel-purple-mid border border-pixel-purple-light/30 text-foreground hover:bg-pixel-purple-light/20"
            >
              Gerar Novamente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
