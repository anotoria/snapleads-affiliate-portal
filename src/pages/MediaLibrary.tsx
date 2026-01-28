import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { useMediaCategories, MediaType } from "@/hooks/useMediaCategories";
import { CategoryCard } from "@/components/media/CategoryCard";
import { MediaTypeSelector } from "@/components/media/MediaTypeSelector";

const MediaLibrary = () => {
  const navigate = useNavigate();
  const { type: urlType } = useParams<{ type?: string }>();
  const [selectedType, setSelectedType] = useState<MediaType | "all">(
    (urlType as MediaType) || "all"
  );

  const { data: allCategories, isLoading } = useMediaCategories();

  const filteredCategories = allCategories?.filter(
    (c) => selectedType === "all" || c.type === selectedType
  );

  const handleTypeChange = (type: MediaType | "all") => {
    setSelectedType(type);
    if (type === "all") {
      navigate("/materials/media");
    } else {
      navigate(`/materials/media/${type}`);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/materials")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Biblioteca de Mídias</h1>
            <p className="mt-1 text-muted-foreground">
              Fotos, vídeos e arquivos para download
            </p>
          </div>
        </div>

        {/* Type Filter */}
        <MediaTypeSelector 
          value={selectedType} 
          onChange={handleTypeChange}
          showAll={true}
        />

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted" />
                <CardContent className="p-4">
                  <div className="h-5 w-3/4 bg-muted rounded mb-2" />
                  <div className="h-4 w-full bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCategories && filteredCategories.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={() => navigate(`/materials/media/${category.type}/${category.id}`)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <FolderOpen className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma categoria disponível</h3>
            <p className="mt-2 text-muted-foreground">
              {selectedType !== "all" 
                ? `Não há categorias de ${
                    selectedType === "photo" ? "fotos" : 
                    selectedType === "video" ? "vídeos" : "arquivos"
                  } disponíveis no momento.`
                : "As mídias estarão disponíveis em breve."
              }
            </p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default MediaLibrary;
