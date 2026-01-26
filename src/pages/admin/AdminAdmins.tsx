import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminRoles } from "@/hooks/useAdminRoles";
import { useAdminAffiliates } from "@/hooks/useAdminAffiliates";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Plus, Trash2, Crown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const AdminAdmins = () => {
  const { t } = useLanguage();
  const { admins, isLoading, addAdmin, removeAdmin, updateRole, isAdding, isRemoving, isUpdating } = useAdminRoles();
  const { affiliates } = useAdminAffiliates();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "super_admin">("admin");

  // Get affiliates that are not already admins
  const availableAffiliates = affiliates.filter(
    (affiliate) => !admins.some((admin) => admin.user_id === affiliate.user_id)
  );

  const handleAddAdmin = () => {
    if (selectedUserId) {
      addAdmin({ userId: selectedUserId, role: selectedRole });
      setIsDialogOpen(false);
      setSelectedUserId("");
      setSelectedRole("admin");
    }
  };

  const handleRemoveAdmin = (roleId: string) => {
    if (confirm("Tem certeza que deseja remover este administrador?")) {
      removeAdmin(roleId);
    }
  };

  const handlePromoteToSuperAdmin = (roleId: string) => {
    if (confirm("Deseja promover este usuário a Super Admin?")) {
      updateRole({ roleId, newRole: "super_admin" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t.admin.admins}</h1>
            <p className="text-muted-foreground">{t.admin.adminsSubtitle}</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t.admin.addAdmin}
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Administradores do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>{t.admin.role}</TableHead>
                      <TableHead>Adicionado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum administrador cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      admins.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {admin.role === "super_admin" && (
                                <Crown className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className="font-medium">{admin.full_name || "—"}</span>
                            </div>
                          </TableCell>
                          <TableCell>{admin.company_name || "—"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={admin.role === "super_admin" ? "default" : "outline"}
                              className={admin.role === "super_admin" ? "bg-yellow-500" : ""}
                            >
                              {admin.role === "super_admin" ? t.admin.superAdmin : t.admin.adminRole}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(admin.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {admin.role === "admin" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePromoteToSuperAdmin(admin.id)}
                                  disabled={isUpdating}
                                >
                                  <Crown className="mr-2 h-4 w-4" />
                                  {t.admin.promoteToSuperAdmin}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveAdmin(admin.id)}
                                disabled={isRemoving}
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

        {/* Add Admin Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t.admin.addAdmin}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Selecione o Afiliado</label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um afiliado..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAffiliates.map((affiliate) => (
                      <SelectItem key={affiliate.user_id} value={affiliate.user_id}>
                        {affiliate.full_name || affiliate.company_name || "Sem nome"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.admin.role}</label>
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as typeof selectedRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t.admin.adminRole}</SelectItem>
                    <SelectItem value="super_admin">{t.admin.superAdmin}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleAddAdmin} disabled={!selectedUserId || isAdding}>
                {t.common.add}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminAdmins;
