import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useLeadsPerformanceData } from "@/hooks/useDashboardMetrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Users, Loader2 } from "lucide-react";

const chartConfig = {
  active: {
    label: "Active",
    color: "hsl(var(--success))",
  },
  inactive: {
    label: "Inactive",
    color: "hsl(var(--destructive))",
  },
};

export const LeadsPerformanceChart = () => {
  const { t } = useLanguage();
  const { data: rawData = [], isLoading } = useLeadsPerformanceData();

  // Format data for display
  const data = rawData.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  if (isLoading) {
    return (
      <Card className="border-border/50 shadow-card">
        <CardHeader className="px-4 sm:px-6">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent className="px-4 sm:px-6 flex items-center justify-center h-[250px] sm:h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      whileHover={{ y: -2 }}
    >
      <Card className="border-border/50 shadow-card">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Users className="h-5 w-5 text-primary" />
              </motion.div>
              <div>
                <CardTitle className="text-base sm:text-lg">{t.dashboard.leadsPerformance}</CardTitle>
                <CardDescription className="text-sm">{t.dashboard.last30Days}</CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-success" />
                <span className="text-muted-foreground">{t.dashboard.activeEntries}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-destructive" />
                <span className="text-muted-foreground">{t.dashboard.inactiveExits}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickMargin={8}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickMargin={8}
                width={35}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="active"
                name={t.dashboard.activeEntries}
                fill="hsl(var(--success))"
                radius={[4, 4, 0, 0]}
                stackId="leads"
              />
              <Bar
                dataKey="inactive"
                name={t.dashboard.inactiveExits}
                fill="hsl(var(--destructive))"
                radius={[4, 4, 0, 0]}
                stackId="leads"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};
