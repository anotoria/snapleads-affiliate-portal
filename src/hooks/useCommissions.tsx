import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Commission {
  id: string;
  user_id: string;
  reference_month: string;
  client_count: number;
  base_revenue: number;
  tier_name: string;
  commission_rate: number;
  commission_value: number;
  bonus_value: number;
  total_value: number;
  status: "pending" | "processing" | "completed" | "rejected";
  calculated_at: string;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useCommissions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["commissions", user?.id],
    queryFn: async (): Promise<Commission[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("commission_history")
        .select("*")
        .eq("user_id", user.id)
        .order("reference_month", { ascending: false });

      if (error) {
        console.error("Error fetching commissions:", error);
        throw error;
      }

      return (data as Commission[]) || [];
    },
    enabled: !!user,
  });
};

export const useCommissionsSummary = () => {
  const { data: commissions, isLoading } = useCommissions();

  if (isLoading || !commissions) {
    return {
      totalEarned: 0,
      totalPending: 0,
      totalBonuses: 0,
      isLoading: true,
    };
  }

  const totalEarned = commissions
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + c.total_value, 0);

  const totalPending = commissions
    .filter((c) => c.status === "pending" || c.status === "processing")
    .reduce((sum, c) => sum + c.total_value, 0);

  const totalBonuses = commissions
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + c.bonus_value, 0);

  return {
    totalEarned,
    totalPending,
    totalBonuses,
    isLoading: false,
  };
};
