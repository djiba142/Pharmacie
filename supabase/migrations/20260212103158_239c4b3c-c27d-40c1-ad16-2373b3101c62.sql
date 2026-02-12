
-- Fix: Replace overly permissive INSERT policy with admin-only insert
DROP POLICY "System can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT WITH CHECK (is_admin(auth.uid()));
-- Also allow authenticated users to insert their own notifications
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
