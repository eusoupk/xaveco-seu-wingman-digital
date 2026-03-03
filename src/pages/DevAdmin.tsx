import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { xavecoClient } from "@/lib/xavecoClient";
import NotFound from "./NotFound";

const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY;

export default function DevAdmin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<string>("idle");

  // Gate: require valid key query param
  if (!ADMIN_KEY || searchParams.get("key") !== ADMIN_KEY) {
    return <NotFound />;
  }

  const activate = async () => {
    setStatus("activating...");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-activate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-xaveco-client-id": xavecoClient.getClientId(),
            "x-admin-secret": ADMIN_KEY,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
          },
        }
      );
      const data = await res.json();
      if (data.ok) {
        setStatus("✅ Admin ativado! Redirecionando...");
        setTimeout(() => navigate("/wizard"), 1500);
      } else {
        setStatus(`❌ Erro: ${data.error}`);
      }
    } catch (e) {
      setStatus(`❌ ${e instanceof Error ? e.message : "Erro"}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <p className="font-mono text-xs text-muted-foreground">dev-admin</p>
        <p className="font-mono text-[10px] text-muted-foreground">
          client: {xavecoClient.getClientId()}
        </p>
        <button
          onClick={activate}
          className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm"
        >
          Ativar Admin
        </button>
        {status !== "idle" && (
          <p className="font-mono text-xs text-muted-foreground">{status}</p>
        )}
      </div>
    </div>
  );
}
