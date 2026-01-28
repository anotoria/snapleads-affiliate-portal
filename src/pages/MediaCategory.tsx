import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FolderOpen, Image, Video, FileText } from "lucide-react";
import { useMediaCategory } from "@/hooks/useMediaCategories";
import { useMediaItems, MediaItem } from "@/hooks/useMediaItems";
import { MediaGrid } from "@/components/media/MediaGrid";
import { MediaViewer } from "@/components/media/MediaViewer";
import { BulkDownload } from "@/components/media/BulkDownload";

const MediaCategory = () => {
  const navigate = useNavigate();
  const { type, categoryId } = useParams<{ type: string; categoryId: string }>();
  const { data: category, isLoading: categoryLoading } = useMediaCategory(categoryId);
  const { data: items, isLoading: itemsLoading } = useMediaItems(categoryId);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const handleSelect = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    }
  };

  const handleSelectAll = () => {
    if (items) {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleItemClick = (item: MediaItem) => {
    const index = items?.findIndex((i) => i.id === item.id) ?? 0;
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const getTypeIcon = () => {
    switch (type) {
      case "photo": return Image;
      case "video": return Video;
      default: return FileText;
    }
  };

  const TypeIcon = getTypeIcon();

  const isLoading = categoryLoading || itemsLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted rounded" />
            <div className="h-8 w-64 bg-muted rounded" />
          </div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted" />
                <CardContent className="p-3">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!category) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <FolderOpen className="h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Categoria não encontrada</h3>
          <p className="mt-2 text-muted-foreground">
            A categoria que você está procurando não existe ou não está disponível.
          </p>
          <Button className="mt-4" onClick={() => navigate("/materials/media")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Mídias
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/materials/media/${type}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <TypeIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{category.display_name}</h1>
              {category.description && (
                <p className="text-muted-foreground">{category.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {items && items.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "itens"} disponível(eis)
            </p>
            <BulkDownload
              items={items}
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
            />
          </div>
        )}

        {/* Media Grid */}
        {items && items.length > 0 ? (
          <MediaGrid
            items={items}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onItemClick={handleItemClick}
          />
        ) : (
          <Card className="p-12 text-center">
            <FolderOpen className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma mídia disponível</h3>
            <p className="mt-2 text-muted-foreground">
              Esta categoria ainda não possui mídias.
            </p>
          </Card>
        )}

        {/* Media Viewer */}
        {items && items.length > 0 && (
          <MediaViewer
            items={items}
            currentIndex={viewerIndex}
            open={viewerOpen}
            onOpenChange={setViewerOpen}
            onIndexChange={setViewerIndex}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default MediaCategory;
