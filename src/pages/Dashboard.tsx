import { DollarSign, Users, MousePointerClick } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AffiliateLinkCard } from "@/components/dashboard/AffiliateLinkCard";
import { LeadsPerformanceChart } from "@/components/dashboard/LeadsPerformanceChart";
import { EarningsPerformanceChart } from "@/components/dashboard/EarningsPerformanceChart";
import { PageTransition } from "@/components/animations/PageTransition";

const Dashboard = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const { data: metrics, isLoading } = useDashboardMetrics();

  return (
    <AppLayout>
      <PageTransition>
        <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8 px-0">
          {/* Welcome Section */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {t.dashboard.hello}, {profile?.full_name?.split(" ")[0] || "there"} 👋
            </h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              {t.dashboard.welcomeMessage}
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title={t.dashboard.totalEarnings}
              value={`$${(metrics?.totalEarnings ?? 0).toFixed(2)}`}
              icon={<DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-success" />}
              isLoading={isLoading}
              trend={{ 
                value: Math.abs(metrics?.earningsChange ?? 0), 
                isPositive: (metrics?.earningsChange ?? 0) >= 0 
              }}
              delay={0}
            />
            <MetricCard
              title={t.dashboard.activeLeads}
              value={String(metrics?.activeLeads ?? 0)}
              icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
              isLoading={isLoading}
              trend={{ 
                value: Math.abs(metrics?.leadsChange ?? 0), 
                isPositive: (metrics?.leadsChange ?? 0) >= 0 
              }}
              delay={0.1}
            />
            <MetricCard
              title={t.dashboard.inactiveLeads}
              value={String(metrics?.inactiveLeads ?? 0)}
              icon={<MousePointerClick className="h-5 w-5 sm:h-6 sm:w-6 text-brand-magenta" />}
              isLoading={isLoading}
              delay={0.2}
            />
          </div>

          {/* Performance Charts - stacked vertically */}
          <div className="flex flex-col gap-6">
            <LeadsPerformanceChart />
            <EarningsPerformanceChart />
          </div>

          {/* Affiliate Link Card */}
          <AffiliateLinkCard />
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default Dashboard;
