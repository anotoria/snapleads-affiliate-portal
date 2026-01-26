import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAccess } from "@/hooks/useAdminAccess";

export interface AdminDashboardMetrics {
  totalAffiliates: number;
  activeAffiliates: number;
  inactiveAffiliates: number;
  totalLeads: number;
  pendingPayoutsCount: number;
  pendingPayoutsAmount: number;
  totalPaid: number;
  openTickets: number;
  affiliatesByTier: { tier: string; count: number }[];
}

export const useAdminDashboardMetrics = () => {
  const { isAdmin } = useAdminAccess();

  return useQuery({
    queryKey: ["admin-dashboard-metrics"],
    queryFn: async (): Promise<AdminDashboardMetrics> => {
      // Get affiliates count
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, is_active, tier_level");

      if (profilesError) throw profilesError;

      const totalAffiliates = profiles?.length || 0;
      const activeAffiliates = profiles?.filter((p) => p.is_active).length || 0;
      const inactiveAffiliates = totalAffiliates - activeAffiliates;

      // Count by tier
      const tierCounts: Record<string, number> = {};
      profiles?.forEach((p) => {
        const tier = p.tier_level || "silver";
        tierCounts[tier] = (tierCounts[tier] || 0) + 1;
      });
      const affiliatesByTier = Object.entries(tierCounts).map(([tier, count]) => ({
        tier,
        count,
      }));

      // Get leads count
      const { count: totalLeads, error: leadsError } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true });

      if (leadsError) throw leadsError;

      // Get payouts
      const { data: payouts, error: payoutsError } = await supabase
        .from("payouts")
        .select("amount, status");

      if (payoutsError) throw payoutsError;

      const pendingPayouts = payouts?.filter((p) => p.status === "pending") || [];
      const completedPayouts = payouts?.filter((p) => p.status === "completed") || [];

      const pendingPayoutsCount = pendingPayouts.length;
      const pendingPayoutsAmount = pendingPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
      const totalPaid = completedPayouts.reduce((sum, p) => sum + Number(p.amount), 0);

      // Get open tickets
      const { count: openTickets, error: ticketsError } = await supabase
        .from("support_tickets")
        .select("*", { count: "exact", head: true })
        .in("status", ["open", "in_progress", "waiting_user"]);

      if (ticketsError) throw ticketsError;

      return {
        totalAffiliates,
        activeAffiliates,
        inactiveAffiliates,
        totalLeads: totalLeads || 0,
        pendingPayoutsCount,
        pendingPayoutsAmount,
        totalPaid,
        openTickets: openTickets || 0,
        affiliatesByTier,
      };
    },
    enabled: isAdmin,
  });
};
