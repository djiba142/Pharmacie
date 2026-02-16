-- Migration: Create audit_logs table with corrected RLS policies
-- Created: 2026-02-15
-- Purpose: Enable comprehensive audit logging for user actions

-- Step 1: Create helper function to get user role from user_roles table
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = user_uuid
  LIMIT 1;
  
  RETURN user_role;
END;
$$;

-- Step 2: Create the audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- User information
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    user_name TEXT,
    user_role TEXT,
    
    -- Action details
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    
    -- Additional data
    details JSONB,
    
    -- Technical metadata
    ip_address TEXT,
    user_agent TEXT
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_role ON public.audit_logs(user_role);

-- Step 4: Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies

-- Policy 1: Allow authenticated users to insert audit logs
CREATE POLICY "Allow authenticated users to insert audit logs" 
ON public.audit_logs 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy 2: Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
TO authenticated 
USING (
  public.get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'ADMIN_CENTRAL', 'MIN_IG')
);

-- Policy 3: Users can view their own logs
CREATE POLICY "Users can view their own logs" 
ON public.audit_logs 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = user_id
);

-- Step 6: Add comments for documentation
COMMENT ON TABLE public.audit_logs IS 'Comprehensive audit log for all user actions in the system';
COMMENT ON COLUMN public.audit_logs.action IS 'Type of action: LOGIN, LOGOUT, CREATE, UPDATE, DELETE, EXPORT, VIEW, etc.';
COMMENT ON COLUMN public.audit_logs.entity_type IS 'Type of entity affected: USER, STOCK, COMMANDE, LIVRAISON, RAPPORT, AUTH, SYSTEM';
COMMENT ON COLUMN public.audit_logs.details IS 'Additional context and metadata about the action';
