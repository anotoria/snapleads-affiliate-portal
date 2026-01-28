import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckSquare, Square } from "lucide-react";
import { MediaItem } from "@/hooks/useMediaItems";
import { useIncrementDownloadCount } from "@/hooks/useMediaItems";
import { useToast } from "@/hooks/use-toast";

interface BulkDownloadProps {
  items: MediaItem[];
  selectedIds: string[];
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export const BulkDownload = ({
  items,
  selectedIds,
  onSelectAll,
  onClearSelection,
}: BulkDownloadProps) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const incrementDownload = useIncrementDownloadCount();
  const { toast } = useToast();

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  const handleDownloadSelected = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Nenhum item selecionado",
        description: "Selecione pelo menos um item para baixar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setDownloading(true);
      setProgress(0);

      for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i];
        
        try {
          // Increment download count
          await incrementDownload.mutateAsync(item.id);
          
          // Fetch and download file
          const response = await fetch(item.file_url);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          
          const link = document.createElement("a");
          link.href = url;
          link.download = `${item.title}.${item.file_type}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          window.URL.revokeObjectURL(url);
          
          // Small delay between downloads to prevent browser blocking
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`Error downloading ${item.title}:`, error);
        }

        setProgress(Math.round(((i + 1) / selectedItems.length) * 100));
      }

      toast({
        title: "Downloads concluídos",
        description: `${selectedItems.length} arquivo(s) baixado(s) com sucesso.`,
      });
      
      onClearSelection();
    } catch (error) {
      console.error("Bulk download error:", error);
      toast({
        title: "Erro no download",
        description: "Ocorreu um erro ao baixar os arquivos.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Select all / Clear */}
      <Button
        variant="outline"
        size="sm"
        onClick={allSelected ? onClearSelection : onSelectAll}
      >
        {allSelected ? (
          <>
            <Square className="mr-2 h-4 w-4" />
            Limpar Seleção
          </>
        ) : (
          <>
            <CheckSquare className="mr-2 h-4 w-4" />
            Selecionar Todos
          </>
        )}
      </Button>

      {/* Selection count */}
      {selectedIds.length > 0 && (
        <span className="text-sm text-muted-foreground">
          {selectedIds.length} selecionado(s)
        </span>
      )}

      {/* Download button */}
      <Button
        onClick={handleDownloadSelected}
        disabled={downloading || selectedIds.length === 0}
        size="sm"
      >
        {downloading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {progress}%
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Baixar Selecionados
          </>
        )}
      </Button>
    </div>
  );
};
