import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, BookOpen, Clock } from "lucide-react";
import { Track } from "@/hooks/useTracks";
import { useTrackProgress } from "@/hooks/useContentProgress";
import { cn } from "@/lib/utils";

interface TrackCardProps {
  track: Track;
  onClick?: () => void;
  className?: string;
}

export const TrackCard = ({ track, onClick, className }: TrackCardProps) => {
  const { data: progress } = useTrackProgress(track.id);

  return (
    <Card 
      className={cn(
        "group cursor-pointer overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl border-0",
        className
      )}
      onClick={onClick}
    >
      <div className="relative aspect-video overflow-hidden">
        {track.cover_url ? (
          <img
            src={track.cover_url}
            alt={track.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
            <BookOpen className="h-16 w-16 text-primary/60" />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
        
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-full bg-primary/90 p-4 shadow-lg">
            <Play className="h-8 w-8 text-primary-foreground" fill="currentColor" />
          </div>
        </div>

        {/* Featured badge */}
        {track.is_featured && (
          <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
            Destaque
          </Badge>
        )}

        {/* Progress bar at bottom */}
        {progress && progress.percent > 0 && (
          <div className="absolute bottom-0 left-0 right-0">
            <Progress value={progress.percent} className="h-1 rounded-none bg-black/40" />
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {track.title}
        </h3>
        
        {track.description && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {track.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {progress && progress.total > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{progress.completed}/{progress.total} conteúdos</span>
            </div>
          )}
          
          {progress && progress.percent > 0 && (
            <Badge variant="secondary" className="text-xs">
              {progress.percent}% completo
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
