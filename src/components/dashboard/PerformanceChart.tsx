import { useMemo } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

// Generate mock data for the last 30 days
const generateChartData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      earnings: Math.floor(Math.random() * 150) + 20,
      leads: Math.floor(Math.random() * 8) + 1,
      clicks: Math.floor(Math.random() * 100) + 30,
    });
  }
  
  return data;
};

const chartConfig = {
  earnings: {
    label: "Earnings",
    color: "hsl(var(--success))",
  },
  leads: {
    label: "Leads",
    color: "hsl(var(--primary))",
  },
  clicks: {
    label: "Clicks",
    color: "hsl(var(--brand-magenta))",
  },
};

interface PerformanceChartProps {
  isLoading?: boolean;
}

export const PerformanceChart = ({ isLoading = false }: PerformanceChartProps) => {
  const { t } = useLanguage();
  const data = useMemo(() => generateChartData(), []);

  if (isLoading) {
    return (
      <Card className="border-border/50 shadow-card">
        <CardHeader className="px-4 sm:px-6">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="h-[250px] sm:h-[300px] bg-muted animate-pulse rounded" />
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
                <TrendingUp className="h-5 w-5 text-primary" />
              </motion.div>
              <div>
                <CardTitle className="text-base sm:text-lg">{t.dashboard.performanceOverview}</CardTitle>
                <CardDescription className="text-sm">{t.dashboard.last30Days}</CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-success" />
                <span className="text-muted-foreground">{t.dashboard.earnings}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">{t.dashboard.leads}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-brand-magenta" />
                <span className="text-muted-foreground">{t.dashboard.clicks}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--brand-magenta))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--brand-magenta))" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                fill="url(#fillEarnings)"
              />
              <Area
                type="monotone"
                dataKey="leads"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#fillLeads)"
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="hsl(var(--brand-magenta))"
                strokeWidth={2}
                fill="url(#fillClicks)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};
