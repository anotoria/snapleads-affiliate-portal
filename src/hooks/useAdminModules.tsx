import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Module } from "./useModules";

export interface ModuleFormData {
  track_id: string;
  title: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export const useAdminModules = (trackId: string | undefined) => {
  return useQuery({
    queryKey: ["admin-modules", trackId],
    queryFn: async () => {
      if (!trackId) return [];
      
      const { data, error } = await supabase
        .from("learning_modules")
        .select("*")
        .eq("track_id", trackId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Module[];
    },
    enabled: !!trackId,
  });
};

export const useAdminModule = (moduleId: string | undefined) => {
  return useQuery({
    queryKey: ["admin-modules", "single", moduleId],
    queryFn: async () => {
      if (!moduleId) return null;
      
      const { data, error } = await supabase
        .from("learning_modules")
        .select("*")
        .eq("id", moduleId)
        .maybeSingle();

      if (error) throw error;
      return data as Module | null;
    },
    enabled: !!moduleId,
  });
};

export const useCreateModule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: ModuleFormData) => {
      const { data, error } = await supabase
        .from("learning_modules")
        .insert(formData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-modules", variables.track_id] });
      queryClient.invalidateQueries({ queryKey: ["modules", variables.track_id] });
      toast({
        title: "Módulo criado",
        description: "O módulo foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar módulo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateModule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...formData }: Partial<ModuleFormData> & { id: string }) => {
      const { data, error } = await supabase
        .from("learning_modules")
        .update(formData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-modules"] });
      queryClient.invalidateQueries({ queryKey: ["modules", data.track_id] });
      toast({
        title: "Módulo atualizado",
        description: "O módulo foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar módulo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteModule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, trackId }: { id: string; trackId: string }) => {
      const { error } = await supabase
        .from("learning_modules")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { trackId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-modules", data.trackId] });
      queryClient.invalidateQueries({ queryKey: ["modules", data.trackId] });
      toast({
        title: "Módulo excluído",
        description: "O módulo foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir módulo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
