import { useLanguage } from "@/hooks/useLanguage";
import { useUserTierProgress } from "@/hooks/useTiers";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export const PartnerStatusWidget = ({ collapsed }: { collapsed: boolean }) => {
  const { t } = useLanguage();
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  
  const currentRevenue = metrics?.monthlyRevenue || 0;
  const { currentTier, nextTier, progress, isLoading: tierLoading } = useUserTierProgress(currentRevenue);

  const isLoading = metricsLoading || tierLoading;

  if (collapsed) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="p-3 rounded-lg bg-sidebar-accent/50">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-6 w-20 mb-2" />
        <Skeleton className="h-2 w-full mb-2" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    );
  }

  if (!currentTier) return null;

  return (
    <div className="p-3 rounded-lg bg-sidebar-accent/50 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {t.dashboard.partnerStatus || "Status do Parceiro"}
        </span>
        {metrics?.activeLeads !== undefined && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {metrics.activeLeads}
          </Badge>
        )}
      </div>
      
      <div 
        className="font-bold text-lg"
        style={{ color: currentTier.color }}
      >
        {currentTier.display_name}
      </div>
      
      <Progress value={progress} className="h-1.5" />
      
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{currentTier.commission_percentage}% {t.dashboard.commission || "Comissão"}</span>
        {nextTier && (
          <span>
            {Math.round(100 - progress)}% {t.dashboard.toReach || "para"} {nextTier.display_name}
          </span>
        )}
      </div>
    </div>
  );
};
