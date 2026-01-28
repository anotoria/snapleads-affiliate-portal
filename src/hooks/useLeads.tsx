import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type LeadStatus = "pending" | "late_payment" | "active" | "inactive";

export interface Lead {
  id: string;
  name: string;
  email: string;
  status: LeadStatus;
  commission: number;
  created_at: string;
  updated_at: string;
}

export const useLeads = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["leads", user?.id],
    queryFn: async (): Promise<Lead[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching leads:", error);
        throw error;
      }

      const leads = (data || []).map((lead) => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        status: lead.status as LeadStatus,
        commission: Number(lead.commission),
        created_at: lead.created_at,
        updated_at: lead.updated_at,
      }));

      // Registrar acesso a dados sensiveis para auditoria
      if (leads.length > 0) {
        supabase.rpc("log_sensitive_data_access", {
          _table_name: "leads",
          _record_count: leads.length,
          _query_type: "select",
        }).then(({ error: logError }) => {
          if (logError) {
            console.warn("Failed to log data access:", logError.message);
          }
        });
      }

      return leads;
    },
    enabled: !!user?.id,
  });
};
