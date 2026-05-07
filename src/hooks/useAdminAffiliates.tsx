import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useToast } from "@/hooks/use-toast";

export interface AffiliateWithStats {
  id: string;
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  email: string;
  tier_level: string;
  is_active: boolean;
  phone: string | null;
  cnpj: string | null;
  affiliate_code: string | null;
  created_at: string;
  managed_by: string | null;
  manager_name: string | null;
  leadsCount: number;
  pendingAmount: number;
}

export const useAdminAffiliates = () => {
  const { isAdmin } = useAdminAccess();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const affiliatesQuery = useQuery({
    queryKey: ["admin-affiliates"],
    queryFn: async (): Promise<AffiliateWithStats[]> => {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Log admin access to profiles data for audit trail
      await supabase.rpc('log_admin_data_access', {
        _action: 'VIEW',
        _table_accessed: 'profiles',
        _details: { 
          record_count: profiles?.length || 0, 
          context: 'admin_affiliates_list' 
        }
      });

      // Get all leads grouped by user_id
      const { data: leads, error: leadsError } = await supabase
        .from("leads")
        .select("user_id, id");

      if (leadsError) throw leadsError;

      // Get pending payouts grouped by user_id
      const { data: payouts, error: payoutsError } = await supabase
        .from("payouts")
        .select("user_id, amount")
        .eq("status", "pending");

      if (payoutsError) throw payoutsError;

      // Group leads by user_id
      const leadsCountByUser: Record<string, number> = {};
      leads?.forEach((lead) => {
        leadsCountByUser[lead.user_id] = (leadsCountByUser[lead.user_id] || 0) + 1;
      });

      // Group pending payouts by user_id
      const pendingByUser: Record<string, number> = {};
      payouts?.forEach((payout) => {
        pendingByUser[payout.user_id] =
          (pendingByUser[payout.user_id] || 0) + Number(payout.amount);
      });

      // Build manager name lookup from profiles
      const profileNameByUserId: Record<string, string | null> = {};
      profiles?.forEach((p) => {
        profileNameByUserId[p.user_id] = p.full_name;
      });

      return (profiles || []).map((profile) => ({
        id: profile.id,
        user_id: profile.user_id,
        full_name: profile.full_name,
        company_name: profile.company_name,
        email: "",
        tier_level: profile.tier_level,
        is_active: profile.is_active,
        phone: profile.phone,
        cnpj: profile.cnpj,
        affiliate_code: profile.affiliate_code,
        created_at: profile.created_at,
        managed_by: (profile as { managed_by: string | null }).managed_by ?? null,
        manager_name: (profile as { managed_by: string | null }).managed_by
          ? profileNameByUserId[(profile as { managed_by: string }).managed_by] ?? null
          : null,
        leadsCount: leadsCountByUser[profile.user_id] || 0,
        pendingAmount: pendingByUser[profile.user_id] || 0,
      }));
    },
    enabled: isAdmin,
  });

  const updateAffiliateMutation = useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<{
        is_active: boolean;
        tier_level: string;
        full_name: string;
        company_name: string;
        phone: string;
        cnpj: string;
      }>;
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-affiliates"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-metrics"] });
      toast({
        title: "Afiliado atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleActiveStatus = (userId: string, currentStatus: boolean) => {
    updateAffiliateMutation.mutate({
      userId,
      updates: { is_active: !currentStatus },
    });
  };

  return {
    affiliates: affiliatesQuery.data || [],
    isLoading: affiliatesQuery.isLoading,
    error: affiliatesQuery.error,
    refetch: affiliatesQuery.refetch,
    updateAffiliate: updateAffiliateMutation.mutate,
    toggleActiveStatus,
    isUpdating: updateAffiliateMutation.isPending,
  };
};
