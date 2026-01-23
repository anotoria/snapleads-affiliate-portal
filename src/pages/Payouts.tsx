import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/hooks/useLanguage";
import { PayoutsSummary } from "@/components/payouts/PayoutsSummary";
import { PayoutsHistory } from "@/components/payouts/PayoutsHistory";

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

        <PayoutsSummary />
        <PayoutsHistory />
      </div>
    </AppLayout>
  );
};

export default Payouts;
