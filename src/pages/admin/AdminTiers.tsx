import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminTiers, Tier, TierFormData } from "@/hooks/useAdminTiers";
import { useSACommissionSettings } from "@/hooks/useSACommissionSettings";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Award, Plus, Edit, Trash2 } from "lucide-react";

const AdminTiers = () => {
  const { t } = useLanguage();
  const { tiers, isLoading, createTier, updateTier, deleteTier, isCreating, isUpdating, isDeleting } = useAdminTiers();
  const { settings: saSettings } = useSACommissionSettings();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<Tier | null>(null);
  const [formData, setFormData] = useState<TierFormData>({
    name: "",
    display_name: "",
    min_revenue: 0,
    min_client_count: 0,
    next_level_client_count: null,
    is_unlimited: false,
    client_count: 0,
    commission_percentage: 0,
    bonus_amount: 0,
    color: "#6B7280",
    sort_order: 0,
    is_active: true,
  });

  // Valor base do plano (buscar de sa_commission_settings ou usar padrão)
  const BASE_PLAN_VALUE = saSettings?.base_plan_value ?? 2500;

  // Cálculos automáticos de faturamento
  const calculatedMinRevenue = useMemo(() => {
    return formData.min_client_count * BASE_PLAN_VALUE;
  }, [formData.min_client_count, BASE_PLAN_VALUE]);

  const calculatedNextLevelRevenue = useMemo(() => {
    if (formData.is_unlimited) {
      return null;
    }
    return (formData.next_level_client_count || 0) * BASE_PLAN_VALUE;
  }, [formData.next_level_client_count, formData.is_unlimited, BASE_PLAN_VALUE]);

  const formatCurrency = (value: number | null) => {
    if (value === null) return "∞";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const openCreateDialog = () => {
    setEditingTier(null);
    setFormData({
      name: "",
      display_name: "",
      min_revenue: 0,
      min_client_count: 0,
      next_level_client_count: null,
      is_unlimited: false,
      client_count: 0,
      commission_percentage: 0,
      bonus_amount: 0,
      color: "#6B7280",
      sort_order: tiers.length,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (tier: Tier) => {
    setEditingTier(tier);
    const tierData = tier as any;
    setFormData({
      name: tier.name,
      display_name: tier.display_name,
      min_revenue: Number(tier.min_revenue),
      min_client_count: tierData.min_client_count ?? 0,
      next_level_client_count: tierData.next_level_client_count ?? null,
      is_unlimited: tierData.is_unlimited ?? false,
      client_count: tierData.client_count ?? 0,
      commission_percentage: Number(tier.commission_percentage),
      bonus_amount: Number(tier.bonus_amount),
      color: tier.color,
      sort_order: tier.sort_order,
      is_active: tier.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    // Sincroniza client_count com next_level_client_count para compatibilidade
    const dataToSave = {
      ...formData,
      min_revenue: calculatedMinRevenue,
      client_count: formData.next_level_client_count ?? 0,
    };

    if (editingTier) {
      updateTier({ id: editingTier.id, updates: dataToSave });
    } else {
      createTier(dataToSave);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este tier?")) {
      deleteTier(id);
    }
  };

  const handleUnlimitedChange = (checked: boolean) => {
    setFormData({
      ...formData,
      is_unlimited: checked,
      next_level_client_count: checked ? null : formData.next_level_client_count,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t.admin.tiers}</h1>
            <p className="text-muted-foreground">{t.admin.tiersSubtitle}</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            {t.admin.addTier}
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Níveis de Parceria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ordem</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Qtde Clientes</TableHead>
                      <TableHead>Faixa de Receita</TableHead>
                      <TableHead className="text-center">Comissão</TableHead>
                      <TableHead className="text-right">Bônus</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tiers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Nenhum tier cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      tiers.map((tier) => {
                        const tierData = tier as any;
                        const minClients = tierData.min_client_count ?? 0;
                        const nextClients = tierData.next_level_client_count;
                        const isUnlimited = tierData.is_unlimited ?? false;
                        const minRev = minClients * BASE_PLAN_VALUE;
                        const nextRev = nextClients ? nextClients * BASE_PLAN_VALUE : null;

                        return (
                          <TableRow key={tier.id}>
                            <TableCell>{tier.sort_order + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-4 w-4 rounded-full"
                                  style={{ backgroundColor: tier.color }}
                                />
                                <div>
                                  <p className="font-medium">{tier.display_name}</p>
                                  <p className="text-xs text-muted-foreground">{tier.name}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {minClients} - {isUnlimited ? "∞" : nextClients ?? 0}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatCurrency(minRev)}
                              {" - "}
                              {isUnlimited ? (
                                <span className="font-medium">+de {formatCurrency(minRev)} (∞)</span>
                              ) : (
                                formatCurrency(nextRev)
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{tier.commission_percentage}%</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(Number(tier.bonus_amount))}
                            </TableCell>
                            <TableCell>
                              <Badge variant={tier.is_active ? "default" : "secondary"}>
                                {tier.is_active ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(tier)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(tier.id)}
                                  disabled={isDeleting}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingTier ? t.admin.editTier : t.admin.addTier}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
              {/* Nome e Nome de Exibição */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.admin.tierName}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="silver"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.admin.displayName}</Label>
                  <Input
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="Silver"
                  />
                </div>
              </div>

              {/* Qtde Clientes Inicial e Próximo Nível */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Qtde Clientes Inicial</Label>
                  <Input
                    type="number"
                    value={formData.min_client_count}
                    onChange={(e) => setFormData({ ...formData, min_client_count: Number(e.target.value) })}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Qtde Clientes Próximo Nível</Label>
                  <Input
                    type="number"
                    value={formData.next_level_client_count ?? ""}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      next_level_client_count: e.target.value ? Number(e.target.value) : null 
                    })}
                    min={0}
                    disabled={formData.is_unlimited}
                    placeholder={formData.is_unlimited ? "∞" : ""}
                  />
                </div>
              </div>

              {/* Checkbox Sem limite máximo */}
              <div className="flex items-center space-x-2 py-2">
                <Checkbox
                  id="is_unlimited"
                  checked={formData.is_unlimited}
                  onCheckedChange={handleUnlimitedChange}
                />
                <Label htmlFor="is_unlimited" className="cursor-pointer">
                  Sem limite máximo (último nível)
                </Label>
              </div>

              {/* Faturamento Inicial (calculado) */}
              <div className="space-y-2">
                <Label>Faturamento Inicial (calculado)</Label>
                <Input
                  type="text"
                  value={formatCurrency(calculatedMinRevenue)}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  = Qtde Clientes Inicial × {formatCurrency(BASE_PLAN_VALUE)}
                </p>
              </div>

              {/* Faturamento Próximo Nível (calculado) */}
              <div className="space-y-2">
                <Label>Faturamento Próximo Nível (calculado)</Label>
                <Input
                  type="text"
                  value={
                    formData.is_unlimited
                      ? `+de ${formatCurrency(calculatedMinRevenue)} (∞)`
                      : formatCurrency(calculatedNextLevelRevenue)
                  }
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.is_unlimited 
                    ? "Nível sem limite máximo de clientes"
                    : `= Qtde Clientes Próximo Nível × ${formatCurrency(BASE_PLAN_VALUE)}`
                  }
                </p>
              </div>

              {/* Comissão e Bônus */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.admin.commissionPercentage}</Label>
                  <Input
                    type="number"
                    value={formData.commission_percentage}
                    onChange={(e) =>
                      setFormData({ ...formData, commission_percentage: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.admin.bonusAmount}</Label>
                  <Input
                    type="number"
                    value={formData.bonus_amount}
                    onChange={(e) => setFormData({ ...formData, bonus_amount: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Cor e Ordem */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.admin.color}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t.admin.sortOrder}</Label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Switch Ativo */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
                {t.common.save}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminTiers;
