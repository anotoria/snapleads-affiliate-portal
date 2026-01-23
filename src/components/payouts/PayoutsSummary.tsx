import { motion } from "framer-motion";
import { DollarSign, Clock, CheckCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  delay?: number;
}

const SummaryCard = ({ title, value, icon, delay = 0 }: SummaryCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ y: -4 }}
  >
    <Card className="border-border/50 shadow-card h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <motion.div whileHover={{ scale: 1.2, rotate: 10 }}>
          {icon}
        </motion.div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <p className="text-xl sm:text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  </motion.div>
);

export const PayoutsSummary = () => {
  const { t } = useLanguage();
  
  // Mock data
  const availableBalance = 847.50;
  const pendingPayouts = 125.00;
  const totalPaid = 3250.75;
  
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
      <SummaryCard
        title={t.payouts.availableBalance}
        value={`$${availableBalance.toFixed(2)}`}
        icon={<DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-success" />}
        delay={0}
      />
      <SummaryCard
        title={t.payouts.pendingPayouts}
        value={`$${pendingPayouts.toFixed(2)}`}
        icon={<Clock className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />}
        delay={0.1}
      />
      <SummaryCard
        title={t.payouts.totalPaid}
        value={`$${totalPaid.toFixed(2)}`}
        icon={<CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
        delay={0.2}
      />
    </div>
  );
};
