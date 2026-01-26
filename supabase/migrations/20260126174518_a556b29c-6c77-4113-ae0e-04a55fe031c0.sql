-- Fix: Require authentication for viewing tiers and pricing_tiers
-- This prevents unauthenticated users from accessing business model data

-- Drop existing permissive policies that allow unauthenticated access
DROP POLICY IF EXISTS "Anyone can view active tiers" ON public.tiers;
DROP POLICY IF EXISTS "Anyone can view active pricing tiers" ON public.pricing_tiers;

-- Create new policies that require authentication
CREATE POLICY "Authenticated users can view active tiers" 
ON public.tiers 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND (is_active = true OR is_admin(auth.uid())));

CREATE POLICY "Authenticated users can view active pricing tiers" 
ON public.pricing_tiers 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND (is_active = true OR is_admin(auth.uid())));