-- Adicionar colunas para rastrear promoção
ALTER TABLE public.xaveco_users 
ADD COLUMN IF NOT EXISTS promo_applied boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS promo_type text;