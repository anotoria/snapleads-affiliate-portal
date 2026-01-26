-- Fix security issues: Add explicit authentication requirement to RLS policies
-- This prevents anonymous access to sensitive tables

-- Drop existing policies that need modification (profiles)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new policy with explicit auth requirement
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Drop existing policies that need modification (leads)  
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;

-- Create new policies with explicit auth requirement
CREATE POLICY "Users can view their own leads" 
ON public.leads 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" 
ON public.leads 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Update payouts policies with explicit auth check
DROP POLICY IF EXISTS "Users can view their own payouts" ON public.payouts;
DROP POLICY IF EXISTS "Users can request their own payouts" ON public.payouts;

CREATE POLICY "Users can view their own payouts" 
ON public.payouts 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can request their own payouts" 
ON public.payouts 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Update commission_history policies with explicit auth check
DROP POLICY IF EXISTS "Users can view their own commissions" ON public.commission_history;

CREATE POLICY "Users can view their own commissions" 
ON public.commission_history 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND (auth.uid() = user_id OR is_admin(auth.uid())));

-- Update user_roles policies with explicit auth check
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_admin(auth.uid()));

-- Update documents policies with explicit auth check
DROP POLICY IF EXISTS "Users can view their public documents" ON public.documents;

CREATE POLICY "Users can view their public documents" 
ON public.documents 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND ((auth.uid() = user_id AND is_public = true) OR is_admin(auth.uid())));

-- Update support_tickets policies with explicit auth check
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update their own open tickets" ON public.support_tickets;

CREATE POLICY "Users can view their own tickets" 
ON public.support_tickets 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND (auth.uid() = user_id OR is_admin(auth.uid())));

CREATE POLICY "Users can create their own tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own open tickets" 
ON public.support_tickets 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND ((auth.uid() = user_id AND status IN ('open', 'waiting_user')) OR is_admin(auth.uid())));

-- Update support_messages policies with explicit auth check
DROP POLICY IF EXISTS "Users can view messages of their tickets" ON public.support_messages;
DROP POLICY IF EXISTS "Users can add messages to their tickets" ON public.support_messages;

CREATE POLICY "Users can view messages of their tickets" 
ON public.support_messages 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM support_tickets t 
  WHERE t.id = support_messages.ticket_id 
  AND (t.user_id = auth.uid() OR is_admin(auth.uid()))
));

CREATE POLICY "Users can add messages to their tickets" 
ON public.support_messages 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM support_tickets t 
  WHERE t.id = support_messages.ticket_id 
  AND (t.user_id = auth.uid() OR is_admin(auth.uid()))
));

-- Update profiles insert and update policies with explicit auth check
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);