-- Adicionar coluna stripe_customer_id para usar no Customer Portal
ALTER TABLE public.xaveco_users 
ADD COLUMN IF NOT EXISTS stripe_customer_id text;