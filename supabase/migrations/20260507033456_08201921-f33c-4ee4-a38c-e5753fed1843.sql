ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS managed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_managed_by ON public.profiles(managed_by);

-- Replace admin view policy: super admin sees all, admin sees only managed affiliates
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view managed profiles"
ON public.profiles
FOR SELECT
USING (
  public.is_super_admin(auth.uid())
  OR (public.is_admin(auth.uid()) AND managed_by = auth.uid())
);

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can update managed profiles"
ON public.profiles
FOR UPDATE
USING (
  public.is_super_admin(auth.uid())
  OR (public.is_admin(auth.uid()) AND managed_by = auth.uid())
);
