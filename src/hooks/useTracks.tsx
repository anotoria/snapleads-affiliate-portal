import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Track {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  modules_count?: number;
  contents_count?: number;
}

export const useTracks = () => {
  return useQuery({
    queryKey: ["tracks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_tracks")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Track[];
    },
  });
};

export const useFeaturedTracks = () => {
  return useQuery({
    queryKey: ["tracks", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_tracks")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Track[];
    },
  });
};

export const useTrack = (trackId: string | undefined) => {
  return useQuery({
    queryKey: ["tracks", trackId],
    queryFn: async () => {
      if (!trackId) return null;
      
      const { data, error } = await supabase
        .from("learning_tracks")
        .select("*")
        .eq("id", trackId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data as Track | null;
    },
    enabled: !!trackId,
  });
};
