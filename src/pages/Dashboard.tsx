import { useState, useEffect } from "react";
import { DollarSign, Users, MousePointerClick } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AffiliateLinkCard } from "@/components/dashboard/AffiliateLinkCard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { PageTransition } from "@/components/animations/PageTransition";

const Dashboard = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

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
              value="$1,234.56"
              icon={<DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-success" />}
              isLoading={isLoading}
              trend={{ value: 12.5, isPositive: true }}
              delay={0}
            />
            <MetricCard
              title={t.dashboard.activeLeads}
              value="48"
              icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
              isLoading={isLoading}
              trend={{ value: 8.2, isPositive: true }}
              delay={0.1}
            />
            <MetricCard
              title={t.dashboard.clickCount}
              value="1,892"
              icon={<MousePointerClick className="h-5 w-5 sm:h-6 sm:w-6 text-brand-magenta" />}
              isLoading={isLoading}
              trend={{ value: 3.1, isPositive: false }}
              delay={0.2}
            />
          </div>

          {/* Performance Chart */}
          <PerformanceChart isLoading={isLoading} />

          {/* Affiliate Link Card */}
          <AffiliateLinkCard />
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default Dashboard;
