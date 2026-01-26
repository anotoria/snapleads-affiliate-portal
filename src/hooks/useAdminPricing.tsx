import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

export type PricingTier = Tables<"pricing_tiers">;

export interface PricingFormData {
  min_access: number;
  max_access: number | null;
  monthly_price: number;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export const useAdminPricing = () => {
  const { isAdmin } = useAdminAccess();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const pricingQuery = useQuery({
    queryKey: ["admin-pricing"],
    queryFn: async (): Promise<PricingTier[]> => {
      const { data, error } = await supabase
        .from("pricing_tiers")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  const createPricingMutation = useMutation({
    mutationFn: async (pricing: PricingFormData) => {
      const { error } = await supabase.from("pricing_tiers").insert(pricing);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pricing"] });
      toast({
        title: "Faixa de preço criada",
        description: "A faixa de preço foi criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar faixa de preço",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePricingMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PricingFormData> }) => {
      const { error } = await supabase.from("pricing_tiers").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pricing"] });
      toast({
        title: "Faixa de preço atualizada",
        description: "A faixa de preço foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar faixa de preço",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePricingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pricing_tiers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pricing"] });
      toast({
        title: "Faixa de preço removida",
        description: "A faixa de preço foi removida com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover faixa de preço",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    pricingTiers: pricingQuery.data || [],
    isLoading: pricingQuery.isLoading,
    error: pricingQuery.error,
    createPricing: createPricingMutation.mutate,
    updatePricing: updatePricingMutation.mutate,
    deletePricing: deletePricingMutation.mutate,
    isCreating: createPricingMutation.isPending,
    isUpdating: updatePricingMutation.isPending,
    isDeleting: deletePricingMutation.isPending,
  };
};
