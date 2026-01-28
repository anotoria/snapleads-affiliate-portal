import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image, Video, FileText, FolderOpen } from "lucide-react";
import { MediaCategory, MediaType } from "@/hooks/useMediaCategories";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: MediaCategory;
  itemsCount?: number;
  onClick?: () => void;
  className?: string;
}

const typeIcons: Record<MediaType, typeof Image> = {
  photo: Image,
  video: Video,
  file: FileText,
};

const typeLabels: Record<MediaType, string> = {
  photo: "Fotos",
  video: "Vídeos",
  file: "Arquivos",
};

const typeColors: Record<MediaType, string> = {
  photo: "bg-blue-500/10 text-blue-500",
  video: "bg-red-500/10 text-red-500",
  file: "bg-green-500/10 text-green-500",
};

export const CategoryCard = ({ category, itemsCount, onClick, className }: CategoryCardProps) => {
  const TypeIcon = typeIcons[category.type];

  return (
    <Card 
      className={cn(
        "group cursor-pointer overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl border-0",
        className
      )}
      onClick={onClick}
    >
      <div className="relative aspect-video overflow-hidden">
        {category.cover_url ? (
          <img
            src={category.cover_url}
            alt={category.display_name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <FolderOpen className="h-16 w-16 text-muted-foreground/40" />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
        
        {/* Type badge */}
        <Badge className={cn("absolute left-3 top-3", typeColors[category.type])}>
          <TypeIcon className="mr-1 h-3 w-3" />
          {typeLabels[category.type]}
        </Badge>

        {/* Items count */}
        {itemsCount !== undefined && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
            {itemsCount} {itemsCount === 1 ? "item" : "itens"}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {category.display_name}
        </h3>
        
        {category.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {category.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
