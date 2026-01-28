import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Video, FileText } from "lucide-react";
import { MediaType } from "@/hooks/useMediaCategories";

interface MediaTypeSelectorProps {
  value: MediaType | "all";
  onChange: (value: MediaType | "all") => void;
  showAll?: boolean;
}

export const MediaTypeSelector = ({ value, onChange, showAll = false }: MediaTypeSelectorProps) => {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as MediaType | "all")}>
      <TabsList className="grid w-full max-w-md" style={{ gridTemplateColumns: showAll ? "repeat(4, 1fr)" : "repeat(3, 1fr)" }}>
        {showAll && (
          <TabsTrigger value="all" className="gap-2">
            Todos
          </TabsTrigger>
        )}
        <TabsTrigger value="photo" className="gap-2">
          <Image className="h-4 w-4" />
          <span className="hidden sm:inline">Fotos</span>
        </TabsTrigger>
        <TabsTrigger value="video" className="gap-2">
          <Video className="h-4 w-4" />
          <span className="hidden sm:inline">Vídeos</span>
        </TabsTrigger>
        <TabsTrigger value="file" className="gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Arquivos</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
