import { useState } from "react";
import { FileDown, BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/hooks/useLanguage";
import { useLeads } from "@/hooks/useLeads";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { PageTransition } from "@/components/animations/PageTransition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const Reports = () => {
  const { t } = useLanguage();
  const { data: leads, isLoading: leadsLoading } = useLeads();
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  
  const [selectedPeriod, setSelectedPeriod] = useState("3");

  const isLoading = leadsLoading || metricsLoading;

  // Generate monthly data
  const generateMonthlyData = () => {
    const months = parseInt(selectedPeriod);
    const data = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthLeads = leads?.filter((lead) => {
        const leadDate = new Date(lead.created_at);
        return leadDate >= monthStart && leadDate <= monthEnd;
      }) || [];

      const activeLeads = monthLeads.filter((l) => l.status === "active").length;
      const totalEarnings = monthLeads
        .filter((l) => l.status === "active")
        .reduce((sum, l) => sum + (l.commission || 0), 0);

      data.push({
        month: format(date, "MMM yyyy", { locale: ptBR }),
        leads: monthLeads.length,
        active: activeLeads,
        earnings: totalEarnings,
      });
    }
    
    return data;
  };

  const monthlyData = generateMonthlyData();

  // Calculate summary
  const totalLeads = leads?.length || 0;
  const activeLeads = leads?.filter((l) => l.status === "active").length || 0;
  const conversionRate = totalLeads > 0 ? ((activeLeads / totalLeads) * 100).toFixed(1) : "0";
  const totalEarnings = metrics?.totalEarnings || 0;

  const handleExportCSV = () => {
    if (!leads) return;

    const headers = ["Nome", "Email", "Status", "Comissão", "Data"];
    const rows = leads.map((lead) => [
      lead.name,
      lead.email,
      lead.status,
      lead.commission?.toString() || "0",
      format(new Date(lead.created_at), "dd/MM/yyyy"),
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  return (
    <AppLayout>
      <PageTransition>
        <div className="mx-auto max-w-6xl space-y-6 px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t.reports.title}</h1>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                {t.reports.subtitle}
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Últimos 3 meses</SelectItem>
                  <SelectItem value="6">Últimos 6 meses</SelectItem>
                  <SelectItem value="12">Últimos 12 meses</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
                <FileDown className="h-4 w-4" />
                {t.reports.exportCsv}
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t.reports.totalLeads}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold">{totalLeads}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Leads Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold text-success">{activeLeads}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  {t.reports.conversionRate}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold">{conversionRate}%</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {t.reports.totalEarnings}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-2xl font-bold text-success">{formatCurrency(totalEarnings)}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t.reports.performanceEvolution}
              </CardTitle>
              <CardDescription>
                Evolução de leads e ganhos nos últimos {selectedPeriod} meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number, name: string) => {
                          if (name === "earnings") return [formatCurrency(value), "Ganhos"];
                          if (name === "active") return [value, "Ativos"];
                          return [value, "Leads"];
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="active"
                        stroke="hsl(var(--success))"
                        fillOpacity={1}
                        fill="url(#colorLeads)"
                        name="active"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Report */}
          <Card>
            <CardHeader>
              <CardTitle>{t.reports.monthlyReport}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((month, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium capitalize">{month.month}</p>
                      <p className="text-sm text-muted-foreground">
                        {month.leads} leads • {month.active} ativos
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-success">
                      {formatCurrency(month.earnings)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default Reports;
