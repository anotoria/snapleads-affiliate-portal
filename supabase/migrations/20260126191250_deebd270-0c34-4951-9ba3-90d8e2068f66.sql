-- Add client_count column to tiers table
-- max_revenue will be calculated as client_count * 2500

ALTER TABLE public.tiers 
ADD COLUMN client_count integer NOT NULL DEFAULT 0;

-- Update existing tiers to calculate client_count from max_revenue
UPDATE public.tiers 
SET client_count = COALESCE(ROUND(max_revenue / 2500), 0)
WHERE max_revenue IS NOT NULL;

-- Create a trigger to automatically calculate max_revenue from client_count
CREATE OR REPLACE FUNCTION public.calculate_tier_max_revenue()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.client_count > 0 THEN
        NEW.max_revenue := NEW.client_count * 2500;
    ELSE
        NEW.max_revenue := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_calculate_tier_max_revenue
BEFORE INSERT OR UPDATE ON public.tiers
FOR EACH ROW
EXECUTE FUNCTION public.calculate_tier_max_revenue();