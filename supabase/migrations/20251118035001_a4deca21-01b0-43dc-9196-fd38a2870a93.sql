-- Create events table for analytics
CREATE TABLE public.xaveco_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Add index for better query performance
CREATE INDEX idx_xaveco_events_client_id ON public.xaveco_events(client_id);
CREATE INDEX idx_xaveco_events_event_type ON public.xaveco_events(event_type);
CREATE INDEX idx_xaveco_events_created_at ON public.xaveco_events(created_at DESC);

-- Enable RLS
ALTER TABLE public.xaveco_events ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage all events
CREATE POLICY "Service role can manage all xaveco_events"
ON public.xaveco_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);