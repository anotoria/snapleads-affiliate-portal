import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Content {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  content_type: "video" | "text";
  video_url: string | null;
  text_content: string | null;
  duration_minutes: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useContents = (moduleId: string | undefined) => {
  return useQuery({
    queryKey: ["contents", moduleId],
    queryFn: async () => {
      if (!moduleId) return [];
      
      const { data, error } = await supabase
        .from("learning_contents")
        .select("*")
        .eq("module_id", moduleId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Content[];
    },
    enabled: !!moduleId,
  });
};

export const useContent = (contentId: string | undefined) => {
  return useQuery({
    queryKey: ["contents", "single", contentId],
    queryFn: async () => {
      if (!contentId) return null;
      
      const { data, error } = await supabase
        .from("learning_contents")
        .select("*")
        .eq("id", contentId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data as Content | null;
    },
    enabled: !!contentId,
  });
};

export const useAllTrackContents = (trackId: string | undefined) => {
  return useQuery({
    queryKey: ["contents", "track", trackId],
    queryFn: async () => {
      if (!trackId) return [];
      
      // Get all modules for this track
      const { data: modules, error: modulesError } = await supabase
        .from("learning_modules")
        .select("id")
        .eq("track_id", trackId)
        .eq("is_active", true);

      if (modulesError) throw modulesError;
      if (!modules || modules.length === 0) return [];

      const moduleIds = modules.map(m => m.id);

      // Get all contents for these modules
      const { data, error } = await supabase
        .from("learning_contents")
        .select("*")
        .in("module_id", moduleIds)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Content[];
    },
    enabled: !!trackId,
  });
};
