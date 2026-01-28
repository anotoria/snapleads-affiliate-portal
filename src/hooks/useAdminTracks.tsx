import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Track } from "./useTracks";

export interface TrackFormData {
  title: string;
  description?: string;
  cover_url?: string;
  sort_order?: number;
  is_active?: boolean;
  is_featured?: boolean;
}

export const useAdminTracks = () => {
  return useQuery({
    queryKey: ["admin-tracks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_tracks")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Track[];
    },
  });
};

export const useAdminTrack = (trackId: string | undefined) => {
  return useQuery({
    queryKey: ["admin-tracks", trackId],
    queryFn: async () => {
      if (!trackId) return null;
      
      const { data, error } = await supabase
        .from("learning_tracks")
        .select("*")
        .eq("id", trackId)
        .maybeSingle();

      if (error) throw error;
      return data as Track | null;
    },
    enabled: !!trackId,
  });
};

export const useCreateTrack = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: TrackFormData) => {
      const { data, error } = await supabase
        .from("learning_tracks")
        .insert({
          ...formData,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tracks"] });
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      toast({
        title: "Trilha criada",
        description: "A trilha foi criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar trilha",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTrack = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...formData }: TrackFormData & { id: string }) => {
      const { data, error } = await supabase
        .from("learning_tracks")
        .update(formData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-tracks"] });
      queryClient.invalidateQueries({ queryKey: ["admin-tracks", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      toast({
        title: "Trilha atualizada",
        description: "A trilha foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar trilha",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTrack = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("learning_tracks")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tracks"] });
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      toast({
        title: "Trilha excluída",
        description: "A trilha foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir trilha",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
