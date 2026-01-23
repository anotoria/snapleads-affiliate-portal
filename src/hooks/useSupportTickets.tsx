import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
  category: "billing" | "technical" | "general" | "other";
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
}

export const useSupportTickets = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["support_tickets", user?.id],
    queryFn: async (): Promise<SupportTicket[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching support tickets:", error);
        throw error;
      }

      return (data as SupportTicket[]) || [];
    },
    enabled: !!user,
  });
};

export const useSupportMessages = (ticketId: string | null) => {
  return useQuery({
    queryKey: ["support_messages", ticketId],
    queryFn: async (): Promise<SupportMessage[]> => {
      if (!ticketId) return [];

      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching support messages:", error);
        throw error;
      }

      return (data as SupportMessage[]) || [];
    },
    enabled: !!ticketId,
  });
};

export const useCreateTicket = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticket: {
      subject: string;
      message: string;
      priority: SupportTicket["priority"];
      category: SupportTicket["category"];
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          subject: ticket.subject,
          message: ticket.message,
          priority: ticket.priority,
          category: ticket.category,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support_tickets"] });
      toast({
        title: "Ticket criado",
        description: "Seu ticket foi criado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error creating ticket:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o ticket.",
        variant: "destructive",
      });
    },
  });
};

export const useAddMessage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      message,
    }: {
      ticketId: string;
      message: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("support_messages")
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          message,
          is_admin_reply: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Update ticket status to waiting for response
      await supabase
        .from("support_tickets")
        .update({ status: "open" })
        .eq("id", ticketId);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["support_messages", variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ["support_tickets"] });
    },
    onError: (error) => {
      console.error("Error adding message:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
    },
  });
};
