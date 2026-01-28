import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { useTracks } from "@/hooks/useTracks";
import { TrackCard } from "@/components/learning/TrackCard";

const Tracks = () => {
  const navigate = useNavigate();
  const { data: tracks, isLoading } = useTracks();

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
            <h1 className="text-3xl font-bold text-foreground">Trilhas de Aprendizado</h1>
            <p className="mt-1 text-muted-foreground">
              Cursos completos para impulsionar seus resultados
            </p>
          </div>
        </div>

        {/* Tracks Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted" />
                <CardContent className="p-4">
                  <div className="h-5 w-3/4 bg-muted rounded mb-2" />
                  <div className="h-4 w-full bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tracks && tracks.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                onClick={() => navigate(`/materials/tracks/${track.id}`)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <GraduationCap className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma trilha disponível</h3>
            <p className="mt-2 text-muted-foreground">
              As trilhas de aprendizado estarão disponíveis em breve.
            </p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Tracks;
