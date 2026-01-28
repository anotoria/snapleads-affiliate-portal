import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MediaType } from "./useMediaCategories";

export interface MediaItem {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  file_url: string;
  thumbnail_url: string | null;
  file_type: string;
  file_size: number;
  media_type: MediaType;
  dimensions: { width: number; height: number } | null;
  duration_seconds: number | null;
  download_count: number;
  sort_order: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useMediaItems = (categoryId: string | undefined) => {
  return useQuery({
    queryKey: ["media-items", categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from("media_items")
        .select("*")
        .eq("category_id", categoryId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as MediaItem[];
    },
    enabled: !!categoryId,
  });
};

export const useMediaItemsByType = (mediaType: MediaType) => {
  return useQuery({
    queryKey: ["media-items", "type", mediaType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_items")
        .select("*")
        .eq("media_type", mediaType)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as MediaItem[];
    },
  });
};

export const useMediaItem = (itemId: string | undefined) => {
  return useQuery({
    queryKey: ["media-items", "single", itemId],
    queryFn: async () => {
      if (!itemId) return null;
      
      const { data, error } = await supabase
        .from("media_items")
        .select("*")
        .eq("id", itemId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data as MediaItem | null;
    },
    enabled: !!itemId,
  });
};

export const useIncrementDownloadCount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      // First get current count
      const { data: current, error: fetchError } = await supabase
        .from("media_items")
        .select("download_count")
        .eq("id", itemId)
        .single();

      if (fetchError) throw fetchError;

      // Increment the count
      const { data, error } = await supabase
        .from("media_items")
        .update({ download_count: (current?.download_count || 0) + 1 })
        .eq("id", itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, itemId) => {
      queryClient.invalidateQueries({ queryKey: ["media-items"] });
      queryClient.invalidateQueries({ queryKey: ["media-items", "single", itemId] });
    },
  });
};
