-- Add user status enum and column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE public.user_status AS ENUM ('ACTIF', 'SUSPENDU', 'SUPPRIME');
    END IF;
END $$;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status public.user_status DEFAULT 'ACTIF';

-- Migrate existing data from is_active to status
UPDATE public.profiles 
SET status = CASE 
    WHEN is_active = true THEN 'ACTIF'::public.user_status
    ELSE 'SUSPENDU'::public.user_status
END
WHERE status = 'ACTIF'; -- Only update if still at default to avoid triple update if run twice

-- Update RLS if needed (optional, but keep consistent with previous is_active logic if any)
-- Currently RLS in profiles uses public.is_admin(auth.uid()) or auth.uid() = user_id
