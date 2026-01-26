import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useToast } from "@/hooks/use-toast";

export interface AdminTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  user_id: string;
  assigned_to: string | null;
  resolution_notes: string | null;
  affiliate_name: string | null;
  affiliate_company: string | null;
}

export const useAdminTickets = () => {
  const { isAdmin } = useAdminAccess();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const ticketsQuery = useQuery({
    queryKey: ["admin-tickets"],
    queryFn: async (): Promise<AdminTicket[]> => {
      // Get all tickets
      const { data: tickets, error: ticketsError } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (ticketsError) throw ticketsError;

      // Get profile info for each ticket
      const userIds = [...new Set(tickets?.map((t) => t.user_id) || [])];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, company_name")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      const profileMap: Record<string, { full_name: string | null; company_name: string | null }> = {};
      profiles?.forEach((p) => {
        profileMap[p.user_id] = { full_name: p.full_name, company_name: p.company_name };
      });

      return (tickets || []).map((ticket) => ({
        ...ticket,
        affiliate_name: profileMap[ticket.user_id]?.full_name || null,
        affiliate_company: profileMap[ticket.user_id]?.company_name || null,
      }));
    },
    enabled: isAdmin,
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({
      ticketId,
      updates,
    }: {
      ticketId: string;
      updates: Partial<{
        status: string;
        assigned_to: string;
        resolution_notes: string;
        resolved_at: string;
      }>;
    }) => {
      const { error } = await supabase
        .from("support_tickets")
        .update(updates)
        .eq("id", ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-metrics"] });
      toast({
        title: "Ticket atualizado",
        description: "O ticket foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addAdminReplyMutation = useMutation({
    mutationFn: async ({
      ticketId,
      message,
      userId,
    }: {
      ticketId: string;
      message: string;
      userId: string;
    }) => {
      const { error } = await supabase.from("support_messages").insert({
        ticket_id: ticketId,
        message,
        user_id: userId,
        is_admin_reply: true,
      });

      if (error) throw error;

      // Update ticket status to in_progress if it was open
      await supabase
        .from("support_tickets")
        .update({ status: "in_progress" })
        .eq("id", ticketId)
        .eq("status", "open");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      toast({
        title: "Resposta enviada",
        description: "Sua resposta foi enviada ao afiliado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar resposta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resolveTicket = (ticketId: string, resolutionNotes?: string) => {
    updateTicketMutation.mutate({
      ticketId,
      updates: {
        status: "resolved",
        resolved_at: new Date().toISOString(),
        resolution_notes: resolutionNotes,
      },
    });
  };

  const closeTicket = (ticketId: string) => {
    updateTicketMutation.mutate({
      ticketId,
      updates: { status: "closed" },
    });
  };

  return {
    tickets: ticketsQuery.data || [],
    isLoading: ticketsQuery.isLoading,
    error: ticketsQuery.error,
    refetch: ticketsQuery.refetch,
    updateTicket: updateTicketMutation.mutate,
    addAdminReply: addAdminReplyMutation.mutate,
    resolveTicket,
    closeTicket,
    isUpdating: updateTicketMutation.isPending,
    isReplying: addAdminReplyMutation.isPending,
  };
};
