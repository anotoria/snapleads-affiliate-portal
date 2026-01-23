import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/hooks/useLanguage";
import { LeadsTable } from "@/components/leads/LeadsTable";

const Leads = () => {
  const { t } = useLanguage();

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.leads.title}</h1>
          <p className="mt-1 text-muted-foreground">
            {t.leads.subtitle}
          </p>
        </div>

        <LeadsTable />
      </div>
    </AppLayout>
  );
};

export default Leads;
