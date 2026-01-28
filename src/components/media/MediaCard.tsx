import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Play, FileText, Image, Download, Eye } from "lucide-react";
import { MediaItem } from "@/hooks/useMediaItems";
import { cn } from "@/lib/utils";

interface MediaCardProps {
  item: MediaItem;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onClick?: () => void;
  selectable?: boolean;
  className?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const MediaCard = ({ 
  item, 
  selected, 
  onSelect, 
  onClick, 
  selectable = true,
  className 
}: MediaCardProps) => {
  const [imageError, setImageError] = useState(false);

  const getThumbnail = () => {
    if (item.thumbnail_url) return item.thumbnail_url;
    if (item.media_type === "photo") return item.file_url;
    return null;
  };

  const renderMediaPreview = () => {
    const thumbnail = getThumbnail();

    if (item.media_type === "photo" && thumbnail && !imageError) {
      return (
        <img
          src={thumbnail}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={() => setImageError(true)}
        />
      );
    }

    if (item.media_type === "video") {
      return (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-500/20 to-red-600/30">
          {thumbnail && !imageError ? (
            <>
              <img
                src={thumbnail}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-black/30" />
            </>
          ) : null}
          <div className="relative z-10 rounded-full bg-red-500/80 p-3">
            <Play className="h-6 w-6 text-white" fill="white" />
          </div>
        </div>
      );
    }

    // File type
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/50">
        <FileText className="h-12 w-12 text-muted-foreground/60" />
        <span className="mt-2 text-xs font-medium uppercase text-muted-foreground">
          {item.file_type}
        </span>
      </div>
    );
  };

  return (
    <Card 
      className={cn(
        "group relative cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg border",
        selected && "ring-2 ring-primary",
        className
      )}
      onClick={onClick}
    >
      {/* Selection checkbox */}
      {selectable && (
        <div 
          className="absolute left-2 top-2 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelect?.(checked as boolean)}
            className="h-5 w-5 border-2 border-white bg-white/80 shadow-sm"
          />
        </div>
      )}

      {/* Preview */}
      <div className="relative aspect-square overflow-hidden">
        {renderMediaPreview()}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-full bg-white/20 p-2">
            <Eye className="h-5 w-5 text-white" />
          </div>
          <div className="rounded-full bg-white/20 p-2">
            <Download className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Duration badge for videos */}
        {item.media_type === "video" && item.duration_seconds && (
          <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
            {Math.floor(item.duration_seconds / 60)}:{(item.duration_seconds % 60).toString().padStart(2, "0")}
          </Badge>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h4 className="line-clamp-1 text-sm font-medium text-foreground">
          {item.title}
        </h4>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatFileSize(item.file_size)}</span>
          {item.download_count > 0 && (
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {item.download_count}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
