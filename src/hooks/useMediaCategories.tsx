import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MediaType = "photo" | "video" | "file";

export interface MediaCategory {
  id: string;
  name: string;
  display_name: string;
  type: MediaType;
  description: string | null;
  cover_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  items_count?: number;
}

export const useMediaCategories = (type?: MediaType) => {
  return useQuery({
    queryKey: ["media-categories", type],
    queryFn: async () => {
      let query = supabase
        .from("media_categories")
        .select("*")
        .eq("is_active", true)
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

export const useMediaCategory = (categoryId: string | undefined) => {
  return useQuery({
    queryKey: ["media-categories", "single", categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      
      const { data, error } = await supabase
        .from("media_categories")
        .select("*")
        .eq("id", categoryId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data as MediaCategory | null;
    },
    enabled: !!categoryId,
  });
};

export const useMediaCategoriesGrouped = () => {
  return useQuery({
    queryKey: ["media-categories", "grouped"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      const categories = data as MediaCategory[];
      
      return {
        photo: categories.filter(c => c.type === "photo"),
        video: categories.filter(c => c.type === "video"),
        file: categories.filter(c => c.type === "file"),
      };
    },
  });
};
