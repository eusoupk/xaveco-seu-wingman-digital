import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrialPaywall } from "@/components/TrialPaywall";
import { xavecoClient } from "@/lib/xavecoClient";

const TrialPage = () => {
  const navigate = useNavigate();
  const [trialInfo, setTrialInfo] = useState<any>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await xavecoClient.checkStatus();
        setTrialInfo({
          usedCount: status.usedCount,
          limit: status.limit,
          expiresAt: status.expiresAt,
        });
      } catch (error) {
        console.error("Error checking status:", error);
      }
    };

    checkStatus();
  }, []);

  const handleUpgrade = () => {
    // Inicia o trial de 2 mensagens e redireciona para o wizard
    navigate("/wizard");
  };

  const handleAlreadyHaveAccess = async () => {
    try {
      const status = await xavecoClient.checkStatus();
      if (status.premium) {
        navigate("/wizard");
      } else {
        alert("Você ainda não tem acesso premium. Complete o pagamento primeiro.");
      }
    } catch (error) {
      console.error("Error checking access:", error);
      alert("Erro ao verificar acesso. Tente novamente.");
    }
  };

  return (
    <TrialPaywall
      visible={true}
      trialInfo={trialInfo}
      onUpgrade={handleUpgrade}
      onAlreadyHaveAccess={handleAlreadyHaveAccess}
    />
  );
};

export default TrialPage;
