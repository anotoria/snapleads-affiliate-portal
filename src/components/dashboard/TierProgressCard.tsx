import { Award, Trophy, Gem, Diamond, Shield, Crown, TrendingUp, Lightbulb, Users, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserTierProgress } from "@/hooks/useTiers";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const tierIcons: Record<string, React.ElementType> = {
  award: Award,
  trophy: Trophy,
  gem: Gem,
  diamond: Diamond,
  shield: Shield,
  crown: Crown,
};

const getTierIcon = (iconName: string | null) => {
  if (!iconName) return Award;
  return tierIcons[iconName] || Award;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const TierProgressCard = () => {
  const { t } = useLanguage();
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  
  // Use active leads count to calculate tier progress
  const activeLeadsCount = metrics?.activeLeads || 0;
  const { 
    currentTier, 
    nextTier, 
    progress, 
    leadsToNextTier,
    currentRevenue,
    revenueToNextTier,
    isLoading: tierLoading 
  } = useUserTierProgress(activeLeadsCount);

  const isLoading = metricsLoading || tierLoading;

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentTier) {
    return null;
  }

  const nextTierLeads = nextTier?.client_count || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t.dashboard.levelProgress || "Progresso de Nível"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current and Next Tier */}
          <div className="flex items-center justify-between">
            <span 
              className="font-semibold"
              style={{ color: currentTier.color }}
            >
              {currentTier.display_name}
            </span>
            {nextTier && (
              <span 
                className="font-semibold"
                style={{ color: nextTier.color }}
              >
                {nextTier.display_name}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <Progress 
              value={progress} 
              className="h-3"
              style={{ 
                background: `linear-gradient(to right, ${currentTier.color}30, ${nextTier?.color || currentTier.color}30)`
              }}
            />
            
            {nextTier && (
              <div className="space-y-2">
                {/* Lead Count Row */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{activeLeadsCount} de {nextTierLeads} leads ativos</span>
                  </div>
                  <span className="text-primary font-medium">
                    {t.dashboard.remaining || "Faltam"} {leadsToNextTier} leads
                  </span>
                </div>
                
                {/* Revenue Row */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatCurrency(currentRevenue)} de {formatCurrency(nextTier.min_revenue)}</span>
                  </div>
                  <span className="text-primary font-medium">
                    {t.dashboard.remaining || "Falta"} {formatCurrency(revenueToNextTier)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bonus Message */}
          {nextTier && nextTier.bonus_amount > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/50">
              <Lightbulb className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                {t.dashboard.bonusMessage || "Ao atingir"}{" "}
                <span className="font-semibold" style={{ color: nextTier.color }}>
                  {nextTier.display_name}
                </span>
                , {t.dashboard.bonusMessagePart2 || "você receberá um bônus de"}{" "}
                <span className="font-semibold text-success">
                  {formatCurrency(nextTier.bonus_amount)}
                </span>{" "}
                {t.dashboard.bonusMessagePart3 || "e sua comissão aumentará para"}{" "}
                <span className="font-semibold">{nextTier.commission_percentage}%</span>!
              </p>
            </div>
          )}

          {!nextTier && (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">
                🎉 {t.dashboard.maxLevelReached || "Você está no nível máximo!"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
