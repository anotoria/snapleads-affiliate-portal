import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface AdminUser {
  id: string;
  user_id: string;
  role: "admin" | "super_admin";
  created_at: string;
  full_name: string | null;
  company_name: string | null;
}

export const useAdminRoles = () => {
  const { isAdmin, isSuperAdmin } = useAdminAccess();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const adminsQuery = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async (): Promise<AdminUser[]> => {
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .in("role", ["admin", "super_admin"])
        .order("created_at", { ascending: false });

      if (rolesError) throw rolesError;

      const userIds = [...new Set(roles?.map((r) => r.user_id) || [])];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, company_name")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      const profileMap: Record<string, { full_name: string | null; company_name: string | null }> = {};
      profiles?.forEach((p) => {
        profileMap[p.user_id] = { full_name: p.full_name, company_name: p.company_name };
      });

      return (roles || []).map((role) => ({
        id: role.id,
        user_id: role.user_id,
        role: role.role as "admin" | "super_admin",
        created_at: role.created_at,
        full_name: profileMap[role.user_id]?.full_name || null,
        company_name: profileMap[role.user_id]?.company_name || null,
      }));
    },
    enabled: isSuperAdmin,
  });

  const addAdminMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "admin" | "super_admin" }) => {
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      toast({
        title: "Admin adicionado",
        description: "O usuário foi promovido a administrador.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar admin",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeAdminMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      toast({
        title: "Admin removido",
        description: "O usuário foi removido da lista de administradores.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover admin",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ roleId, newRole }: { roleId: string; newRole: "admin" | "super_admin" }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("id", roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      toast({
        title: "Role atualizado",
        description: "O nível de acesso foi alterado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    admins: adminsQuery.data || [],
    isLoading: adminsQuery.isLoading,
    error: adminsQuery.error,
    addAdmin: addAdminMutation.mutate,
    removeAdmin: removeAdminMutation.mutate,
    updateRole: updateRoleMutation.mutate,
    isAdding: addAdminMutation.isPending,
    isRemoving: removeAdminMutation.isPending,
    isUpdating: updateRoleMutation.isPending,
  };
};
