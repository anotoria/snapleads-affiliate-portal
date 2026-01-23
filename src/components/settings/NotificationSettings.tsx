import { useState } from "react";
import { Bell } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NotificationSetting {
  id: string;
  labelKey: keyof typeof import("@/i18n/translations").translations.en.settings;
  descriptionKey: keyof typeof import("@/i18n/translations").translations.en.settings;
  enabled: boolean;
}

export const NotificationSettings = () => {
  const { t } = useLanguage();
  
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: "email",
      labelKey: "emailNotifications",
      descriptionKey: "emailNotificationsDescription",
      enabled: true,
    },
    {
      id: "leads",
      labelKey: "leadAlerts",
      descriptionKey: "leadAlertsDescription",
      enabled: true,
    },
    {
      id: "payouts",
      labelKey: "payoutNotifications",
      descriptionKey: "payoutNotificationsDescription",
      enabled: false,
    },
  ]);
  
  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };
  
  return (
    <Card className="border-border/50 shadow-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>{t.settings.notificationSettings}</CardTitle>
            <CardDescription>{t.settings.notificationDescription}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {settings.map((setting) => (
          <div
            key={setting.id}
            className="flex items-center justify-between rounded-lg border border-border p-4"
          >
            <div className="space-y-0.5">
              <Label htmlFor={setting.id} className="text-base font-medium cursor-pointer">
                {t.settings[setting.labelKey]}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t.settings[setting.descriptionKey]}
              </p>
            </div>
            <Switch
              id={setting.id}
              checked={setting.enabled}
              onCheckedChange={() => toggleSetting(setting.id)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
