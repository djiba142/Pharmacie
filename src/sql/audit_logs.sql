-- Create the audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    user_role TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Policy for inserting logs (everyone can insert their own actions implicitly via backend or triggers, 
-- but explicit insert might be needed for frontend-triggered logs if any)
CREATE POLICY "Allow authenticated users to insert audit logs" 
ON public.audit_logs FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy for viewing logs
-- SUPER_ADMIN, ADMIN_CENTRAL, MIN_IG can view all logs
CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs FOR SELECT 
TO authenticated 
USING (
  auth.jwt() ->> 'role' IN ('SUPER_ADMIN', 'ADMIN_CENTRAL', 'MIN_IG')
);

-- Users can view their own logs (optional, depending on requirements)
CREATE POLICY "Users can view their own logs" 
ON public.audit_logs FOR SELECT 
TO authenticated 
USING (
  auth.uid() = user_id
);

-- Indexing for performance
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs(entity_type);
