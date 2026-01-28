import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  Play,
  FileText
} from "lucide-react";
import { useTrack } from "@/hooks/useTracks";
import { useContent, useAllTrackContents } from "@/hooks/useContents";
import { useContentProgress, useMarkContentComplete } from "@/hooks/useContentProgress";
import { VideoPlayer } from "@/components/learning/VideoPlayer";
import { TextContent } from "@/components/learning/TextContent";

const ContentPlayer = () => {
  const navigate = useNavigate();
  const { id: trackId, contentId } = useParams<{ id: string; contentId: string }>();
  const { data: track } = useTrack(trackId);
  const { data: content, isLoading: contentLoading } = useContent(contentId);
  const { data: allContents } = useAllTrackContents(trackId);
  const { data: progress } = useContentProgress(contentId);
  const markComplete = useMarkContentComplete();

  const currentIndex = allContents?.findIndex(c => c.id === contentId) ?? -1;
  const previousContent = currentIndex > 0 ? allContents?.[currentIndex - 1] : null;
  const nextContent = currentIndex < (allContents?.length ?? 0) - 1 ? allContents?.[currentIndex + 1] : null;

  const handleMarkComplete = async () => {
    if (contentId) {
      await markComplete.mutateAsync(contentId);
    }
  };

  const navigateToContent = (newContentId: string) => {
    navigate(`/materials/tracks/${trackId}/content/${newContentId}`);
  };

  if (contentLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted rounded" />
            <div className="h-6 w-64 bg-muted rounded" />
          </div>
          <div className="aspect-video bg-muted rounded-lg" />
          <div className="h-8 w-1/2 bg-muted rounded" />
        </div>
      </AppLayout>
    );
  }

  if (!content) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Conteúdo não encontrado</h3>
          <p className="mt-2 text-muted-foreground">
            O conteúdo que você está procurando não existe ou não está disponível.
          </p>
          <Button className="mt-4" onClick={() => navigate(`/materials/tracks/${trackId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a Trilha
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/materials/tracks/${trackId}`)}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            {track?.title || "Trilha"}
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground truncate">{content.title}</span>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-6">
            {/* Video or Text Content */}
            {content.content_type === "video" && content.video_url ? (
              <VideoPlayer
                src={content.video_url}
                title={content.title}
                onComplete={handleMarkComplete}
              />
            ) : content.content_type === "text" && content.text_content ? (
              <Card>
                <CardContent className="p-6">
                  <TextContent content={content.text_content} />
                </CardContent>
              </Card>
            ) : (
              <Card className="aspect-video flex items-center justify-center">
                <div className="text-center">
                  <FileText className="mx-auto h-16 w-16 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    Nenhum conteúdo disponível
                  </p>
                </div>
              </Card>
            )}

            {/* Content Info */}
            <Card>
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold">{content.title}</h1>
                {content.description && (
                  <p className="mt-3 text-muted-foreground">{content.description}</p>
                )}

                {/* Duration */}
                {content.duration_minutes > 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Duração: {content.duration_minutes} minutos
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Navigation and Mark Complete */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => previousContent && navigateToContent(previousContent.id)}
                  disabled={!previousContent}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  onClick={() => nextContent && navigateToContent(nextContent.id)}
                  disabled={!nextContent}
                >
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="completed"
                    checked={progress?.completed || false}
                    onCheckedChange={() => handleMarkComplete()}
                    disabled={progress?.completed || markComplete.isPending}
                  />
                  <label 
                    htmlFor="completed" 
                    className="text-sm cursor-pointer select-none"
                  >
                    Marcar como concluído
                  </label>
                </div>
                
                {progress?.completed && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Content List */}
          <div className="space-y-4">
            <h3 className="font-semibold">Conteúdos da Trilha</h3>
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {allContents?.map((c, index) => (
                <button
                  key={c.id}
                  onClick={() => navigateToContent(c.id)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors
                    ${c.id === contentId 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-muted/50"
                    }
                  `}
                >
                  <span className="shrink-0 text-xs text-muted-foreground w-5">
                    {index + 1}.
                  </span>
                  {c.content_type === "video" ? (
                    <Play className="h-4 w-4 shrink-0" />
                  ) : (
                    <FileText className="h-4 w-4 shrink-0" />
                  )}
                  <span className="flex-1 text-sm line-clamp-2">{c.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ContentPlayer;
