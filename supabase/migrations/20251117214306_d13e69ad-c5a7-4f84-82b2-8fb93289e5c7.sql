-- Fix security warning by setting search_path on function
CREATE OR REPLACE FUNCTION public.update_xaveco_users_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;