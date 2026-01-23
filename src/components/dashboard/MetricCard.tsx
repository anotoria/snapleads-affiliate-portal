import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  isLoading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const MetricCard = ({
  title,
  value,
  icon,
  isLoading = false,
  trend,
}: MetricCardProps) => {
  return (
    <Card className="border-border/50 shadow-card transition-shadow hover:shadow-card-hover">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <div className="h-8 w-24 rounded skeleton-shimmer" />
            ) : (
              <p className="text-3xl font-bold text-foreground">{value}</p>
            )}
            {trend && !isLoading && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-success" : "text-destructive"
                )}
              >
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}% from last month
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
