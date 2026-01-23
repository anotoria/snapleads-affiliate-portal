import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Trophy, Gem, Diamond, Shield, Crown, TrendingUp } from "lucide-react";
import { useUserTierProgress } from "@/hooks/useTiers";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
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

interface PartnerLevelCardProps {
  delay?: number;
}

export const PartnerLevelCard = ({ delay = 0 }: PartnerLevelCardProps) => {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const currentRevenue = metrics?.monthlyRevenue || 0;
  const { currentTier, isLoading: tierLoading } = useUserTierProgress(currentRevenue);

  const isLoading = metricsLoading || tierLoading;

  const TierIcon = currentTier ? getTierIcon(currentTier.icon) : TrendingUp;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
    >
      <Card className="border-border/50 shadow-card transition-shadow hover:shadow-card-hover h-full">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                Nível do Parceiro
              </p>
              {isLoading ? (
                <div className="h-7 sm:h-8 w-20 sm:w-24 rounded skeleton-shimmer" />
              ) : (
                <p 
                  className="text-2xl sm:text-3xl font-bold truncate"
                  style={{ color: currentTier?.color || "hsl(var(--foreground))" }}
                >
                  {currentTier?.display_name || "Silver"}
                </p>
              )}
            </div>
            <motion.div 
              className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-accent"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
              style={{ 
                backgroundColor: currentTier?.color ? `${currentTier.color}20` : undefined 
              }}
            >
              <TierIcon 
                className="h-5 w-5 sm:h-6 sm:w-6" 
                style={{ color: currentTier?.color || "hsl(var(--primary))" }}
              />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
