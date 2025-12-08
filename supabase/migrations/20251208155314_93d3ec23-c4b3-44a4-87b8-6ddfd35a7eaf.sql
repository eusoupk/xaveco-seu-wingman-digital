-- Tabela para registrar IPs que já usaram trial
CREATE TABLE public.trial_ips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL UNIQUE,
  first_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  client_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.trial_ips ENABLE ROW LEVEL SECURITY;

-- Política para service role
CREATE POLICY "Service role can manage all trial_ips" 
ON public.trial_ips 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);