-- Criar tabela de auditoria billing_events para idempotência
CREATE TABLE IF NOT EXISTS public.billing_events (
  id BIGSERIAL PRIMARY KEY,
  stripe_event_id TEXT NOT NULL UNIQUE,
  client_id TEXT,
  amount BIGINT,
  plan TEXT,
  raw_event JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adicionar coluna premium_until se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'xaveco_users' 
    AND column_name = 'premium_until'
  ) THEN
    ALTER TABLE public.xaveco_users ADD COLUMN premium_until TIMESTAMPTZ;
  END IF;
END $$;

-- Adicionar coluna trial_expires_at se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'xaveco_users' 
    AND column_name = 'trial_expires_at'
  ) THEN
    ALTER TABLE public.xaveco_users ADD COLUMN trial_expires_at TIMESTAMPTZ;
  END IF;
END $$;

-- Habilitar RLS na tabela billing_events
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

-- Política RLS para billing_events (somente service role pode acessar)
CREATE POLICY "Service role can manage all billing_events" 
ON public.billing_events 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Criar índice para busca rápida por stripe_event_id
CREATE INDEX IF NOT EXISTS idx_billing_events_stripe_event_id ON public.billing_events(stripe_event_id);

-- Criar índice para busca rápida por client_id
CREATE INDEX IF NOT EXISTS idx_billing_events_client_id ON public.billing_events(client_id);