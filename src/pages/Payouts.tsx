import { Wallet } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Payouts = () => {
  const { t } = useLanguage();

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.payouts.title}</h1>
          <p className="mt-1 text-muted-foreground">
            {t.payouts.subtitle}
          </p>
        </div>

        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <Wallet className="h-5 w-5 text-success" />
              </div>
              <div>
                <CardTitle>{t.payouts.management}</CardTitle>
                <CardDescription>{t.payouts.comingSoon}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-accent/30">
              <div className="text-center">
                <Wallet className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">
                  {t.payouts.systemAvailable}
                </p>
                <p className="mt-2 text-sm text-muted-foreground/70">
                  {t.payouts.requestPayouts}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Payouts;
