import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EvolutionData {
  month: string;
  leads: number;
  revenue: number;
  commissions: number;
}

export const useAdminEvolutionData = (months: number = 6) => {
  const { isAdmin } = useAdminAccess();

  return useQuery({
    queryKey: ["admin-evolution-data", months],
    queryFn: async (): Promise<EvolutionData[]> => {
      const now = new Date();
      const evolutionData: EvolutionData[] = [];

      for (let i = months - 1; i >= 0; i--) {
        const targetDate = subMonths(now, i);
        const monthStart = startOfMonth(targetDate);
        const monthEnd = endOfMonth(targetDate);
        const monthLabel = format(targetDate, "MMM/yy", { locale: ptBR });

        // Get leads for this month
        const { count: leadsCount, error: leadsError } = await supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString());

        if (leadsError) {
          console.error("Error fetching leads:", leadsError);
        }

        // Get total revenue (sum of monthly_value from active leads)
        const { data: revenueData, error: revenueError } = await supabase
          .from("leads")
          .select("monthly_value")
          .eq("status", "active")
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString());

        if (revenueError) {
          console.error("Error fetching revenue:", revenueError);
        }

        const revenue = revenueData?.reduce((sum, lead) => sum + Number(lead.monthly_value || 0), 0) || 0;

        // Get commissions for this month
        const { data: commissionsData, error: commissionsError } = await supabase
          .from("commission_history")
          .select("total_value")
          .gte("calculated_at", monthStart.toISOString())
          .lte("calculated_at", monthEnd.toISOString());

        if (commissionsError) {
          console.error("Error fetching commissions:", commissionsError);
        }

        const commissions = commissionsData?.reduce((sum, c) => sum + Number(c.total_value || 0), 0) || 0;

        evolutionData.push({
          month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
          leads: leadsCount || 0,
          revenue,
          commissions,
        });
      }

      return evolutionData;
    },
    enabled: isAdmin,
  });
};
