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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Play,
  FileText,
  Clock
} from "lucide-react";
import { useAdminModule } from "@/hooks/useAdminModules";
import { useAdminContents, useCreateContent, useUpdateContent, useDeleteContent, ContentFormData } from "@/hooks/useAdminContents";
import { Content } from "@/hooks/useContents";
import { useToast } from "@/hooks/use-toast";

const AdminContents = () => {
  const navigate = useNavigate();
  const { trackId, moduleId } = useParams<{ trackId: string; moduleId: string }>();
  const { toast } = useToast();
  const { data: module } = useAdminModule(moduleId);
  const { data: contents, isLoading } = useAdminContents(moduleId);
  const createContent = useCreateContent();
  const updateContent = useUpdateContent();
  const deleteContent = useDeleteContent();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [formData, setFormData] = useState<ContentFormData>({
    module_id: moduleId || "",
    title: "",
    description: "",
    content_type: "video",
    video_url: "",
    text_content: "",
    duration_minutes: 0,
    sort_order: 0,
    is_active: true,
  });

  const handleOpenDialog = (content?: Content) => {
    if (content) {
      setEditingContent(content);
      setFormData({
        module_id: moduleId || "",
        title: content.title,
        description: content.description || "",
        content_type: content.content_type,
        video_url: content.video_url || "",
        text_content: content.text_content || "",
        duration_minutes: content.duration_minutes,
        sort_order: content.sort_order,
        is_active: content.is_active,
      });
    } else {
      setEditingContent(null);
      setFormData({
        module_id: moduleId || "",
        title: "",
        description: "",
        content_type: "video",
        video_url: "",
        text_content: "",
        duration_minutes: 0,
        sort_order: contents?.length || 0,
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
      if (editingContent) {
        await updateContent.mutateAsync({ id: editingContent.id, ...formData });
      } else {
        await createContent.mutateAsync(formData);
      }
      setDialogOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (content: Content) => {
    if (window.confirm(`Deseja realmente excluir o conteúdo "${content.title}"?`)) {
      await deleteContent.mutateAsync({ id: content.id, moduleId: moduleId || "" });
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
            onClick={() => navigate(`/admin/tracks/${trackId}/modules`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Conteúdos do Módulo</h1>
            <p className="text-muted-foreground">
              {module?.title || "Carregando..."}
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Conteúdo
          </Button>
        </div>

        {/* Contents Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Ordem</TableHead>
                  <TableHead className="w-12">Tipo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : contents && contents.length > 0 ? (
                  contents.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                          {content.sort_order}
                        </div>
                      </TableCell>
                      <TableCell>
                        {content.content_type === "video" ? (
                          <Badge variant="secondary" className="gap-1">
                            <Play className="h-3 w-3" />
                            Vídeo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <FileText className="h-3 w-3" />
                            Texto
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{content.title}</p>
                          {content.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {content.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {content.duration_minutes > 0 ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {content.duration_minutes} min
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={content.is_active ? "default" : "secondary"}>
                          {content.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(content)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(content)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Play className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-2 text-muted-foreground">
                        Nenhum conteúdo cadastrado
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingContent ? "Editar Conteúdo" : "Novo Conteúdo"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Aula 1 - Bem-vindo ao Programa"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o conteúdo..."
                  rows={2}
                />
              </div>

              <div>
                <Label>Tipo de Conteúdo</Label>
                <Tabs 
                  value={formData.content_type} 
                  onValueChange={(v) => setFormData({ ...formData, content_type: v as "video" | "text" })}
                  className="mt-2"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="video" className="gap-2">
                      <Play className="h-4 w-4" />
                      Vídeo
                    </TabsTrigger>
                    <TabsTrigger value="text" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Texto
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="video" className="mt-4">
                    <div>
                      <Label htmlFor="video_url">URL do Vídeo</Label>
                      <Input
                        id="video_url"
                        value={formData.video_url}
                        onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                        placeholder="https://..."
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Cole a URL do vídeo (YouTube, Vimeo ou arquivo direto)
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="text" className="mt-4">
                    <div>
                      <Label htmlFor="text_content">Conteúdo em Texto</Label>
                      <Textarea
                        id="text_content"
                        value={formData.text_content}
                        onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                        placeholder="Digite o conteúdo em texto ou HTML..."
                        rows={8}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Você pode usar HTML básico para formatação
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration_minutes">Duração (minutos)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
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
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Status Ativo</Label>
                  <p className="text-sm text-muted-foreground">
                    Conteúdos inativos não aparecem para afiliados
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
                disabled={createContent.isPending || updateContent.isPending}
              >
                {editingContent ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminContents;
