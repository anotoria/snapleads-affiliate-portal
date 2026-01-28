import { cn } from "@/lib/utils";

interface TextContentProps {
  content: string;
  className?: string;
}

export const TextContent = ({ content, className }: TextContentProps) => {
  return (
    <div 
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-headings:text-foreground",
        "prose-p:text-muted-foreground",
        "prose-a:text-primary hover:prose-a:text-primary/80",
        "prose-strong:text-foreground",
        "prose-code:text-primary prose-code:bg-muted prose-code:rounded prose-code:px-1",
        "prose-pre:bg-muted prose-pre:text-foreground",
        "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground",
        "prose-ul:text-muted-foreground prose-ol:text-muted-foreground",
        "prose-li:marker:text-primary",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
