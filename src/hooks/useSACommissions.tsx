import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAccess } from "@/hooks/useAdminAccess";

export interface AffiliateCommissionBreakdown {
  affiliateId: string;
  affiliateName: string;
  affiliateCompany: string | null;
  affiliateTier: string;
  affiliateCommissionRate: number;
  saCommissionRate: number;
  activeClients: number;
  baseValuePerClient: number;
  affiliateCommissionPerClient: number;
  affiliateCommissionTotal: number;
  saCommissionPerClient: number;
  saCommissionTotal: number;
}

export interface SACommissionTotals {
  totalAffiliates: number;
  totalClients: number;
  totalAffiliateCommission: number;
  totalSACommission: number;
  totalRevenue: number;
}

export interface SACommissionsData {
  settings: {
    commission_ceiling: number;
    base_plan_value: number;
  };
  breakdown: AffiliateCommissionBreakdown[];
  totals: SACommissionTotals;
}

export const useSACommissions = () => {
  const { isSuperAdmin } = useAdminAccess();

  return useQuery({
    queryKey: ["sa-commissions"],
    queryFn: async (): Promise<SACommissionsData> => {
      // 1. Get SA commission settings
      const { data: settings, error: settingsError } = await supabase
        .from("sa_commission_settings")
        .select("*")
        .eq("is_active", true)
        .single();

      if (settingsError) throw settingsError;

      // 2. Get all active affiliates with their tiers
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, company_name, tier_level, is_active")
        .eq("is_active", true);

      if (profilesError) throw profilesError;

      // 3. Get tiers for commission rates
      const { data: tiers, error: tiersError } = await supabase
        .from("tiers")
        .select("name, commission_percentage");

      if (tiersError) throw tiersError;

      // 4. Get active leads count per user
      const { data: leads, error: leadsError } = await supabase
        .from("leads")
        .select("user_id, id")
        .eq("status", "active");

      if (leadsError) throw leadsError;

      // 5. Calculate SA commission for each affiliate
      const breakdown: AffiliateCommissionBreakdown[] = (profiles || []).map((profile) => {
        const tier = tiers?.find((t) => t.name === profile.tier_level);
        const affiliateRate = tier?.commission_percentage || 0;
        const saRate = Math.max(0, settings.commission_ceiling - affiliateRate);
        const clientCount = leads?.filter((l) => l.user_id === profile.user_id).length || 0;

        const affiliateCommissionPerClient = settings.base_plan_value * (affiliateRate / 100);
        const saCommissionPerClient = settings.base_plan_value * (saRate / 100);

        return {
          affiliateId: profile.user_id,
          affiliateName: profile.full_name || "Sem nome",
          affiliateCompany: profile.company_name,
          affiliateTier: profile.tier_level,
          affiliateCommissionRate: affiliateRate,
          saCommissionRate: saRate,
          activeClients: clientCount,
          baseValuePerClient: settings.base_plan_value,
          affiliateCommissionPerClient,
          affiliateCommissionTotal: affiliateCommissionPerClient * clientCount,
          saCommissionPerClient,
          saCommissionTotal: saCommissionPerClient * clientCount,
        };
      });

      // Sort by SA commission total (descending)
      breakdown.sort((a, b) => b.saCommissionTotal - a.saCommissionTotal);

      const totals: SACommissionTotals = {
        totalAffiliates: breakdown.length,
        totalClients: breakdown.reduce((sum, b) => sum + b.activeClients, 0),
        totalAffiliateCommission: breakdown.reduce((sum, b) => sum + b.affiliateCommissionTotal, 0),
        totalSACommission: breakdown.reduce((sum, b) => sum + b.saCommissionTotal, 0),
        totalRevenue: breakdown.reduce((sum, b) => sum + b.baseValuePerClient * b.activeClients, 0),
      };

      return {
        settings: {
          commission_ceiling: settings.commission_ceiling,
          base_plan_value: settings.base_plan_value,
        },
        breakdown,
        totals,
      };
    },
    enabled: isSuperAdmin,
  });
};
