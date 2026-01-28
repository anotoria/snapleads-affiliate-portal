import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MediaCategory, MediaType } from "./useMediaCategories";

export interface MediaCategoryFormData {
  name: string;
  display_name: string;
  type: MediaType;
  description?: string;
  cover_url?: string;
  sort_order?: number;
  is_active?: boolean;
}

export const useAdminMediaCategories = (type?: MediaType) => {
  return useQuery({
    queryKey: ["admin-media-categories", type],
    queryFn: async () => {
      let query = supabase
        .from("media_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as MediaCategory[];
    },
  });
};

export const useAdminMediaCategory = (categoryId: string | undefined) => {
  return useQuery({
    queryKey: ["admin-media-categories", "single", categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      
      const { data, error } = await supabase
        .from("media_categories")
        .select("*")
        .eq("id", categoryId)
        .maybeSingle();

      if (error) throw error;
      return data as MediaCategory | null;
    },
    enabled: !!categoryId,
  });
};

export const useCreateMediaCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: MediaCategoryFormData) => {
      const { data, error } = await supabase
        .from("media_categories")
        .insert(formData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media-categories"] });
      queryClient.invalidateQueries({ queryKey: ["media-categories"] });
      toast({
        title: "Categoria criada",
        description: "A categoria foi criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateMediaCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...formData }: Partial<MediaCategoryFormData> & { id: string }) => {
      const { data, error } = await supabase
        .from("media_categories")
        .update(formData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-media-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-media-categories", "single", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["media-categories"] });
      toast({
        title: "Categoria atualizada",
        description: "A categoria foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteMediaCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("media_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media-categories"] });
      queryClient.invalidateQueries({ queryKey: ["media-categories"] });
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
