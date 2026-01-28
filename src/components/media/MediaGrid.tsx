import { MediaItem } from "@/hooks/useMediaItems";
import { MediaCard } from "./MediaCard";
import { cn } from "@/lib/utils";

interface MediaGridProps {
  items: MediaItem[];
  selectedIds?: string[];
  onSelect?: (id: string, selected: boolean) => void;
  onItemClick?: (item: MediaItem) => void;
  selectable?: boolean;
  className?: string;
}

export const MediaGrid = ({
  items,
  selectedIds = [],
  onSelect,
  onItemClick,
  selectable = true,
  className,
}: MediaGridProps) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">Nenhuma mídia encontrada</p>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "grid gap-4",
        "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
        className
      )}
    >
      {items.map((item) => (
        <MediaCard
          key={item.id}
          item={item}
          selected={selectedIds.includes(item.id)}
          onSelect={(selected) => onSelect?.(item.id, selected)}
          onClick={() => onItemClick?.(item)}
          selectable={selectable}
        />
      ))}
    </div>
  );
};
