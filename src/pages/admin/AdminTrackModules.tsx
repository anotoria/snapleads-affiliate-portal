import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  ArrowLeft,
  GripVertical,
  Layers,
  Play
} from "lucide-react";
import { useAdminTrack } from "@/hooks/useAdminTracks";
import { useAdminModules, useCreateModule, useUpdateModule, useDeleteModule, ModuleFormData } from "@/hooks/useAdminModules";
import { Module } from "@/hooks/useModules";
import { useToast } from "@/hooks/use-toast";

const AdminTrackModules = () => {
  const navigate = useNavigate();
  const { id: trackId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { data: track } = useAdminTrack(trackId);
  const { data: modules, isLoading } = useAdminModules(trackId);
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState<ModuleFormData>({
    track_id: trackId || "",
    title: "",
    description: "",
    sort_order: 0,
    is_active: true,
  });

  const handleOpenDialog = (module?: Module) => {
    if (module) {
      setEditingModule(module);
      setFormData({
        track_id: trackId || "",
        title: module.title,
        description: module.description || "",
        sort_order: module.sort_order,
        is_active: module.is_active,
      });
    } else {
      setEditingModule(null);
      setFormData({
        track_id: trackId || "",
        title: "",
        description: "",
        sort_order: modules?.length || 0,
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "O título é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingModule) {
        await updateModule.mutateAsync({ id: editingModule.id, ...formData });
      } else {
        await createModule.mutateAsync(formData);
      }
      setDialogOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (module: Module) => {
    if (window.confirm(`Deseja realmente excluir o módulo "${module.title}"?`)) {
      await deleteModule.mutateAsync({ id: module.id, trackId: trackId || "" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/tracks")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Módulos da Trilha</h1>
            <p className="text-muted-foreground">
              {track?.title || "Carregando..."}
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Módulo
          </Button>
        </div>

        {/* Modules Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Ordem</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : modules && modules.length > 0 ? (
                  modules.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                          {module.sort_order}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {module.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {module.description ? (
                          <span className="line-clamp-1">{module.description}</span>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={module.is_active ? "default" : "secondary"}>
                          {module.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/tracks/${trackId}/modules/${module.id}/contents`)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Conteúdos
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(module)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(module)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Layers className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-2 text-muted-foreground">
                        Nenhum módulo cadastrado
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingModule ? "Editar Módulo" : "Novo Módulo"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Módulo 1 - Introdução"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o conteúdo do módulo..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="sort_order">Ordem de Exibição</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Status Ativo</Label>
                  <p className="text-sm text-muted-foreground">
                    Módulos inativos não aparecem para afiliados
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createModule.isPending || updateModule.isPending}
              >
                {editingModule ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminTrackModules;
