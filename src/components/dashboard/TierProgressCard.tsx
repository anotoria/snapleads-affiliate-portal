import { Award, Trophy, Gem, Diamond, Shield, Crown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserTierProgress, Tier } from "@/hooks/useTiers";
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
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const TierProgressCard = () => {
  const { t } = useLanguage();
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  
  // Calculate total revenue from active leads
  const currentRevenue = metrics?.totalEarnings || 0;
  const { currentTier, nextTier, progress, isLoading: tierLoading } = useUserTierProgress(currentRevenue * 10); // Multiply by 10 to estimate client revenue

  const isLoading = metricsLoading || tierLoading;

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentTier) {
    return null;
  }

  const TierIcon = getTierIcon(currentTier.icon);
  const NextTierIcon = nextTier ? getTierIcon(nextTier.icon) : null;

  const amountToNextTier = nextTier 
    ? nextTier.min_revenue - (currentRevenue * 10) 
    : 0;

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
            {t.dashboard.yourTier}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            {/* Current Tier Badge */}
            <div 
              className="flex items-center justify-center w-16 h-16 rounded-full"
              style={{ backgroundColor: `${currentTier.color}20` }}
            >
              <TierIcon 
                className="h-8 w-8" 
                style={{ color: currentTier.color }}
              />
            </div>
            <div className="flex-1">
              <h3 
                className="text-2xl font-bold"
                style={{ color: currentTier.color }}
              >
                {currentTier.display_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentTier.commission_percentage}% {t.dashboard.commission}
              </p>
            </div>
          </div>

          {/* Progress to next tier */}
          {nextTier && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.dashboard.nextTier}:</span>
                <div className="flex items-center gap-1">
                  {NextTierIcon && (
                    <NextTierIcon 
                      className="h-4 w-4" 
                      style={{ color: nextTier.color }}
                    />
                  )}
                  <span 
                    className="font-medium"
                    style={{ color: nextTier.color }}
                  >
                    {nextTier.display_name}
                  </span>
                </div>
              </div>
              <Progress 
                value={progress} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground text-center">
                {formatCurrency(Math.max(0, amountToNextTier))} {t.dashboard.toNextTier}
              </p>
            </div>
          )}

          {!nextTier && (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">
                🎉 Você está no nível máximo!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
