import { useState, useRef } from "react";
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
  Plus, 
  Pencil, 
  Trash2, 
  ArrowLeft,
  Upload,
  Image,
  Video,
  FileText,
  Download,
  Loader2
} from "lucide-react";
import { useAdminMediaCategory } from "@/hooks/useAdminMediaCategories";
import { 
  useAdminMediaItems, 
  useCreateMediaItem, 
  useUpdateMediaItem, 
  useDeleteMediaItem,
  MediaItemFormData 
} from "@/hooks/useAdminMediaItems";
import { MediaItem } from "@/hooks/useMediaItems";
import { MediaType } from "@/hooks/useMediaCategories";
import { useMediaUpload, getImageDimensions, getVideoDuration } from "@/hooks/useMediaUpload";
import { MediaGrid } from "@/components/media/MediaGrid";
import { MediaViewer } from "@/components/media/MediaViewer";
import { useToast } from "@/hooks/use-toast";

const AdminMediaItems = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: category } = useAdminMediaCategory(categoryId);
  const { data: items, isLoading } = useAdminMediaItems(categoryId);
  const createItem = useCreateMediaItem();
  const updateItem = useUpdateMediaItem();
  const deleteItem = useDeleteMediaItem();
  const { uploadFile, uploading, progress } = useMediaUpload();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [formData, setFormData] = useState<MediaItemFormData>({
    category_id: categoryId || "",
    title: "",
    description: "",
    file_url: "",
    thumbnail_url: "",
    file_type: "",
    file_size: 0,
    media_type: (category?.type || "photo") as MediaType,
    sort_order: 0,
    is_active: true,
  });

  const handleOpenDialog = (item?: MediaItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        category_id: categoryId || "",
        title: item.title,
        description: item.description || "",
        file_url: item.file_url,
        thumbnail_url: item.thumbnail_url || "",
        file_type: item.file_type,
        file_size: item.file_size,
        media_type: item.media_type,
        dimensions: item.dimensions || undefined,
        duration_seconds: item.duration_seconds || undefined,
        sort_order: item.sort_order,
        is_active: item.is_active,
      });
    } else {
      setEditingItem(null);
      setFormData({
        category_id: categoryId || "",
        title: "",
        description: "",
        file_url: "",
        thumbnail_url: "",
        file_type: "",
        file_size: 0,
        media_type: (category?.type || "photo") as MediaType,
        sort_order: items?.length || 0,
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadFile(file, "media-library", categoryId);
    if (result) {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
      
      let dimensions: { width: number; height: number } | undefined;
      let duration: number | undefined;

      // Get image dimensions
      if (category?.type === "photo" || file.type.startsWith("image/")) {
        try {
          dimensions = await getImageDimensions(file);
        } catch (error) {
          console.error("Failed to get image dimensions:", error);
        }
      }

      // Get video duration
      if (category?.type === "video" || file.type.startsWith("video/")) {
        try {
          duration = await getVideoDuration(file);
        } catch (error) {
          console.error("Failed to get video duration:", error);
        }
      }

      setFormData({
        ...formData,
        file_url: result.url,
        file_type: fileExt,
        file_size: result.size,
        title: formData.title || file.name.replace(/\.[^/.]+$/, ""),
        dimensions,
        duration_seconds: duration,
      });
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await uploadFile(file, "media-library", categoryId);
      
      if (result) {
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
        
        let dimensions: { width: number; height: number } | undefined;
        let duration: number | undefined;

        if (file.type.startsWith("image/")) {
          try {
            dimensions = await getImageDimensions(file);
          } catch (error) {}
        }

        if (file.type.startsWith("video/")) {
          try {
            duration = await getVideoDuration(file);
          } catch (error) {}
        }

        await createItem.mutateAsync({
          category_id: categoryId || "",
          title: file.name.replace(/\.[^/.]+$/, ""),
          file_url: result.url,
          file_type: fileExt,
          file_size: result.size,
          media_type: category?.type || "photo",
          dimensions,
          duration_seconds: duration,
          sort_order: (items?.length || 0) + i,
          is_active: true,
        });

        successCount++;
      }
    }

    if (successCount > 0) {
      toast({
        title: "Upload concluído",
        description: `${successCount} arquivo(s) enviado(s) com sucesso.`,
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.file_url) {
      toast({
        title: "Erro",
        description: "Título e arquivo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingItem) {
        await updateItem.mutateAsync({ id: editingItem.id, ...formData });
      } else {
        await createItem.mutateAsync(formData);
      }
      setDialogOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (window.confirm(`Deseja realmente excluir "${item.title}"?`)) {
      await deleteItem.mutateAsync({ id: item.id, categoryId: categoryId || "" });
    }
  };

  const handleItemClick = (item: MediaItem) => {
    const index = items?.findIndex((i) => i.id === item.id) ?? 0;
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const getTypeIcon = () => {
    switch (category?.type) {
      case "photo": return Image;
      case "video": return Video;
      default: return FileText;
    }
  };

  const TypeIcon = getTypeIcon();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/media")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <TypeIcon className="h-5 w-5 text-primary" />
              <h1 className="text-3xl font-bold">{category?.display_name || "Carregando..."}</h1>
            </div>
            <p className="text-muted-foreground">
              Gerenciar itens de mídia desta categoria
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={
                  category?.type === "photo" ? "image/*" :
                  category?.type === "video" ? "video/*" : "*/*"
                }
                onChange={handleBulkUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <Button variant="outline" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {progress}%
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload em Lote
                  </>
                )}
              </Button>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            {items?.length || 0} itens
          </Badge>
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted" />
                <CardContent className="p-3">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <div className="space-y-4">
            <MediaGrid
              items={items}
              onItemClick={handleItemClick}
              selectable={false}
            />
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-2 rounded-lg border p-2 text-sm"
                >
                  <span className="truncate max-w-[150px]">{item.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleOpenDialog(item)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Card className="p-12 text-center">
            <TypeIcon className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum item cadastrado</h3>
            <p className="mt-2 text-muted-foreground">
              Clique em "Adicionar" ou "Upload em Lote" para adicionar mídias.
            </p>
          </Card>
        )}

        {/* Viewer */}
        {items && items.length > 0 && (
          <MediaViewer
            items={items}
            currentIndex={viewerIndex}
            open={viewerOpen}
            onOpenChange={setViewerOpen}
            onIndexChange={setViewerIndex}
          />
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Editar Item" : "Adicionar Item"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Arquivo *</Label>
                <div className="mt-2">
                  {formData.file_url ? (
                    <div className="flex items-center gap-4">
                      {formData.media_type === "photo" ? (
                        <img
                          src={formData.file_url}
                          alt="Preview"
                          className="h-20 w-20 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded bg-muted">
                          <TypeIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">.{formData.file_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {(formData.file_size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Input
                      type="file"
                      accept={
                        category?.type === "photo" ? "image/*" :
                        category?.type === "video" ? "video/*" : "*/*"
                      }
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nome do arquivo"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição opcional..."
                  rows={2}
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
                    Itens inativos não aparecem para afiliados
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
                disabled={createItem.isPending || updateItem.isPending || uploading}
              >
                {editingItem ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminMediaItems;
