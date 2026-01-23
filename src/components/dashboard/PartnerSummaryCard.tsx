import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("pt-BR");
};

export const PartnerSummaryCard = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const { data: metrics, isLoading } = useDashboardMetrics();

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <div className="rounded-xl bg-brand-gradient p-6">
          <Skeleton className="h-6 w-40 bg-white/20 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 bg-white/20" />
            <Skeleton className="h-5 w-48 bg-white/20" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      whileHover={{ y: -2 }}
    >
      <div className="rounded-xl bg-brand-gradient p-6 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative z-10 space-y-4">
          <h3 className="text-lg font-bold">{t.dashboard.partnerSummary || "Resumo do Parceiro"}</h3>

          <div className="grid gap-3">
            {/* Company */}
            {profile?.company_name && (
              <div>
                <p className="text-xs text-white/70">{t.settings.companyName || "Empresa"}</p>
                <p className="font-semibold">{profile.company_name}</p>
              </div>
            )}

            {/* CNPJ */}
            {profile?.cnpj && (
              <div>
                <p className="text-xs text-white/70">{t.settings.cnpj || "CNPJ"}</p>
                <p className="font-semibold">{profile.cnpj}</p>
              </div>
            )}

            {/* Last Payment */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/70">{t.dashboard.lastPayment || "Último Pagamento"}</p>
                <p className="font-semibold text-lg">{formatCurrency(metrics?.lastPayoutAmount ?? 0)}</p>
              </div>
              {metrics?.lastPayoutDate && (
                <Badge variant="secondary" className="bg-white/20 text-white border-none">
                  {formatDate(metrics.lastPayoutDate)}
                </Badge>
              )}
            </div>

            {/* Next Estimated Payment */}
            <div>
              <p className="text-xs text-white/70">{t.dashboard.nextEstimatedPayment || "Próximo Pagamento Estimado"}</p>
              <p className="font-semibold text-lg text-brand-turquoise" style={{ color: "hsl(174 100% 60%)" }}>
                {formatCurrency(metrics?.nextEstimatedPayout ?? 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
