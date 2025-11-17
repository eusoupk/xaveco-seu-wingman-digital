import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Check } from "lucide-react";

interface PaywallOverlayProps {
  visible: boolean;
  trialInfo: any;
  onUpgrade: () => void;
  onAlreadyHaveAccess: () => void;
}

export function PaywallOverlay({
  visible,
  trialInfo,
  onUpgrade,
  onAlreadyHaveAccess,
}: PaywallOverlayProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">Período de Teste Expirado</h2>
          <p className="text-muted-foreground">
            Seu período de teste do Xaveco acabou. Faça upgrade para continuar usando!
          </p>
        </div>

        {trialInfo && (
          <div className="bg-muted p-4 rounded-lg text-sm text-center">
            <p>
              Você usou <span className="font-bold">{trialInfo.usedCount}</span> de{" "}
              <span className="font-bold">{trialInfo.limit}</span> Xavecos grátis
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Check className="w-5 h-5 text-primary flex-shrink-0" />
            <span>Xavecos ilimitados</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Check className="w-5 h-5 text-primary flex-shrink-0" />
            <span>Todos os tons e funções</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Check className="w-5 h-5 text-primary flex-shrink-0" />
            <span>Suporte prioritário</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Check className="w-5 h-5 text-primary flex-shrink-0" />
            <span>Acesso vitalício</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={onUpgrade} size="lg" className="w-full">
            Fazer Upgrade Agora
          </Button>
          <Button
            onClick={onAlreadyHaveAccess}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Já Tenho Acesso
          </Button>
        </div>
      </Card>
    </div>
  );
}
