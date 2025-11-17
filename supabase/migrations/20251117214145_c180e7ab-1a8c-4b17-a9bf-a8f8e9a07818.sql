-- Create table for trial and premium management
CREATE TABLE IF NOT EXISTS public.xaveco_users (
  client_id TEXT PRIMARY KEY,
  trial_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_count INTEGER NOT NULL DEFAULT 0,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.xaveco_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role can manage all xaveco_users"
  ON public.xaveco_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at automatically
CREATE OR REPLACE FUNCTION public.update_xaveco_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on every update
CREATE TRIGGER update_xaveco_users_updated_at
  BEFORE UPDATE ON public.xaveco_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_xaveco_users_updated_at();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_xaveco_users_client_id ON public.xaveco_users(client_id);
CREATE INDEX IF NOT EXISTS idx_xaveco_users_is_premium ON public.xaveco_users(is_premium);