import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  BookOpen, 
  GripVertical,
  Layers,
  Image as ImageIcon
} from "lucide-react";
import { useAdminTracks, useCreateTrack, useUpdateTrack, useDeleteTrack, TrackFormData } from "@/hooks/useAdminTracks";
import { Track } from "@/hooks/useTracks";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useToast } from "@/hooks/use-toast";

const AdminTracks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: tracks, isLoading } = useAdminTracks();
  const createTrack = useCreateTrack();
  const updateTrack = useUpdateTrack();
  const deleteTrack = useDeleteTrack();
  const { uploadFile, uploading } = useMediaUpload();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [formData, setFormData] = useState<TrackFormData>({
    title: "",
    description: "",
    cover_url: "",
    sort_order: 0,
    is_active: true,
    is_featured: false,
  });

  const handleOpenDialog = (track?: Track) => {
    if (track) {
      setEditingTrack(track);
      setFormData({
        title: track.title,
        description: track.description || "",
        cover_url: track.cover_url || "",
        sort_order: track.sort_order,
        is_active: track.is_active,
        is_featured: track.is_featured,
      });
    } else {
      setEditingTrack(null);
      setFormData({
        title: "",
        description: "",
        cover_url: "",
        sort_order: tracks?.length || 0,
        is_active: true,
        is_featured: false,
      });
    }
    setDialogOpen(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadFile(file, "learning-covers", "tracks");
    if (result) {
      setFormData({ ...formData, cover_url: result.url });
    }
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
      if (editingTrack) {
        await updateTrack.mutateAsync({ id: editingTrack.id, ...formData });
      } else {
        await createTrack.mutateAsync(formData);
      }
      setDialogOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (track: Track) => {
    if (window.confirm(`Deseja realmente excluir a trilha "${track.title}"?`)) {
      await deleteTrack.mutateAsync(track.id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Trilhas</h1>
            <p className="text-muted-foreground">
              Crie e gerencie trilhas de aprendizado
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Trilha
          </Button>
        </div>

        {/* Tracks Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Ordem</TableHead>
                  <TableHead className="w-20">Capa</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Destaque</TableHead>
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
                ) : tracks && tracks.length > 0 ? (
                  tracks.map((track) => (
                    <TableRow key={track.id}>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                          {track.sort_order}
                        </div>
                      </TableCell>
                      <TableCell>
                        {track.cover_url ? (
                          <img
                            src={track.cover_url}
                            alt={track.title}
                            className="h-12 w-20 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-20 items-center justify-center rounded bg-muted">
                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{track.title}</p>
                          {track.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {track.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={track.is_active ? "default" : "secondary"}>
                          {track.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {track.is_featured && (
                          <Badge variant="outline" className="border-primary text-primary">
                            ⭐ Destaque
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/tracks/${track.id}/modules`)}
                          >
                            <Layers className="h-4 w-4 mr-1" />
                            Módulos
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(track)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(track)}
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
                      <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-2 text-muted-foreground">
                        Nenhuma trilha cadastrada
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
                {editingTrack ? "Editar Trilha" : "Nova Trilha"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Introdução ao Programa de Afiliados"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o conteúdo da trilha..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Capa da Trilha</Label>
                <div className="mt-2 flex items-center gap-4">
                  {formData.cover_url ? (
                    <img
                      src={formData.cover_url}
                      alt="Cover"
                      className="h-20 w-32 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-32 items-center justify-center rounded border-2 border-dashed">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      disabled={uploading}
                      className="w-full"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Recomendado: 16:9, máximo 10MB
                    </p>
                  </div>
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
                    Trilhas inativas não aparecem para afiliados
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Destaque</Label>
                  <p className="text-sm text-muted-foreground">
                    Exibir na seção de destaques
                  </p>
                </div>
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createTrack.isPending || updateTrack.isPending}
              >
                {editingTrack ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminTracks;
