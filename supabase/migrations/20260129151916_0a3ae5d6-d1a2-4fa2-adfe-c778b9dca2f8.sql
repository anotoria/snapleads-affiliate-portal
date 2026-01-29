-- Add new columns for tier client count management
ALTER TABLE public.tiers 
  ADD COLUMN IF NOT EXISTS min_client_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_level_client_count integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_unlimited boolean NOT NULL DEFAULT false;

-- Migrate existing data: copy client_count to next_level_client_count
UPDATE public.tiers 
SET next_level_client_count = client_count,
    is_unlimited = false
WHERE next_level_client_count IS NULL;

-- Set min_client_count based on sort_order (previous tier's next_level_client_count)
WITH tier_ranges AS (
  SELECT 
    id,
    sort_order,
    LAG(client_count, 1, 0) OVER (ORDER BY sort_order) as prev_client_count
  FROM public.tiers
)
UPDATE public.tiers t
SET min_client_count = tr.prev_client_count
FROM tier_ranges tr
WHERE t.id = tr.id;

-- Mark the last tier (highest sort_order) as unlimited if it has no max limit
UPDATE public.tiers
SET is_unlimited = true
WHERE sort_order = (SELECT MAX(sort_order) FROM public.tiers);