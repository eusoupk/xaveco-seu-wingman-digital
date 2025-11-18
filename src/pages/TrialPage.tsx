import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrialPaywall } from "@/components/TrialPaywall";
import { xavecoClient } from "@/lib/xavecoClient";
import { supabase } from "@/integrations/supabase/client";

const TrialPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const startTrial = async () => {
      try {
        const clientId = xavecoClient.getClientId();

        // Chamar edge function para iniciar trial
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/start-trial`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-xaveco-client-id': clientId,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          },
        });

        if (response.ok) {
          // Trial iniciado com sucesso, redirecionar para tela principal
          setTimeout(() => {
            navigate("/xaveco");
          }, 1000);
        } else {
          console.error("Erro ao iniciar trial");
          setError(true);
        }
      } catch (error) {
        console.error("Erro ao iniciar trial:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    startTrial();
  }, [navigate]);

  const handleUpgrade = () => {
    const CHECKOUT_URL = "https://buy.stripe.com/3cI3cveNM7A95mj1l69oc03";
    const clientId = xavecoClient.getClientId();

    // Fire-and-forget analytics
    try {
      supabase.functions.invoke("analytics", {
        body: {
          type: "checkout_click_trial",
          clientId: clientId,
        },
      }).catch(() => {});
    } catch {
      // Ignora erro de analytics
    }

    // Redireciona para Stripe
    window.location.href = `${CHECKOUT_URL}?client_reference_id=${clientId}`;
  };

  const handleAlreadyHaveAccess = () => {
    navigate("/xaveco");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-950 to-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Iniciando seu trial de 2 mensagens grátis...</div>
      </div>
    );
  }

  if (error) {
    return (
      <TrialPaywall
        visible={true}
        trialInfo={{ limit: 2, usedCount: 0 }}
        onUpgrade={handleUpgrade}
        onAlreadyHaveAccess={handleAlreadyHaveAccess}
      />
    );
  }

  return null;
};

export default TrialPage;

