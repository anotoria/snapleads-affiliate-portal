-- Add column to track if user must change password on first login
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.must_change_password IS 'Flag to force password change on first login for users created via webhook';