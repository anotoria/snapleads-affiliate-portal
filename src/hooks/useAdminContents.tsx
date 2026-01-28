import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Content } from "./useContents";

export interface ContentFormData {
  module_id: string;
  title: string;
  description?: string;
  content_type: "video" | "text";
  video_url?: string;
  text_content?: string;
  duration_minutes?: number;
  sort_order?: number;
  is_active?: boolean;
}

export const useAdminContents = (moduleId: string | undefined) => {
  return useQuery({
    queryKey: ["admin-contents", moduleId],
    queryFn: async () => {
      if (!moduleId) return [];
      
      const { data, error } = await supabase
        .from("learning_contents")
        .select("*")
        .eq("module_id", moduleId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Content[];
    },
    enabled: !!moduleId,
  });
};

export const useAdminContent = (contentId: string | undefined) => {
  return useQuery({
    queryKey: ["admin-contents", "single", contentId],
    queryFn: async () => {
      if (!contentId) return null;
      
      const { data, error } = await supabase
        .from("learning_contents")
        .select("*")
        .eq("id", contentId)
        .maybeSingle();

      if (error) throw error;
      return data as Content | null;
    },
    enabled: !!contentId,
  });
};

export const useCreateContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: ContentFormData) => {
      const { data, error } = await supabase
        .from("learning_contents")
        .insert(formData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-contents", variables.module_id] });
      queryClient.invalidateQueries({ queryKey: ["contents", variables.module_id] });
      toast({
        title: "Conteúdo criado",
        description: "O conteúdo foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar conteúdo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...formData }: Partial<ContentFormData> & { id: string }) => {
      const { data, error } = await supabase
        .from("learning_contents")
        .update(formData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-contents"] });
      queryClient.invalidateQueries({ queryKey: ["contents", data.module_id] });
      toast({
        title: "Conteúdo atualizado",
        description: "O conteúdo foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar conteúdo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, moduleId }: { id: string; moduleId: string }) => {
      const { error } = await supabase
        .from("learning_contents")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { moduleId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-contents", data.moduleId] });
      queryClient.invalidateQueries({ queryKey: ["contents", data.moduleId] });
      toast({
        title: "Conteúdo excluído",
        description: "O conteúdo foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir conteúdo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
