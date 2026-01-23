import { DollarSign, Clock, CheckCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  className?: string;
}

const SummaryCard = ({ title, value, icon, className }: SummaryCardProps) => (
  <Card className={`border-border/50 shadow-card ${className}`}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </CardContent>
  </Card>
);

export const PayoutsSummary = () => {
  const { t } = useLanguage();
  
  // Mock data
  const availableBalance = 847.50;
  const pendingPayouts = 125.00;
  const totalPaid = 3250.75;
  
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <SummaryCard
        title={t.payouts.availableBalance}
        value={`$${availableBalance.toFixed(2)}`}
        icon={<DollarSign className="h-5 w-5 text-success" />}
      />
      <SummaryCard
        title={t.payouts.pendingPayouts}
        value={`$${pendingPayouts.toFixed(2)}`}
        icon={<Clock className="h-5 w-5 text-warning" />}
      />
      <SummaryCard
        title={t.payouts.totalPaid}
        value={`$${totalPaid.toFixed(2)}`}
        icon={<CheckCircle className="h-5 w-5 text-primary" />}
      />
    </div>
  );
};
