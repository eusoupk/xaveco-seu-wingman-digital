import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { xavecoClient } from "@/lib/xavecoClient";
import xavecoIcon from "@/assets/xaveco-icon.png";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');

  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        // Aguardar um pouco para o webhook processar
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const result = await xavecoClient.checkStatus();
        
        if (result.premium) {
          setStatus('success');
          // Redirecionar para o jogo principal
          setTimeout(() => {
            navigate("/wizard");
          }, 1500);
        } else {
          // Se ainda não está premium, tentar novamente em breve
          setTimeout(checkPremiumStatus, 3000);
        }
      } catch (error) {
        console.error("Error checking premium status:", error);
        setStatus('error');
      }
    };

    checkPremiumStatus();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-950 to-gray-950 flex flex-col items-center justify-center p-6">
      <img src={xavecoIcon} alt="Xaveco" className="w-24 h-24 mb-6" />
      
      {status === 'checking' && (
        <>
          <h1 className="text-2xl font-bold text-white mb-4">
            Processando seu pagamento...
          </h1>
          <p className="text-gray-300 text-center">
            Aguarde enquanto confirmamos sua assinatura
          </p>
          <div className="mt-6 animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </>
      )}

      {status === 'success' && (
        <>
          <h1 className="text-2xl font-bold text-white mb-4">
            🎉 Pagamento confirmado!
          </h1>
          <p className="text-gray-300 text-center">
            Redirecionando para o app...
          </p>
        </>
      )}

      {status === 'error' && (
        <>
          <h1 className="text-2xl font-bold text-white mb-4">
            Ops! Algo deu errado
          </h1>
          <p className="text-gray-300 text-center mb-6">
            Tente acessar o app novamente. Se o problema persistir, entre em contato.
          </p>
          <button
            onClick={() => navigate("/wizard")}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
          >
            Ir para o app
          </button>
        </>
      )}
    </div>
  );
};

export default CheckoutSuccess;
