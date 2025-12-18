-- Fix trial_ips table
DROP POLICY IF EXISTS "Service role full access trial_ips" ON public.trial_ips;

CREATE POLICY "Service role only access trial_ips"
ON public.trial_ips
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix xaveco_events table
DROP POLICY IF EXISTS "Service role full access xaveco_events" ON public.xaveco_events;

CREATE POLICY "Service role only access xaveco_events"
ON public.xaveco_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);