import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface DashboardMetrics {
  totalEarnings: number;
  activeLeads: number;
  inactiveLeads: number;
  pendingLeads: number;
  totalLeads: number;
  pendingPayouts: number;
  totalPaid: number;
  availableBalance: number;
  earningsChange: number;
  leadsChange: number;
}

export const useDashboardMetrics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-metrics", user?.id],
    queryFn: async (): Promise<DashboardMetrics> => {
      if (!user?.id) {
        return {
          totalEarnings: 0,
          activeLeads: 0,
          inactiveLeads: 0,
          pendingLeads: 0,
          totalLeads: 0,
          pendingPayouts: 0,
          totalPaid: 0,
          availableBalance: 0,
          earningsChange: 0,
          leadsChange: 0,
        };
      }

      // Fetch leads data
      const { data: leads, error: leadsError } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id);

      if (leadsError) {
        console.error("Error fetching leads:", leadsError);
        throw leadsError;
      }

      // Fetch payouts data
      const { data: payouts, error: payoutsError } = await supabase
        .from("payouts")
        .select("*")
        .eq("user_id", user.id);

      if (payoutsError) {
        console.error("Error fetching payouts:", payoutsError);
        throw payoutsError;
      }

      const leadsData = leads || [];
      const payoutsData = payouts || [];

      // Calculate metrics
      const totalEarnings = leadsData.reduce((sum, lead) => sum + Number(lead.commission), 0);
      const activeLeads = leadsData.filter(lead => lead.status === "active").length;
      const inactiveLeads = leadsData.filter(lead => lead.status === "inactive").length;
      const pendingLeads = leadsData.filter(lead => lead.status === "pending").length;
      const totalLeads = leadsData.length;

      const pendingPayouts = payoutsData
        .filter(p => p.status === "pending" || p.status === "processing")
        .reduce((sum, p) => sum + Number(p.amount), 0);
      
      const totalPaid = payoutsData
        .filter(p => p.status === "completed")
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const availableBalance = totalEarnings - totalPaid - pendingPayouts;

      // Calculate month-over-month changes
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const thisMonthEarnings = leadsData
        .filter(lead => new Date(lead.created_at) >= thisMonth)
        .reduce((sum, lead) => sum + Number(lead.commission), 0);

      const lastMonthEarnings = leadsData
        .filter(lead => {
          const date = new Date(lead.created_at);
          return date >= lastMonth && date < thisMonth;
        })
        .reduce((sum, lead) => sum + Number(lead.commission), 0);

      const earningsChange = lastMonthEarnings > 0 
        ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 
        : thisMonthEarnings > 0 ? 100 : 0;

      const thisMonthLeads = leadsData.filter(lead => new Date(lead.created_at) >= thisMonth).length;
      const lastMonthLeads = leadsData.filter(lead => {
        const date = new Date(lead.created_at);
        return date >= lastMonth && date < thisMonth;
      }).length;

      const leadsChange = lastMonthLeads > 0 
        ? ((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100 
        : thisMonthLeads > 0 ? 100 : 0;

      return {
        totalEarnings,
        activeLeads,
        inactiveLeads,
        pendingLeads,
        totalLeads,
        pendingPayouts,
        totalPaid,
        availableBalance: Math.max(0, availableBalance),
        earningsChange,
        leadsChange,
      };
    },
    enabled: !!user?.id,
  });
};

export interface LeadsChartDataPoint {
  date: string;
  active: number;
  inactive: number;
}

