import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AffiliateCommissionBreakdown } from "@/hooks/useSACommissions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, PieChartIcon } from "lucide-react";

interface SACommissionChartsProps {
  breakdown: AffiliateCommissionBreakdown[];
  commissionCeiling: number;
  isLoading?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const TIER_COLORS: Record<string, string> = {
  silver: "#9CA3AF",
  gold: "#F59E0B",
  platinum: "#6B7280",
  diamond: "#3B82F6",
  titanium: "#8B5CF6",
  audaks: "#10B981",
};

export const SACommissionCharts = ({
  breakdown,
  commissionCeiling,
  isLoading,
}: SACommissionChartsProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="flex h-80 items-center justify-center">
            <p className="text-muted-foreground">Carregando gráficos...</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex h-80 items-center justify-center">
            <p className="text-muted-foreground">Carregando gráficos...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Top 10 affiliates by SA commission
  const topAffiliates = breakdown
    .filter((b) => b.saCommissionTotal > 0)
    .slice(0, 10)
    .map((b) => ({
      name: b.affiliateName.split(" ")[0],
      affiliateCommission: b.affiliateCommissionTotal,
      saCommission: b.saCommissionTotal,
      tier: b.affiliateTier,
    }));

  // Commission distribution by tier
  const tierDistribution = breakdown.reduce((acc, item) => {
    const tier = item.affiliateTier;
    if (!acc[tier]) {
      acc[tier] = { tier, saCommission: 0, count: 0 };
    }
    acc[tier].saCommission += item.saCommissionTotal;
    acc[tier].count += 1;
    return acc;
  }, {} as Record<string, { tier: string; saCommission: number; count: number }>);

  const pieData = Object.values(tierDistribution)
    .filter((d) => d.saCommission > 0)
    .map((d) => ({
      name: d.tier.charAt(0).toUpperCase() + d.tier.slice(1),
      value: d.saCommission,
      color: TIER_COLORS[d.tier] || "#6B7280",
    }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Bar Chart - Top Affiliates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Top 10 Afiliados (Comissão SA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topAffiliates.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Nenhum dado disponível
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topAffiliates} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === "saCommission" ? "Comissão SA" : "Comissão Afiliado",
                  ]}
                />
                <Bar
                  dataKey="saCommission"
                  fill="hsl(var(--primary))"
                  name="Comissão SA"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Pie Chart - Distribution by Tier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            Distribuição por Plano
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Nenhum dado disponível
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Comissão SA"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
