import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminRoles } from "@/hooks/useAdminRoles";
import { useAdminAffiliates } from "@/hooks/useAdminAffiliates";
import { useAdminAccess } from "@/hooks/useAdminAccess";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { Shield, Plus, Trash2, Crown, Edit, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const AdminAdmins = () => {
  const { t } = useLanguage();
  const { isSuperAdmin } = useAdminAccess();
  const { admins, isLoading, addAdmin, removeAdmin, updateRole, isAdding, isRemoving, isUpdating } = useAdminRoles();
  const { affiliates } = useAdminAffiliates();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editData, setEditData] = useState<{
    roleId: string;
    userId: string;
    role: "admin" | "super_admin";
  } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<string | null>(null);

  // Get affiliates that are not already admins
  const availableAffiliates = affiliates.filter(
    (affiliate) => !admins.some((admin) => admin.user_id === affiliate.user_id)
  );

  const handleAddClick = () => {
    setDialogMode("add");
    setEditData(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (admin: typeof admins[0]) => {
    setDialogMode("edit");
    setEditData({
      roleId: admin.id,
      userId: admin.user_id,
      role: admin.role,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (roleId: string) => {
    setAdminToDelete(roleId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (adminToDelete) {
      removeAdmin(adminToDelete);
      setDeleteConfirmOpen(false);
      setAdminToDelete(null);
    }
  };

  if (!isSuperAdmin) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
          <p className="text-muted-foreground">
            Apenas Super Administradores podem acessar esta página.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t.admin.admins}</h1>
            <p className="text-muted-foreground">{t.admin.adminsSubtitle}</p>
          </div>
          <Button onClick={handleAddClick}>
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
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(admin)}
                                disabled={isUpdating}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(admin.id)}
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

        {/* Add/Edit Admin Dialog */}
        <AdminFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          availableAffiliates={availableAffiliates}
          onSubmit={addAdmin}
          isSubmitting={isAdding || isUpdating}
          mode={dialogMode}
          editData={editData}
          onUpdateRole={updateRole}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.admin.confirmAction}</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover este administrador? Esta ação pode ser desfeita posteriormente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t.admin.removeAdmin}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminAdmins;
