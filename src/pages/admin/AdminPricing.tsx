import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminPricing, PricingTier, PricingFormData } from "@/hooks/useAdminPricing";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { DollarSign, Plus, Edit, Trash2 } from "lucide-react";

const AdminPricing = () => {
  const { t } = useLanguage();
  const { pricingTiers, isLoading, createPricing, updatePricing, deletePricing, isCreating, isUpdating, isDeleting } = useAdminPricing();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState<PricingTier | null>(null);
  const [formData, setFormData] = useState<PricingFormData>({
    min_access: 0,
    max_access: null,
    monthly_price: 0,
    description: null,
    sort_order: 0,
    is_active: true,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const openCreateDialog = () => {
    setEditingPricing(null);
    setFormData({
      min_access: 0,
      max_access: null,
      monthly_price: 0,
      description: null,
      sort_order: pricingTiers.length,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (pricing: PricingTier) => {
    setEditingPricing(pricing);
    setFormData({
      min_access: pricing.min_access,
      max_access: pricing.max_access,
      monthly_price: Number(pricing.monthly_price),
      description: pricing.description,
      sort_order: pricing.sort_order,
      is_active: pricing.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingPricing) {
      updatePricing({ id: editingPricing.id, updates: formData });
    } else {
      createPricing(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta faixa de preço?")) {
      deletePricing(id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t.admin.pricing}</h1>
            <p className="text-muted-foreground">{t.admin.pricingSubtitle}</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            {t.admin.addPricing}
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Faixas de Preço por Acessos
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
                      <TableHead>Faixa de Acessos</TableHead>
                      <TableHead className="text-right">Preço Mensal</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricingTiers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhuma faixa de preço cadastrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      pricingTiers.map((pricing) => (
                        <TableRow key={pricing.id}>
                          <TableCell>{pricing.sort_order + 1}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {pricing.min_access} - {pricing.max_access || "∞"} acessos
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(Number(pricing.monthly_price))}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {pricing.description || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={pricing.is_active ? "default" : "secondary"}>
                              {pricing.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(pricing)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(pricing.id)}
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
                {editingPricing ? t.admin.editPricing : t.admin.addPricing}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.admin.minAccess}</Label>
                  <Input
                    type="number"
                    value={formData.min_access}
                    onChange={(e) => setFormData({ ...formData, min_access: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.admin.maxAccess}</Label>
                  <Input
                    type="number"
                    value={formData.max_access || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_access: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="∞"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.admin.monthlyPrice}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.monthly_price}
                    onChange={(e) => setFormData({ ...formData, monthly_price: Number(e.target.value) })}
                  />
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
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
                  placeholder="Descrição opcional..."
                />
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

export default AdminPricing;
