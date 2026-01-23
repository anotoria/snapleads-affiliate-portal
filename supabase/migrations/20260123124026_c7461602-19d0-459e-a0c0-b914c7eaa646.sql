-- Drop existing check constraint
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Update existing lead statuses to new nomenclature
UPDATE public.leads SET status = 'active' WHERE status = 'converted';
UPDATE public.leads SET status = 'inactive' WHERE status = 'expired';

-- Create new check constraint with updated statuses
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check 
CHECK (status IN ('pending', 'late_payment', 'active', 'inactive'));

-- Add comment explaining valid statuses
COMMENT ON COLUMN public.leads.status IS 'Valid statuses: pending, late_payment, active, inactive';