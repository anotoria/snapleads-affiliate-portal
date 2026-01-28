import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Module {
  id: string;
  track_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  contents_count?: number;
}

export const useModules = (trackId: string | undefined) => {
  return useQuery({
    queryKey: ["modules", trackId],
    queryFn: async () => {
      if (!trackId) return [];
      
      const { data, error } = await supabase
        .from("learning_modules")
        .select("*")
        .eq("track_id", trackId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Module[];
    },
    enabled: !!trackId,
  });
};

export const useModule = (moduleId: string | undefined) => {
  return useQuery({
    queryKey: ["modules", "single", moduleId],
    queryFn: async () => {
      if (!moduleId) return null;
      
      const { data, error } = await supabase
        .from("learning_modules")
        .select("*")
        .eq("id", moduleId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data as Module | null;
    },
    enabled: !!moduleId,
  });
};
