import { useState, useEffect } from "react";
import { DollarSign, Users, MousePointerClick } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AffiliateLinkCard } from "@/components/dashboard/AffiliateLinkCard";

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
      <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t.dashboard.hello}, {profile?.full_name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t.dashboard.welcomeMessage}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title={t.dashboard.totalEarnings}
            value="$1,234.56"
            icon={<DollarSign className="h-6 w-6 text-success" />}
            isLoading={isLoading}
            trend={{ value: 12.5, isPositive: true }}
          />
          <MetricCard
            title={t.dashboard.activeLeads}
            value="48"
            icon={<Users className="h-6 w-6 text-primary" />}
            isLoading={isLoading}
            trend={{ value: 8.2, isPositive: true }}
          />
          <MetricCard
            title={t.dashboard.clickCount}
            value="1,892"
            icon={<MousePointerClick className="h-6 w-6 text-brand-magenta" />}
            isLoading={isLoading}
            trend={{ value: 3.1, isPositive: false }}
          />
        </div>

        {/* Affiliate Link Card */}
        <AffiliateLinkCard />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
