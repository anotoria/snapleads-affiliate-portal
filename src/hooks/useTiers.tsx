import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Tier {
  id: string;
  name: string;
  display_name: string;
  min_revenue: number;
  max_revenue: number | null;
  client_count: number;
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

const BASE_VALUE_PER_LEAD = 2500;

export const useUserTierProgress = (activeLeadsCount: number) => {
  const { data: tiers, isLoading } = useTiers();

  if (isLoading || !tiers || tiers.length === 0) {
    return { 
      currentTier: null, 
      nextTier: null, 
      progress: 0, 
      activeLeadsCount: 0,
      leadsToNextTier: 0,
      currentRevenue: 0,
      revenueToNextTier: 0,
      isLoading: true 
    };
  }

  // Get min client count for a tier (previous tier's client_count or 0)
  const getMinClientCount = (tierIndex: number): number => {
    if (tierIndex <= 0) return 0;
    return tiers[tierIndex - 1].client_count || 0;
  };

  // Find current tier based on client_count
  let currentTierIndex = 0;
  for (let i = 0; i < tiers.length; i++) {
    const minClients = getMinClientCount(i);
    const maxClients = tiers[i].client_count;
    
    if (activeLeadsCount >= minClients && (maxClients === null || activeLeadsCount < maxClients)) {
      currentTierIndex = i;
      break;
    }
    // If leads exceed current tier, move to next
    if (maxClients !== null && activeLeadsCount >= maxClients) {
      currentTierIndex = i + 1;
    }
  }

  // Clamp to valid tier range
  currentTierIndex = Math.min(currentTierIndex, tiers.length - 1);
  
  const currentTier = tiers[currentTierIndex];
  const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;

  // Calculate progress to next tier based on client count
  let progress = 100;
  let leadsToNextTier = 0;
  
  if (nextTier) {
    const minClients = getMinClientCount(currentTierIndex);
    const maxClients = currentTier.client_count || nextTier.client_count || 0;
    const tierRange = maxClients - minClients;
    const userProgress = activeLeadsCount - minClients;
    progress = tierRange > 0 ? Math.min(100, Math.max(0, (userProgress / tierRange) * 100)) : 0;
    leadsToNextTier = Math.max(0, maxClients - activeLeadsCount);
  }

  // Calculate revenue based on leads
  const currentRevenue = activeLeadsCount * BASE_VALUE_PER_LEAD;
  const nextTierRevenue = nextTier ? nextTier.min_revenue : 0;
  const revenueToNextTier = Math.max(0, nextTierRevenue - currentRevenue);

  return { 
    currentTier, 
    nextTier, 
    progress, 
    activeLeadsCount,
    leadsToNextTier,
    currentRevenue,
    revenueToNextTier,
    isLoading: false 
  };
};
