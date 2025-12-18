-- Explicitly block anon and authenticated access to xaveco_users
CREATE POLICY "Block anon access xaveco_users"
ON public.xaveco_users
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Block authenticated access xaveco_users"
ON public.xaveco_users
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Explicitly block anon and authenticated access to billing_events
CREATE POLICY "Block anon access billing_events"
ON public.billing_events
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Block authenticated access billing_events"
ON public.billing_events
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Explicitly block anon and authenticated access to trial_ips
CREATE POLICY "Block anon access trial_ips"
ON public.trial_ips
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Block authenticated access trial_ips"
ON public.trial_ips
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Explicitly block anon and authenticated access to xaveco_events
CREATE POLICY "Block anon access xaveco_events"
ON public.xaveco_events
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Block authenticated access xaveco_events"
ON public.xaveco_events
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);