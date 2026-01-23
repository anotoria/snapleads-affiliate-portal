import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { useLanguage } from "./useLanguage";

export type PayoutStatus = "pending" | "processing" | "completed";
export type PayoutMethod = "pix" | "bank_transfer" | "paypal";

export interface Payout {
  id: string;
  amount: number;
  status: PayoutStatus;
  method: PayoutMethod;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export const usePayouts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["payouts", user?.id],
    queryFn: async (): Promise<Payout[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("payouts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching payouts:", error);
        throw error;
      }

      return (data || []).map((payout) => ({
        id: payout.id,
        amount: Number(payout.amount),
        status: payout.status as PayoutStatus,
        method: payout.method as PayoutMethod,
        created_at: payout.created_at,
        updated_at: payout.updated_at,
        completed_at: payout.completed_at,
      }));
    },
    enabled: !!user?.id,
  });
};

export const useRequestPayout = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, method }: { amount: number; method: PayoutMethod }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("payouts")
        .insert({
          user_id: user.id,
          amount,
          method,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      toast.success(t.payouts.requestPayout);
    },
    onError: (error) => {
      console.error("Error requesting payout:", error);
      toast.error("Failed to request payout");
    },
  });
};
