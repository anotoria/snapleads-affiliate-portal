import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, FolderOpen, Image, Video, FileText, ChevronRight, BookOpen } from "lucide-react";
import { useFeaturedTracks } from "@/hooks/useTracks";
import { useMediaCategoriesGrouped } from "@/hooks/useMediaCategories";
import { TrackCard } from "@/components/learning/TrackCard";
import { CategoryCard } from "@/components/media/CategoryCard";
import { useLanguage } from "@/hooks/useLanguage";

const SupportMaterials = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: featuredTracks, isLoading: tracksLoading } = useFeaturedTracks();
  const { data: categoriesGrouped, isLoading: categoriesLoading } = useMediaCategoriesGrouped();

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Materiais de Apoio</h1>
          <p className="mt-2 text-muted-foreground">
            Aprenda e tenha acesso a recursos exclusivos para impulsionar seus resultados
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card 
            className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
            onClick={() => navigate("/materials/tracks")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Trilhas de Aprendizado</h3>
                <p className="text-sm text-muted-foreground">
                  Cursos completos com vídeos e conteúdos exclusivos
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
            onClick={() => navigate("/materials/media")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                <FolderOpen className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Biblioteca de Mídias</h3>
                <p className="text-sm text-muted-foreground">
                  Fotos, vídeos e arquivos para download
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </div>

        {/* Featured Tracks */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Trilhas em Destaque</h2>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/materials/tracks")}
              className="text-primary"
            >
              Ver todas
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          {tracksLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <CardContent className="p-4">
                    <div className="h-5 w-3/4 bg-muted rounded mb-2" />
                    <div className="h-4 w-full bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredTracks && featuredTracks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredTracks.slice(0, 3).map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  onClick={() => navigate(`/materials/tracks/${track.id}`)}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                Nenhuma trilha em destaque disponível no momento.
              </p>
            </Card>
          )}
        </section>

        {/* Media Categories by Type */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Mídias por Categoria</h2>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/materials/media")}
              className="text-primary"
            >
              Ver todas
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          {categoriesLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-6 w-24 bg-muted rounded mb-3" />
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((j) => (
                      <Card key={j}>
                        <div className="aspect-video bg-muted" />
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Photos */}
              {categoriesGrouped?.photo && categoriesGrouped.photo.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Image className="h-3 w-3" />
                      Fotos
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {categoriesGrouped.photo.length} categoria(s)
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {categoriesGrouped.photo.slice(0, 4).map((category) => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        onClick={() => navigate(`/materials/media/photo/${category.id}`)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {categoriesGrouped?.video && categoriesGrouped.video.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1 bg-red-500/10 text-red-500">
                      <Video className="h-3 w-3" />
                      Vídeos
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {categoriesGrouped.video.length} categoria(s)
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {categoriesGrouped.video.slice(0, 4).map((category) => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        onClick={() => navigate(`/materials/media/video/${category.id}`)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {categoriesGrouped?.file && categoriesGrouped.file.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-500">
                      <FileText className="h-3 w-3" />
                      Arquivos
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {categoriesGrouped.file.length} categoria(s)
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {categoriesGrouped.file.slice(0, 4).map((category) => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        onClick={() => navigate(`/materials/media/file/${category.id}`)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {(!categoriesGrouped?.photo?.length && 
                !categoriesGrouped?.video?.length && 
                !categoriesGrouped?.file?.length) && (
                <Card className="p-8 text-center">
                  <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    Nenhuma categoria de mídia disponível no momento.
                  </p>
                </Card>
              )}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
};

export default SupportMaterials;
