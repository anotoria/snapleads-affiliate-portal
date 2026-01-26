-- Add RLS policies for admin access to global data

-- 1. Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (is_admin(auth.uid()));

-- 2. Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (is_admin(auth.uid()));

-- 3. Admins can view all leads
CREATE POLICY "Admins can view all leads"
ON public.leads FOR SELECT
USING (is_admin(auth.uid()));

-- 4. Admins can view all payouts
CREATE POLICY "Admins can view all payouts"
ON public.payouts FOR SELECT
USING (is_admin(auth.uid()));

-- 5. Admins can update all payouts
CREATE POLICY "Admins can update payouts"
ON public.payouts FOR UPDATE
USING (is_admin(auth.uid()));