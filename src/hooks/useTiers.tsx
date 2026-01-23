import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Tier {
  id: string;
  name: string;
  display_name: string;
  min_revenue: number;
  max_revenue: number | null;
  commission_percentage: number;
  bonus_amount: number;
  color: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PricingTier {
  id: string;
  min_access: number;
  max_access: number | null;
  monthly_price: number;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useTiers = () => {
  return useQuery({
    queryKey: ["tiers"],
    queryFn: async (): Promise<Tier[]> => {
      const { data, error } = await supabase
        .from("tiers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error fetching tiers:", error);
        throw error;
      }

      return data || [];
    },
  });
};

export const usePricingTiers = () => {
  return useQuery({
    queryKey: ["pricing_tiers"],
    queryFn: async (): Promise<PricingTier[]> => {
      const { data, error } = await supabase
        .from("pricing_tiers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error fetching pricing tiers:", error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useUserTierProgress = (currentRevenue: number) => {
  const { data: tiers, isLoading } = useTiers();

  if (isLoading || !tiers) {
    return { currentTier: null, nextTier: null, progress: 0, isLoading: true };
  }

  // Find current tier
  const currentTier = tiers.find(
    (tier) =>
      currentRevenue >= tier.min_revenue &&
      (tier.max_revenue === null || currentRevenue <= tier.max_revenue)
  );

  // Find next tier
  const currentIndex = tiers.findIndex((t) => t.name === currentTier?.name);
  const nextTier = currentIndex >= 0 && currentIndex < tiers.length - 1 
    ? tiers[currentIndex + 1] 
    : null;

  // Calculate progress to next tier
  let progress = 100;
  if (nextTier && currentTier) {
    const tierRange = nextTier.min_revenue - currentTier.min_revenue;
    const userProgress = currentRevenue - currentTier.min_revenue;
    progress = Math.min(100, Math.max(0, (userProgress / tierRange) * 100));
  }

  return { currentTier, nextTier, progress, isLoading: false };
};
