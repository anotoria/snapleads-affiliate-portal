import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminTiers, Tier, TierFormData } from "@/hooks/useAdminTiers";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<Tier | null>(null);
  const [formData, setFormData] = useState<TierFormData>({
    name: "",
    display_name: "",
    min_revenue: 0,
    client_count: 0,
    commission_percentage: 0,
    bonus_amount: 0,
    color: "#6B7280",
    sort_order: 0,
    is_active: true,
  });

  // Calcula o faturamento máximo automaticamente (qtde clientes * R$2.500)
  const calculatedMaxRevenue = formData.client_count > 0 ? formData.client_count * 2500 : null;

  const formatCurrency = (value: number) => {
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
    setFormData({
      name: tier.name,
      display_name: tier.display_name,
      min_revenue: Number(tier.min_revenue),
      client_count: (tier as any).client_count ?? 0,
      commission_percentage: Number(tier.commission_percentage),
      bonus_amount: Number(tier.bonus_amount),
      color: tier.color,
      sort_order: tier.sort_order,
      is_active: tier.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingTier) {
      updateTier({ id: editingTier.id, updates: formData });
    } else {
      createTier(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este tier?")) {
      deleteTier(id);
    }
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
                      <TableHead>Faixa de Receita</TableHead>
                      <TableHead className="text-center">Qtde Clientes</TableHead>
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
                      tiers.map((tier) => (
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
                            {formatCurrency(Number(tier.min_revenue))}
                            {" - "}
                            {tier.max_revenue ? formatCurrency(Number(tier.max_revenue)) : "∞"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{(tier as any).client_count || 0}</Badge>
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTier ? t.admin.editTier : t.admin.addTier}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.admin.minRevenue}</Label>
                  <Input
                    type="number"
                    value={formData.min_revenue}
                    onChange={(e) => setFormData({ ...formData, min_revenue: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Qtde de Clientes (Leads)</Label>
                  <Input
                    type="number"
                    value={formData.client_count}
                    onChange={(e) => setFormData({ ...formData, client_count: Number(e.target.value) })}
                    min={0}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.admin.maxRevenue} (calculado automaticamente)</Label>
                <Input
                  type="text"
                  value={calculatedMaxRevenue ? formatCurrency(calculatedMaxRevenue) : "∞"}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  = Qtde de Clientes × R$ 2.500
                </p>
              </div>
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
