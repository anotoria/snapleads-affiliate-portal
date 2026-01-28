import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  FolderOpen,
  GripVertical,
  Image,
  Video,
  FileText,
  Images
} from "lucide-react";
import { 
  useAdminMediaCategories, 
  useCreateMediaCategory, 
  useUpdateMediaCategory, 
  useDeleteMediaCategory,
  MediaCategoryFormData 
} from "@/hooks/useAdminMediaCategories";
import { MediaCategory, MediaType } from "@/hooks/useMediaCategories";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useToast } from "@/hooks/use-toast";

const typeLabels: Record<MediaType, string> = {
  photo: "Foto",
  video: "Vídeo",
  file: "Arquivo",
};

const typeIcons: Record<MediaType, typeof Image> = {
  photo: Image,
  video: Video,
  file: FileText,
};

const AdminMedia = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<MediaType | "all">("all");
  
  const { data: categories, isLoading } = useAdminMediaCategories(
    selectedType === "all" ? undefined : selectedType
  );
  const createCategory = useCreateMediaCategory();
  const updateCategory = useUpdateMediaCategory();
  const deleteCategory = useDeleteMediaCategory();
  const { uploadFile, uploading } = useMediaUpload();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MediaCategory | null>(null);
  const [formData, setFormData] = useState<MediaCategoryFormData>({
    name: "",
    display_name: "",
    type: "photo",
    description: "",
    cover_url: "",
    sort_order: 0,
    is_active: true,
  });

  const handleOpenDialog = (category?: MediaCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        display_name: category.display_name,
        type: category.type,
        description: category.description || "",
        cover_url: category.cover_url || "",
        sort_order: category.sort_order,
        is_active: category.is_active,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        display_name: "",
        type: "photo",
        description: "",
        cover_url: "",
        sort_order: categories?.length || 0,
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadFile(file, "learning-covers", "media-categories");
    if (result) {
      setFormData({ ...formData, cover_url: result.url });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.display_name.trim()) {
      toast({
        title: "Erro",
        description: "Nome e nome de exibição são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...formData });
      } else {
        await createCategory.mutateAsync(formData);
      }
      setDialogOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (category: MediaCategory) => {
    if (window.confirm(`Deseja realmente excluir a categoria "${category.display_name}"?`)) {
      await deleteCategory.mutateAsync(category.id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Mídias</h1>
            <p className="text-muted-foreground">
              Categorias e itens de mídia para download
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </div>

        {/* Type Filter */}
        <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as MediaType | "all")}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="photo" className="gap-2">
              <Image className="h-4 w-4" />
              Fotos
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-2">
              <Video className="h-4 w-4" />
              Vídeos
            </TabsTrigger>
            <TabsTrigger value="file" className="gap-2">
              <FileText className="h-4 w-4" />
              Arquivos
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Categories Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Ordem</TableHead>
                  <TableHead className="w-20">Capa</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
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
                ) : categories && categories.length > 0 ? (
                  categories.map((category) => {
                    const TypeIcon = typeIcons[category.type];
                    return (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <GripVertical className="h-4 w-4" />
                            {category.sort_order}
                          </div>
                        </TableCell>
                        <TableCell>
                          {category.cover_url ? (
                            <img
                              src={category.cover_url}
                              alt={category.display_name}
                              className="h-12 w-20 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-20 items-center justify-center rounded bg-muted">
                              <FolderOpen className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{category.display_name}</p>
                            <p className="text-sm text-muted-foreground">{category.name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            <TypeIcon className="h-3 w-3" />
                            {typeLabels[category.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={category.is_active ? "default" : "secondary"}>
                            {category.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/media/items/${category.id}`)}
                            >
                              <Images className="h-4 w-4 mr-1" />
                              Itens
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(category)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-2 text-muted-foreground">
                        Nenhuma categoria cadastrada
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
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Interno *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  placeholder="ex: banners-promocionais"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Usado internamente, sem espaços ou caracteres especiais
                </p>
              </div>

              <div>
                <Label htmlFor="display_name">Nome de Exibição *</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="Ex: Banners Promocionais"
                />
              </div>

              <div>
                <Label>Tipo de Mídia</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as MediaType })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photo">
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        Foto
                      </div>
                    </SelectItem>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Vídeo
                      </div>
                    </SelectItem>
                    <SelectItem value="file">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Arquivo
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva a categoria..."
                  rows={2}
                />
              </div>

              <div>
                <Label>Capa da Categoria</Label>
                <div className="mt-2 flex items-center gap-4">
                  {formData.cover_url ? (
                    <img
                      src={formData.cover_url}
                      alt="Cover"
                      className="h-16 w-24 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-24 items-center justify-center rounded border-2 border-dashed">
                      <FolderOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={uploading}
                  />
                </div>
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
                    Categorias inativas não aparecem para afiliados
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
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                {editingCategory ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminMedia;
