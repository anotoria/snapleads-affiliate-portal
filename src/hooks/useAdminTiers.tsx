import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

export type Tier = Tables<"tiers">;

export interface TierFormData {
  name: string;
  display_name: string;
  min_revenue: number;
  client_count: number;
  commission_percentage: number;
  bonus_amount: number;
  color: string;
  sort_order: number;
  is_active: boolean;
}

export const useAdminTiers = () => {
  const { isAdmin } = useAdminAccess();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tiersQuery = useQuery({
    queryKey: ["admin-tiers"],
    queryFn: async (): Promise<Tier[]> => {
      const { data, error } = await supabase
        .from("tiers")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  const createTierMutation = useMutation({
    mutationFn: async (tier: TierFormData) => {
      const { error } = await supabase.from("tiers").insert(tier);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tiers"] });
      toast({
        title: "Tier criado",
        description: "O tier foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar tier",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTierMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TierFormData> }) => {
      const { error } = await supabase.from("tiers").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tiers"] });
      toast({
        title: "Tier atualizado",
        description: "O tier foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar tier",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTierMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tiers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tiers"] });
      toast({
        title: "Tier removido",
        description: "O tier foi removido com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover tier",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    tiers: tiersQuery.data || [],
    isLoading: tiersQuery.isLoading,
    error: tiersQuery.error,
    createTier: createTierMutation.mutate,
    updateTier: updateTierMutation.mutate,
    deleteTier: deleteTierMutation.mutate,
    isCreating: createTierMutation.isPending,
    isUpdating: updateTierMutation.isPending,
    isDeleting: deleteTierMutation.isPending,
  };
};
