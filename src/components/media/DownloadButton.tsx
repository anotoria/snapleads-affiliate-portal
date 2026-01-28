import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { MediaItem } from "@/hooks/useMediaItems";
import { useIncrementDownloadCount } from "@/hooks/useMediaItems";
import { useToast } from "@/hooks/use-toast";

interface DownloadButtonProps {
  item: MediaItem;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

export const DownloadButton = ({ 
  item, 
  variant = "default", 
  size = "default",
  showText = true 
}: DownloadButtonProps) => {
  const [downloading, setDownloading] = useState(false);
  const incrementDownload = useIncrementDownloadCount();
  const { toast } = useToast();

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setDownloading(true);
      
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
      
      toast({
        title: "Download iniciado",
        description: `${item.title} está sendo baixado.`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={downloading}
    >
      {downloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {showText && size !== "icon" && (
        <span className="ml-2">
          {downloading ? "Baixando..." : "Download"}
        </span>
      )}
    </Button>
  );
};
