import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/hooks/useLanguage";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { PageTransition } from "@/components/animations/PageTransition";

const Settings = () => {
  const { t } = useLanguage();

  return (
    <AppLayout>
      <PageTransition>
        <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6 px-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t.settings.title}</h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              {t.settings.subtitle}
            </p>
          </div>

          <ProfileSettings />
          <NotificationSettings />
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default Settings;
