import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { MediaItem } from "./useMediaItems";
import { MediaType } from "./useMediaCategories";

export interface MediaItemFormData {
  category_id: string;
  title: string;
  description?: string;
  file_url: string;
  thumbnail_url?: string;
  file_type: string;
  file_size?: number;
  media_type: MediaType;
  dimensions?: { width: number; height: number };
  duration_seconds?: number;
  sort_order?: number;
  is_active?: boolean;
}

export const useAdminMediaItems = (categoryId?: string) => {
  return useQuery({
    queryKey: ["admin-media-items", categoryId],
    queryFn: async () => {
      let query = supabase
        .from("media_items")
        .select("*")
        .order("sort_order", { ascending: true });

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as MediaItem[];
    },
  });
};

export const useAdminMediaItem = (itemId: string | undefined) => {
  return useQuery({
    queryKey: ["admin-media-items", "single", itemId],
    queryFn: async () => {
      if (!itemId) return null;
      
      const { data, error } = await supabase
        .from("media_items")
        .select("*")
        .eq("id", itemId)
        .maybeSingle();

      if (error) throw error;
      return data as MediaItem | null;
    },
    enabled: !!itemId,
  });
};

export const useCreateMediaItem = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: MediaItemFormData) => {
      const { data, error } = await supabase
        .from("media_items")
        .insert({
          ...formData,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-media-items"] });
      queryClient.invalidateQueries({ queryKey: ["admin-media-items", variables.category_id] });
      queryClient.invalidateQueries({ queryKey: ["media-items", variables.category_id] });
      toast({
        title: "Mídia criada",
        description: "A mídia foi criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar mídia",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateMediaItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...formData }: Partial<MediaItemFormData> & { id: string }) => {
      const { data, error } = await supabase
        .from("media_items")
        .update(formData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-media-items"] });
      queryClient.invalidateQueries({ queryKey: ["admin-media-items", "single", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["media-items", data.category_id] });
      toast({
        title: "Mídia atualizada",
        description: "A mídia foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar mídia",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteMediaItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, categoryId }: { id: string; categoryId: string }) => {
      const { error } = await supabase
        .from("media_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { categoryId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-media-items"] });
      queryClient.invalidateQueries({ queryKey: ["admin-media-items", data.categoryId] });
      queryClient.invalidateQueries({ queryKey: ["media-items", data.categoryId] });
      toast({
        title: "Mídia excluída",
        description: "A mídia foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir mídia",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
