import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { xavecoClient, Tone } from "@/lib/xavecoClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Sparkles, Copy } from "lucide-react";
import { toast } from "sonner";
import { TrialPaywall } from "@/components/TrialPaywall";
const tones: {
  id: Tone;
  label: string;
}[] = [{
  id: "casual",
  label: "Casual"
}, {
  id: "provocative",
  label: "Provocante"
}, {
  id: "playful",
  label: "Brincalhão"
}, {
  id: "indifferent",
  label: "Indiferente"
}, {
  id: "romantic",
  label: "Romântico"
}, {
  id: "funny",
  label: "Engraçado"
}];
export default function EmbarrassingMode() {
  const navigate = useNavigate();
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null);
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trialInfo, setTrialInfo] = useState<any>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const handleGenerate = async () => {
    if (!selectedTone || situation.trim().length < 5) {
      toast.error("Descreva a situação e escolha um tom");
      return;
    }
    setLoading(true);
    setSuggestions([]);
    try {
      const response = await xavecoClient.generateSuggestions("tension", selectedTone, situation);
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
  return <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧙</span>
            <h1 className="text-xl font-bold">Xaveco</h1>
          </div>
        </div>

        {!suggestions.length ? <div className="space-y-6">
            {/* Situation Description */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Descreva a situação</h2>
              <Textarea placeholder="Conte-nos o que aconteceu e precisamos ajudá-lo a resolver..." value={situation} onChange={e => setSituation(e.target.value)} className="min-h-32" />
            </Card>

            {/* Tone Selection */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Tonalidade</h2>
              <div className="flex flex-wrap gap-2">
                {tones.map(tone => <Button key={tone.id} variant={selectedTone === tone.id ? "default" : "outline"} onClick={() => setSelectedTone(tone.id)} className="rounded-full">
                    {tone.label}
                  </Button>)}
              </div>
            </Card>

            {/* Generate Button */}
            <Button onClick={handleGenerate} disabled={loading || !selectedTone || situation.trim().length < 5} size="lg" className="w-full bg-green-500 hover:bg-green-600 text-white text-lg h-14">
              {loading ? "Processando..." : <>
                  Abracadabra! <Sparkles className="ml-2 w-5 h-5" />
                </>}
            </Button>

            {trialInfo && !trialInfo.premium && <p className="text-xs text-muted-foreground mt-2 text-center">
                {trialInfo.usedCount < trialInfo.limit ? `Você usou ${trialInfo.usedCount} de ${trialInfo.limit} Xavecos grátis. Faltam ${Math.max(trialInfo.limit - trialInfo.usedCount, 0)}.` : `Você usou todos os seus Xavecos grátis. O próximo já ativa o acesso premium.`}
              </p>}
          </div> : <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Feito!</h2>
              <p className="text-sm text-muted-foreground">Aqui estão algumas formas de lidar com a situação</p>
            </div>

            {suggestions.map((suggestion, index) => <Card key={index} className="p-4 bg-card/80">
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
              </Card>)}

            <Button variant="outline" onClick={() => setSuggestions([])} className="w-full">
              Gerar Novamente
            </Button>
          </div>}
      </div>
    </div>;
}