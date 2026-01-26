import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { useAdminDashboardMetrics } from "@/hooks/useAdminData";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, UserX, FileText, Wallet, DollarSign, HelpCircle, Award } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const TIER_COLORS: Record<string, string> = {
  silver: "#9CA3AF",
  gold: "#F59E0B",
  platinum: "#6B7280",
  diamond: "#3B82F6",
  titanium: "#8B5CF6",
  audaks: "#10B981",
};

const AdminDashboard = () => {
  const { t } = useLanguage();
  const { data: metrics, isLoading } = useAdminDashboardMetrics();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const tierChartData = metrics?.affiliatesByTier.map((item) => ({
    name: item.tier.charAt(0).toUpperCase() + item.tier.slice(1),
    value: item.count,
    color: TIER_COLORS[item.tier] || "#6B7280",
  })) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">{t.admin.dashboard}</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de afiliados
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-20" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <AdminMetricCard
                title={t.admin.totalAffiliates}
                value={metrics?.totalAffiliates || 0}
                icon={Users}
                variant="primary"
              />
              <AdminMetricCard
                title={t.admin.activeAffiliates}
                value={metrics?.activeAffiliates || 0}
                icon={UserCheck}
                variant="success"
              />
              <AdminMetricCard
                title={t.admin.inactiveAffiliates}
                value={metrics?.inactiveAffiliates || 0}
                icon={UserX}
                variant="danger"
              />
              <AdminMetricCard
                title={t.admin.totalLeads}
                value={metrics?.totalLeads || 0}
                icon={FileText}
                variant="default"
              />
            </>
          )}
        </div>

        {/* Second Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-20" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <AdminMetricCard
                title={t.admin.pendingPayouts}
                value={formatCurrency(metrics?.pendingPayoutsAmount || 0)}
                subtitle={`${metrics?.pendingPayoutsCount || 0} solicitações`}
                icon={Wallet}
                variant="warning"
              />
              <AdminMetricCard
                title={t.admin.totalPaid}
                value={formatCurrency(metrics?.totalPaid || 0)}
                icon={DollarSign}
                variant="success"
              />
              <AdminMetricCard
                title={t.admin.openTickets}
                value={metrics?.openTickets || 0}
                icon={HelpCircle}
                variant={metrics?.openTickets && metrics.openTickets > 0 ? "warning" : "default"}
              />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Affiliates by Tier */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                {t.admin.affiliatesByTier}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64" />
              ) : tierChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={tierChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {tierChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value} afiliados`, ""]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  Nenhum afiliado cadastrado
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo Rápido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Taxa de Ativação</p>
                      <p className="text-xs text-muted-foreground">Afiliados ativos / total</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-primary">
                    {metrics?.totalAffiliates
                      ? Math.round((metrics.activeAffiliates / metrics.totalAffiliates) * 100)
                      : 0}%
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Valor Médio por Afiliado</p>
                      <p className="text-xs text-muted-foreground">Total pago / afiliados ativos</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(
                      metrics?.activeAffiliates
                        ? (metrics.totalPaid / metrics.activeAffiliates)
                        : 0
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Leads por Afiliado</p>
                      <p className="text-xs text-muted-foreground">Média de leads ativos</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-blue-600">
                    {metrics?.activeAffiliates
                      ? (metrics.totalLeads / metrics.activeAffiliates).toFixed(1)
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
