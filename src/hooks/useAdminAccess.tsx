import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface AdminAccess {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  roles: string[];
}

export const useAdminAccess = (): AdminAccess => {
  const { user, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setRoles([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching user roles:", error);
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setRoles([]);
        } else {
          const userRoles = data?.map((r) => r.role) || [];
          setRoles(userRoles);
          setIsAdmin(userRoles.includes("admin") || userRoles.includes("super_admin"));
          setIsSuperAdmin(userRoles.includes("super_admin"));
        }
      } catch (err) {
        console.error("Error checking admin access:", err);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      checkAdminAccess();
    }
  }, [user, authLoading]);

  return { isAdmin, isSuperAdmin, isLoading: isLoading || authLoading, roles };
};
