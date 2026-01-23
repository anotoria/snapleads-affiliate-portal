import { Settings as SettingsIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account preferences and settings.
          </p>
        </div>

        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <SettingsIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Coming soon in Phase 2</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-accent/30">
              <div className="text-center">
                <SettingsIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">
                  Settings panel will be available soon
                </p>
                <p className="mt-2 text-sm text-muted-foreground/70">
                  Update profile, notifications, and security settings
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
