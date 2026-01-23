import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useCommissionsChartData } from "@/hooks/useDashboardMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

const chartConfig = {
  commission: {
    label: "Comissões",
    color: "hsl(var(--primary))",
  },
};

const formatCurrency = (value: number) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  }
  return value.toString();
};

export const CommissionsChart = () => {
  const { t } = useLanguage();
  const { data: chartData = [], isLoading } = useCommissionsChartData();

  if (isLoading) {
    return (
      <Card className="border-border/50 shadow-card">
        <CardHeader className="px-4 sm:px-6">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
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
      transition={{ duration: 0.4, delay: 0.5 }}
      whileHover={{ y: -2 }}
    >
      <Card className="border-border/50 shadow-card">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg">
            {t.dashboard.commissionsLast6Months || "Comissões (Últimos 6 meses)"}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="monthLabel" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickMargin={8}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickMargin={8}
                width={45}
                tickFormatter={formatCurrency}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => [
                  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value),
                  "Comissão"
                ]}
              />
              <Line
                type="monotone"
                dataKey="commission"
                name="Comissão"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ 
                  fill: "hsl(var(--primary))", 
                  strokeWidth: 2, 
                  r: 4,
                  stroke: "hsl(var(--background))"
                }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};
