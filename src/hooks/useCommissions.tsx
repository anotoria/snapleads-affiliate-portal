import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAccess } from "@/hooks/useAdminAccess";

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

// Interface para dados da view filtrada (usuarios normais)
interface CommissionUserView {
  id: string;
  user_id: string;
  reference_month: string;
  client_count: number;
  total_value: number;
  status: string;
  calculated_at: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useCommissions = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdminAccess();

  return useQuery({
    queryKey: ["commissions", user?.id, isAdmin],
    queryFn: async (): Promise<Commission[]> => {
      if (!user) return [];

      // Admins usam tabela completa, usuarios usam view filtrada
      if (isAdmin) {
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
      }

      // Usuarios normais: usar view que oculta detalhes de calculo
      const { data, error } = await supabase
        .from("commission_history_user")
        .select("*")
        .eq("user_id", user.id)
        .order("reference_month", { ascending: false });

      if (error) {
        console.error("Error fetching commissions:", error);
        throw error;
      }

      // Mapear view para interface Commission (campos ocultos como 0/vazio)
      return (data as CommissionUserView[]).map((c) => ({
        id: c.id,
        user_id: c.user_id,
        reference_month: c.reference_month,
        client_count: c.client_count,
        base_revenue: 0, // Oculto
        tier_name: "", // Oculto
        commission_rate: 0, // Oculto
        commission_value: 0, // Oculto
        bonus_value: 0, // Oculto
        total_value: c.total_value,
        status: c.status as Commission["status"],
        calculated_at: c.calculated_at,
        paid_at: c.paid_at,
        notes: null, // Oculto
        created_at: c.created_at,
        updated_at: c.updated_at,
      }));
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
