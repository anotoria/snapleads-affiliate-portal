import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle, Circle, Play, FileText, Clock } from "lucide-react";
import { Module } from "@/hooks/useModules";
import { Content } from "@/hooks/useContents";
import { useContentProgress } from "@/hooks/useContentProgress";
import { cn } from "@/lib/utils";

interface ContentItemProps {
  content: Content;
  onClick?: () => void;
  isActive?: boolean;
}

const ContentItem = ({ content, onClick, isActive }: ContentItemProps) => {
  const { data: progress } = useContentProgress(content.id);
  const isCompleted = progress?.completed || false;

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors",
        isActive 
          ? "bg-primary/10 text-primary" 
          : "hover:bg-muted/50",
        isCompleted && "text-muted-foreground"
      )}
    >
      {/* Status icon */}
      {isCompleted ? (
        <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
      ) : (
        <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
      )}

      {/* Content type icon */}
      {content.content_type === "video" ? (
        <Play className="h-4 w-4 shrink-0" />
      ) : (
        <FileText className="h-4 w-4 shrink-0" />
      )}

      {/* Title */}
      <span className={cn(
        "flex-1 text-sm",
        isCompleted && "line-through"
      )}>
        {content.title}
      </span>

      {/* Duration */}
      {content.duration_minutes > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{content.duration_minutes}min</span>
        </div>
      )}
    </div>
  );
};

interface ModuleAccordionProps {
  module: Module;
  contents: Content[];
  defaultOpen?: boolean;
  onContentClick?: (content: Content) => void;
  activeContentId?: string;
}

export const ModuleAccordion = ({
  module,
  contents,
  defaultOpen = false,
  onContentClick,
  activeContentId,
}: ModuleAccordionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const completedCount = contents.filter(c => {
    // This would need to check progress, but for now we'll show total
    return false;
  }).length;

  return (
    <div className="rounded-lg border bg-card">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50"
      >
        {isOpen ? (
          <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        )}
        
        <div className="flex-1">
          <h4 className="font-medium text-foreground">{module.title}</h4>
          {module.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
              {module.description}
            </p>
          )}
        </div>

        <span className="text-sm text-muted-foreground">
          {contents.length} conteúdo{contents.length !== 1 ? "s" : ""}
        </span>
      </button>

      {/* Contents */}
      {isOpen && contents.length > 0 && (
        <div className="border-t px-4 pb-4">
          <div className="mt-2 space-y-1">
            {contents.map((content) => (
              <ContentItem
                key={content.id}
                content={content}
                onClick={() => onContentClick?.(content)}
                isActive={activeContentId === content.id}
              />
            ))}
          </div>
        </div>
      )}

      {isOpen && contents.length === 0 && (
        <div className="border-t p-4 text-center text-sm text-muted-foreground">
          Nenhum conteúdo disponível neste módulo.
        </div>
      )}
    </div>
  );
};
