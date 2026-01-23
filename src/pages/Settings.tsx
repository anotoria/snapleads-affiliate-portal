import { Settings as SettingsIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
  const { t } = useLanguage();

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.settings.title}</h1>
          <p className="mt-1 text-muted-foreground">
            {t.settings.subtitle}
          </p>
        </div>

        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <SettingsIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>{t.settings.accountSettings}</CardTitle>
                <CardDescription>{t.settings.comingSoon}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-accent/30">
              <div className="text-center">
                <SettingsIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">
                  {t.settings.panelAvailable}
                </p>
                <p className="mt-2 text-sm text-muted-foreground/70">
                  {t.settings.updateProfile}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Settings;
