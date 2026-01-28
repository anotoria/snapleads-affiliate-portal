import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  ZoomIn, 
  ZoomOut,
  Maximize2,
  Play
} from "lucide-react";
import { MediaItem } from "@/hooks/useMediaItems";
import { useIncrementDownloadCount } from "@/hooks/useMediaItems";
import { cn } from "@/lib/utils";

interface MediaViewerProps {
  items: MediaItem[];
  currentIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange?: (index: number) => void;
}

export const MediaViewer = ({
  items,
  currentIndex,
  open,
  onOpenChange,
  onIndexChange,
}: MediaViewerProps) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const incrementDownload = useIncrementDownloadCount();

  const currentItem = items[currentIndex];

  useEffect(() => {
    // Reset zoom and position when changing items
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      switch (e.key) {
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "Escape":
          onOpenChange(false);
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentIndex, items.length]);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      onIndexChange?.(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < items.length - 1) {
      onIndexChange?.(currentIndex + 1);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = async () => {
    if (!currentItem) return;

    try {
      await incrementDownload.mutateAsync(currentItem.id);
      
      const response = await fetch(currentItem.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${currentItem.title}.${currentItem.file_type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  if (!currentItem) return null;

  const renderContent = () => {
    if (currentItem.media_type === "photo") {
      return (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center overflow-hidden",
            zoom > 1 && "cursor-grab",
            isDragging && "cursor-grabbing"
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={currentItem.file_url}
            alt={currentItem.title}
            className="max-h-full max-w-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            }}
            draggable={false}
          />
        </div>
      );
    }

    if (currentItem.media_type === "video") {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <video
            src={currentItem.file_url}
            controls
            className="max-h-full max-w-full"
            autoPlay
          />
        </div>
      );
    }

    // File preview (show download prompt)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="text-center">
          <p className="text-lg font-medium text-white">{currentItem.title}</p>
          <p className="text-sm text-white/60">.{currentItem.file_type}</p>
        </div>
        <Button onClick={handleDownload} size="lg">
          <Download className="mr-2 h-5 w-5" />
          Baixar Arquivo
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="text-white">
            <h3 className="font-medium">{currentItem.title}</h3>
            <p className="text-sm text-white/60">
              {currentIndex + 1} de {items.length}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {currentItem.media_type === "photo" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <span className="text-sm text-white min-w-[4rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={handleZoomIn}
                  disabled={zoom >= 4}
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={handleResetZoom}
                >
                  <Maximize2 className="h-5 w-5" />
                </Button>
              </>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handleDownload}
            >
              <Download className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-full items-center justify-center pt-16 pb-16">
          {renderContent()}
        </div>

        {/* Navigation */}
        {items.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={goToNext}
              disabled={currentIndex === items.length - 1}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        {/* Thumbnails */}
        {items.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/80 to-transparent p-4 overflow-x-auto">
            {items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => onIndexChange?.(index)}
                className={cn(
                  "h-12 w-12 shrink-0 overflow-hidden rounded border-2 transition-all",
                  index === currentIndex
                    ? "border-primary"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                {item.media_type === "photo" || item.thumbnail_url ? (
                  <img
                    src={item.thumbnail_url || item.file_url}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    {item.media_type === "video" ? (
                      <Play className="h-4 w-4" />
                    ) : (
                      <span className="text-[8px] font-medium uppercase">
                        {item.file_type}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
