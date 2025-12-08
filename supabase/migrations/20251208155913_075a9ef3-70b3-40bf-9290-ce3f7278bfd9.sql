-- Remover políticas antigas
DROP POLICY IF EXISTS "Service role can manage all xaveco_users" ON public.xaveco_users;
DROP POLICY IF EXISTS "Service role can manage all billing_events" ON public.billing_events;

-- Garantir RLS ativado
ALTER TABLE public.xaveco_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

-- xaveco_users: Acesso apenas para service_role (edge functions)
CREATE POLICY "Service role full access xaveco_users"
ON public.xaveco_users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- billing_events: Acesso apenas para service_role
CREATE POLICY "Service role full access billing_events"
ON public.billing_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- trial_ips: Acesso apenas para service_role
DROP POLICY IF EXISTS "Service role can manage all trial_ips" ON public.trial_ips;
CREATE POLICY "Service role full access trial_ips"
ON public.trial_ips
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- xaveco_events: Acesso apenas para service_role
DROP POLICY IF EXISTS "Service role can manage all xaveco_events" ON public.xaveco_events;
CREATE POLICY "Service role full access xaveco_events"
ON public.xaveco_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);