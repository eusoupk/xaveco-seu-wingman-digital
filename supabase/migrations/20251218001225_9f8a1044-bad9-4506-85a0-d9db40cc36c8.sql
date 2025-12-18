-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Service role full access xaveco_users" ON public.xaveco_users;

-- Create restrictive policy: only service_role can access
-- This is correct because all operations go through edge functions with service_role
CREATE POLICY "Service role only access xaveco_users"
ON public.xaveco_users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Block all other access (anon, authenticated without service role)
-- No policy for anon/authenticated = no access