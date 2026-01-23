import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/hooks/useLanguage";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";

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

        <ProfileSettings />
        <NotificationSettings />
      </div>
    </AppLayout>
  );
};

export default Settings;
