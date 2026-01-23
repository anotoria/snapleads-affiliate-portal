import { Users, DollarSign, BarChart3, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PartnerLevelCard } from "@/components/dashboard/PartnerLevelCard";
import { TierProgressCard } from "@/components/dashboard/TierProgressCard";
import { AffiliateLinkCard } from "@/components/dashboard/AffiliateLinkCard";
import { LeadsPerformanceChart } from "@/components/dashboard/LeadsPerformanceChart";
import { EarningsPerformanceChart } from "@/components/dashboard/EarningsPerformanceChart";
import { CommissionsChart } from "@/components/dashboard/CommissionsChart";
import { PartnerSummaryCard } from "@/components/dashboard/PartnerSummaryCard";
import { PageTransition } from "@/components/animations/PageTransition";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

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
              {t.dashboard.partnerDashboard}
            </h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              {t.dashboard.dashboardSubtitle}
            </p>
          </div>

          {/* Metrics Grid - 4 cards like reference */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title={t.dashboard.activeClients}
              value={String(metrics?.activeLeads ?? 0)}
              icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
              isLoading={isLoading}
              trend={metrics?.leadsChange ? { 
                value: Math.abs(metrics.leadsChange), 
                isPositive: metrics.leadsChange >= 0,
                label: t.dashboard.increase
              } : undefined}
              delay={0}
            />
            <MetricCard
              title={t.dashboard.monthlyRevenue}
              value={formatCurrency(metrics?.monthlyRevenue ?? 0)}
              icon={<BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
              isLoading={isLoading}
              trend={metrics?.monthlyRevenueChange ? { 
                value: Math.abs(metrics.monthlyRevenueChange), 
                isPositive: metrics.monthlyRevenueChange >= 0,
                label: t.dashboard.increase
              } : undefined}
              delay={0.1}
            />
            <MetricCard
              title={t.dashboard.currentCommission}
              value={formatCurrency(metrics?.currentCommission ?? 0)}
              icon={<DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-success" />}
              isLoading={isLoading}
              trend={metrics?.commissionChange ? { 
                value: Math.abs(metrics.commissionChange), 
                isPositive: metrics.commissionChange >= 0,
                label: t.dashboard.increase
              } : undefined}
              delay={0.2}
            />
            <PartnerLevelCard delay={0.3} />
          </div>

          {/* Tier Progress Card */}
          <TierProgressCard />

          {/* Performance Charts */}
          <div className="flex flex-col gap-6">
            <LeadsPerformanceChart />
            <EarningsPerformanceChart />
          </div>

          {/* Partner Summary + Commissions Chart */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <PartnerSummaryCard />
            <CommissionsChart />
          </div>

          {/* Affiliate Link Card */}
          <AffiliateLinkCard />
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default Dashboard;
