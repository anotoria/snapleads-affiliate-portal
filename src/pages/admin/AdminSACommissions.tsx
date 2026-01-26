import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SACommissionCard } from "@/components/admin/SACommissionCard";
import { SACommissionTable } from "@/components/admin/SACommissionTable";
import { SACommissionCharts } from "@/components/admin/SACommissionCharts";
import { SASettingsDialog } from "@/components/admin/SASettingsDialog";
import { useSACommissions } from "@/hooks/useSACommissions";
import { useSACommissionSettings } from "@/hooks/useSACommissionSettings";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Users, Percent, TrendingUp, Settings, ShieldAlert } from "lucide-react";
import { Navigate } from "react-router-dom";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const AdminSACommissions = () => {
  const { isSuperAdmin, isLoading: accessLoading } = useAdminAccess();
  const { data, isLoading } = useSACommissions();
  const { settings } = useSACommissionSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Redirect non-super admins
  if (!accessLoading && !isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const averageSACommission =
    data?.totals.totalAffiliates && data.totals.totalAffiliates > 0
      ? data.totals.totalSACommission / data.totals.totalAffiliates
      : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-primary" />
              Comissões do Super Administrador
            </h1>
            <p className="text-muted-foreground">
              Gerencie e visualize suas comissões baseadas nos afiliados
            </p>
          </div>
          <Button onClick={() => setSettingsOpen(true)} variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
        </div>

        {/* Settings Info */}
        {settings && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Teto de Comissão:</span>{" "}
                <span className="font-semibold">{settings.commission_ceiling}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Valor Base do Plano:</span>{" "}
                <span className="font-semibold">{formatCurrency(settings.base_plan_value)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Fórmula:</span>{" "}
                <span className="font-mono text-xs bg-background px-2 py-1 rounded">
                  Comissão SA = {settings.commission_ceiling}% - % Afiliado
                </span>
              </div>
            </div>
          </div>
        )}

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
              <SACommissionCard
                title="Total Comissão SA"
                value={formatCurrency(data?.totals.totalSACommission || 0)}
                subtitle="Este mês"
                icon={DollarSign}
                variant="success"
              />
              <SACommissionCard
                title="Afiliados Ativos"
                value={data?.totals.totalAffiliates || 0}
                subtitle="Com clientes ativos"
                icon={Users}
                variant="primary"
              />
              <SACommissionCard
                title="Total de Clientes"
                value={data?.totals.totalClients || 0}
                subtitle="Ativos na plataforma"
                icon={TrendingUp}
                variant="default"
              />
              <SACommissionCard
                title="Média por Afiliado"
                value={formatCurrency(averageSACommission)}
                subtitle="Comissão SA média"
                icon={Percent}
                variant="warning"
              />
            </>
          )}
        </div>

        {/* Charts */}
        <SACommissionCharts
          breakdown={data?.breakdown || []}
          commissionCeiling={settings?.commission_ceiling || 45}
          isLoading={isLoading}
        />

        {/* Detailed Table */}
        <SACommissionTable
          breakdown={data?.breakdown || []}
          isLoading={isLoading}
        />

        {/* Settings Dialog */}
        <SASettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    </AdminLayout>
  );
};

export default AdminSACommissions;
