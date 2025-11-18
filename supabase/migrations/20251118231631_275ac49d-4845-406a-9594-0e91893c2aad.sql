-- Add trial_messages_left column to xaveco_users table
ALTER TABLE public.xaveco_users 
ADD COLUMN IF NOT EXISTS trial_messages_left integer DEFAULT 2;

-- Update existing users to have 2 trial messages if they're not premium
UPDATE public.xaveco_users 
SET trial_messages_left = 2 
WHERE is_premium = false AND trial_messages_left IS NULL;