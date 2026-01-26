import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useToast } from "@/hooks/use-toast";

export interface SACommissionSettings {
  id: string;
  commission_ceiling: number;
  base_plan_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSACommissionSettings = () => {
  const { isSuperAdmin } = useAdminAccess();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["sa-commission-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sa_commission_settings")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data as SACommissionSettings;
    },
    enabled: isSuperAdmin,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<SACommissionSettings>) => {
      const { data: current } = await supabase
        .from("sa_commission_settings")
        .select("id")
        .eq("is_active", true)
        .single();

      if (!current) throw new Error("Settings not found");

      const { data, error } = await supabase
        .from("sa_commission_settings")
        .update(updates)
        .eq("id", current.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-commission-settings"] });
      queryClient.invalidateQueries({ queryKey: ["sa-commissions"] });
      toast({
        title: "Configurações atualizadas",
        description: "As configurações de comissão SA foram salvas com sucesso.",
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

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    error: settingsQuery.error,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
  };
};
