import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ContentProgress {
  id: string;
  user_id: string;
  content_id: string;
  completed: boolean;
  progress_percent: number;
  last_watched_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useContentProgress = (contentId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["content-progress", contentId, user?.id],
    queryFn: async () => {
      if (!contentId || !user?.id) return null;
      
      const { data, error } = await supabase
        .from("user_content_progress")
        .select("*")
        .eq("content_id", contentId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as ContentProgress | null;
    },
    enabled: !!contentId && !!user?.id,
  });
};

export const useTrackProgress = (trackId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["track-progress", trackId, user?.id],
    queryFn: async () => {
      if (!trackId || !user?.id) return { completed: 0, total: 0, percent: 0 };
      
      // Get all modules for this track
      const { data: modules, error: modulesError } = await supabase
        .from("learning_modules")
        .select("id")
        .eq("track_id", trackId)
        .eq("is_active", true);

      if (modulesError) throw modulesError;
      if (!modules || modules.length === 0) return { completed: 0, total: 0, percent: 0 };

      const moduleIds = modules.map(m => m.id);

      // Get all contents for these modules
      const { data: contents, error: contentsError } = await supabase
        .from("learning_contents")
        .select("id")
        .in("module_id", moduleIds)
        .eq("is_active", true);

      if (contentsError) throw contentsError;
      if (!contents || contents.length === 0) return { completed: 0, total: 0, percent: 0 };

      const contentIds = contents.map(c => c.id);

      // Get user progress for these contents
      const { data: progress, error: progressError } = await supabase
        .from("user_content_progress")
        .select("*")
        .eq("user_id", user.id)
        .in("content_id", contentIds)
        .eq("completed", true);

      if (progressError) throw progressError;

      const completed = progress?.length || 0;
      const total = contents.length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { completed, total, percent };
    },
    enabled: !!trackId && !!user?.id,
  });
};

export const useUpdateContentProgress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      contentId, 
      completed, 
      progressPercent 
    }: { 
      contentId: string; 
      completed?: boolean; 
      progressPercent?: number;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data: existing } = await supabase
        .from("user_content_progress")
        .select("id")
        .eq("content_id", contentId)
        .eq("user_id", user.id)
        .maybeSingle();

      const updateData: {
        last_watched_at: string;
        completed?: boolean;
        progress_percent?: number;
      } = {
        last_watched_at: new Date().toISOString(),
      };

      if (completed !== undefined) updateData.completed = completed;
      if (progressPercent !== undefined) updateData.progress_percent = progressPercent;

      if (existing) {
        const { data, error } = await supabase
          .from("user_content_progress")
          .update(updateData)
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("user_content_progress")
          .insert({
            user_id: user.id,
            content_id: contentId,
            completed: completed || false,
            progress_percent: progressPercent || 0,
            last_watched_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["content-progress", variables.contentId] });
      queryClient.invalidateQueries({ queryKey: ["track-progress"] });
    },
  });
};

export const useMarkContentComplete = () => {
  const updateProgress = useUpdateContentProgress();

  return useMutation({
    mutationFn: async (contentId: string) => {
      return updateProgress.mutateAsync({
        contentId,
        completed: true,
        progressPercent: 100,
      });
    },
  });
};
