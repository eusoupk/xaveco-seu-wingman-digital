import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { xavecoClient } from "@/lib/xavecoClient";
import xavecoIcon from "@/assets/xaveco-icon.png";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20; // 20 tentativas = ~60 segundos
    let mounted = true;

    const checkPremiumStatus = async () => {
      if (!mounted) return;
      
      try {
        attempts++;
        const clientId = xavecoClient.getClientId();
        console.log(`[${attempts}/${maxAttempts}] Checking premium for client: ${clientId}`);
        
        const result = await xavecoClient.checkStatus();
        console.log(`[${attempts}/${maxAttempts}] Status:`, result);
        
        if (!mounted) return;
        
        if (result.premium) {
          console.log("✅ Premium activated!");
          setStatus('success');
          // Redirecionar para o jogo principal
          setTimeout(() => {
            if (mounted) navigate("/wizard");
          }, 1500);
        } else if (attempts >= maxAttempts) {
          console.log("⚠️ Max attempts reached, redirecting anyway");
          setStatus('error');
        } else {
          // Tentar novamente em 3 segundos
          setTimeout(checkPremiumStatus, 3000);
        }
      } catch (error) {
        console.error(`[${attempts}/${maxAttempts}] Error:`, error);
        if (!mounted) return;
        
        if (attempts >= maxAttempts) {
          setStatus('error');
        } else {
          setTimeout(checkPremiumStatus, 3000);
        }
      }
    };

    // Aguardar 2 segundos antes da primeira tentativa
    const timer = setTimeout(checkPremiumStatus, 2000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
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
