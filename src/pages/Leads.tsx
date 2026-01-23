import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/hooks/useLanguage";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { PageTransition } from "@/components/animations/PageTransition";

const Leads = () => {
  const { t } = useLanguage();

  return (
    <AppLayout>
      <PageTransition>
        <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6 px-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t.leads.title}</h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              {t.leads.subtitle}
            </p>
          </div>

          <LeadsTable />
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default Leads;
