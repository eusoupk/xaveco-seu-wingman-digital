-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Service role full access billing_events" ON public.billing_events;

-- Create restrictive policy: only service_role can access
CREATE POLICY "Service role only access billing_events"
ON public.billing_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);