export const useLeadsPerformanceData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["leads-performance-data", user?.id],
    queryFn: async (): Promise<LeadsChartDataPoint[]> => {
      if (!user?.id) return [];

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: leads, error } = await supabase
        .from("leads")
        .select("created_at, updated_at, status")
        .eq("user_id", user.id)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching leads performance data:", error);
        throw error;
      }

      // Group by date - track when leads became active or inactive
      const dataByDate: Record<string, { active: number; inactive: number }> = {};
      
      // Initialize all 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        dataByDate[dateStr] = { active: 0, inactive: 0 };
      }

      // Populate with real data
      (leads || []).forEach((lead) => {
        const createdDateStr = new Date(lead.created_at).toISOString().split("T")[0];
        
        // Count active leads on creation date
        if (lead.status === "active" && dataByDate[createdDateStr]) {
          dataByDate[createdDateStr].active += 1;
        }
        
        // Count inactive leads based on updated_at date
        if (lead.status === "inactive") {
          const updatedDateStr = new Date(lead.updated_at).toISOString().split("T")[0];
          if (dataByDate[updatedDateStr]) {
            dataByDate[updatedDateStr].inactive += 1;
          }
        }
      });

      // Convert to array
      return Object.entries(dataByDate).map(([date, data]) => ({
        date,
        active: data.active,
        inactive: data.inactive,
      }));
    },
    enabled: !!user?.id,
  });
};

export interface EarningsChartDataPoint {
  date: string;
  dailyEarnings: number;
  cumulativeEarnings: number;
}

export const useEarningsPerformanceData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["earnings-performance-data", user?.id],
    queryFn: async (): Promise<EarningsChartDataPoint[]> => {
      if (!user?.id) return [];

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: leads, error } = await supabase
        .from("leads")
        .select("created_at, updated_at, status, commission")
        .eq("user_id", user.id)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching earnings performance data:", error);
        throw error;
      }

      // Group by date
      const dataByDate: Record<string, { earnings: number; losses: number }> = {};
      
      // Initialize all 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        dataByDate[dateStr] = { earnings: 0, losses: 0 };
      }

      // Populate with real data
      (leads || []).forEach((lead) => {
        const commission = Number(lead.commission);
        
        // Active leads add to earnings on creation date
        if (lead.status === "active") {
          const createdDateStr = new Date(lead.created_at).toISOString().split("T")[0];
          if (dataByDate[createdDateStr]) {
            dataByDate[createdDateStr].earnings += commission;
          }
        }
        
        // Inactive leads subtract from earnings on update date
        if (lead.status === "inactive") {
          const updatedDateStr = new Date(lead.updated_at).toISOString().split("T")[0];
          if (dataByDate[updatedDateStr]) {
            dataByDate[updatedDateStr].losses += commission;
          }
        }
      });

      // Convert to array with cumulative calculation
      let cumulative = 0;
      return Object.entries(dataByDate).map(([date, data]) => {
        const dailyNet = data.earnings - data.losses;
        cumulative += dailyNet;
        return {
          date,
          dailyEarnings: dailyNet,
          cumulativeEarnings: Math.max(0, cumulative),
        };
      });
    },
    enabled: !!user?.id,
  });
};

// Keep old hook for backward compatibility if needed elsewhere
export interface ChartDataPoint {
  date: string;
  earnings: number;
  leads: number;
}

export const usePerformanceData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["performance-data", user?.id],
    queryFn: async (): Promise<ChartDataPoint[]> => {
      if (!user?.id) return [];

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: leads, error } = await supabase
        .from("leads")
        .select("created_at, commission")
        .eq("user_id", user.id)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching performance data:", error);
        throw error;
      }

      // Group by date
      const dataByDate: Record<string, { earnings: number; leads: number }> = {};
      
      // Initialize all 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        dataByDate[dateStr] = { earnings: 0, leads: 0 };
      }

      // Populate with real data
      (leads || []).forEach((lead) => {
        const dateStr = new Date(lead.created_at).toISOString().split("T")[0];
        if (dataByDate[dateStr]) {
          dataByDate[dateStr].earnings += Number(lead.commission);
          dataByDate[dateStr].leads += 1;
        }
      });

      // Convert to array
      return Object.entries(dataByDate).map(([date, data]) => ({
        date,
        earnings: data.earnings,
        leads: data.leads,
      }));
    },
    enabled: !!user?.id,
  });
};
