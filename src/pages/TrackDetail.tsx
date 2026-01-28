import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, Clock, Play } from "lucide-react";
import { useTrack } from "@/hooks/useTracks";
import { useModules } from "@/hooks/useModules";
import { useContents, useAllTrackContents } from "@/hooks/useContents";
import { useTrackProgress } from "@/hooks/useContentProgress";
import { ModuleAccordion } from "@/components/learning/ModuleAccordion";
import { Content } from "@/hooks/useContents";

const TrackDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: track, isLoading: trackLoading } = useTrack(id);
  const { data: modules, isLoading: modulesLoading } = useModules(id);
  const { data: allContents } = useAllTrackContents(id);
  const { data: progress } = useTrackProgress(id);

  const handleContentClick = (content: Content) => {
    navigate(`/materials/tracks/${id}/content/${content.id}`);
  };

  const getModuleContents = (moduleId: string) => {
    return allContents?.filter(c => c.module_id === moduleId) || [];
  };

  const getTotalDuration = () => {
    if (!allContents) return 0;
    return allContents.reduce((acc, c) => acc + (c.duration_minutes || 0), 0);
  };

  if (trackLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted rounded" />
            <div className="h-8 w-64 bg-muted rounded" />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="aspect-video bg-muted rounded-lg" />
              <div className="h-6 w-3/4 bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!track) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Trilha não encontrada</h3>
          <p className="mt-2 text-muted-foreground">
            A trilha que você está procurando não existe ou não está disponível.
          </p>
          <Button className="mt-4" onClick={() => navigate("/materials/tracks")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Trilhas
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/materials/tracks")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{track.title}</h1>
            <p className="text-muted-foreground">Trilha de Aprendizado</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Image */}
            <div className="relative aspect-video overflow-hidden rounded-lg">
              {track.cover_url ? (
                <img
                  src={track.cover_url}
                  alt={track.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                  <BookOpen className="h-24 w-24 text-primary/60" />
                </div>
              )}
              
              {/* Start/Continue button overlay */}
              {allContents && allContents.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Button
                    size="lg"
                    onClick={() => {
                      const firstContent = allContents[0];
                      if (firstContent) {
                        handleContentClick(firstContent);
                      }
                    }}
                    className="gap-2"
                  >
                    <Play className="h-5 w-5" fill="currentColor" />
                    {progress && progress.percent > 0 ? "Continuar" : "Iniciar"} Trilha
                  </Button>
                </div>
              )}
            </div>

            {/* Description */}
            {track.description && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Sobre esta trilha</h3>
                  <p className="text-muted-foreground">{track.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Modules */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Conteúdo da Trilha</h3>
              
              {modulesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-5 w-1/2 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : modules && modules.length > 0 ? (
                <div className="space-y-3">
                  {modules.map((module, index) => (
                    <ModuleAccordion
                      key={module.id}
                      module={module}
                      contents={getModuleContents(module.id)}
                      defaultOpen={index === 0}
                      onContentClick={handleContentClick}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Nenhum módulo disponível nesta trilha.
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Progress Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">Seu Progresso</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Conclusão</span>
                    <span className="font-medium">{progress?.percent || 0}%</span>
                  </div>
                  <Progress value={progress?.percent || 0} />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Conteúdos concluídos</span>
                  <span>{progress?.completed || 0} de {progress?.total || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">Informações</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>Módulos</span>
                    </div>
                    <Badge variant="secondary">{modules?.length || 0}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Play className="h-4 w-4" />
                      <span>Conteúdos</span>
                    </div>
                    <Badge variant="secondary">{allContents?.length || 0}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Duração total</span>
                    </div>
                    <Badge variant="secondary">{getTotalDuration()} min</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured badge */}
            {track.is_featured && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="p-4 text-center">
                  <Badge className="bg-primary">⭐ Trilha em Destaque</Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default TrackDetail;
