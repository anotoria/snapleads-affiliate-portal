import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  isLoading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  delay?: number;
  variant?: "default" | "highlight";
}

export const MetricCard = ({
  title,
  value,
  icon,
  isLoading = false,
  trend,
  delay = 0,
  variant = "default",
}: MetricCardProps) => {
  const { t } = useLanguage();

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
      <Card className={cn(
        "border-border/50 shadow-card transition-shadow hover:shadow-card-hover h-full",
        variant === "highlight" && "border-primary/20"
      )}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
              {isLoading ? (
                <div className="h-7 sm:h-8 w-20 sm:w-24 rounded skeleton-shimmer" />
              ) : (
                <p className="text-2xl sm:text-3xl font-bold text-foreground truncate">{value}</p>
              )}
              {trend && !isLoading && (
                <p
                  className={cn(
                    "text-xs font-medium",
                    trend.isPositive ? "text-success" : "text-destructive"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value.toFixed(1)}% {trend.label || t.dashboard.increase || "aumento"}
                </p>
              )}
            </div>
            <motion.div 
              className={cn(
                "flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg",
                variant === "highlight" ? "bg-primary/10" : "bg-accent"
              )}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {icon}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
