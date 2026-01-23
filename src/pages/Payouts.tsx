import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/hooks/useLanguage";
import { PayoutsSummary } from "@/components/payouts/PayoutsSummary";
import { PayoutsHistory } from "@/components/payouts/PayoutsHistory";
import { PageTransition } from "@/components/animations/PageTransition";

const Payouts = () => {
  const { t } = useLanguage();

  return (
    <AppLayout>
      <PageTransition>
        <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6 px-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t.payouts.title}</h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              {t.payouts.subtitle}
            </p>
          </div>

          <PayoutsSummary />
          <PayoutsHistory />
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default Payouts;
