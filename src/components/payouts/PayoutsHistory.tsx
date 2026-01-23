import { motion } from "framer-motion";
import { Wallet, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { usePayouts, PayoutStatus } from "@/hooks/usePayouts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const methodLabels: Record<string, string> = {
  pix: "PIX",
  bank_transfer: "Bank Transfer",
  paypal: "PayPal",
};

export const PayoutsHistory = () => {
  const { t } = useLanguage();
  const { data: payouts = [], isLoading, error } = usePayouts();
  
  const getStatusBadge = (status: PayoutStatus) => {
    const variants: Record<PayoutStatus, { variant: "default" | "secondary" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: t.payouts.pending },
      processing: { variant: "outline", label: t.payouts.processing },
      completed: { variant: "default", label: t.payouts.completed },
    };
    
    return (
      <Badge variant={variants[status].variant} className="font-medium">
        {variants[status].label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (error) {
    return (
      <Card className="border-border/50 shadow-card">
        <CardContent className="flex min-h-[200px] items-center justify-center">
          <p className="text-destructive">Error loading payouts. Please try again.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card className="border-border/50 shadow-card">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Wallet className="h-5 w-5 text-success" />
              </motion.div>
              <div>
                <CardTitle className="text-base sm:text-lg">{t.payouts.payoutHistory}</CardTitle>
                <CardDescription className="text-sm">{t.payouts.minimumPayout}</CardDescription>
              </div>
            </div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="bg-brand-gradient hover:opacity-90 w-full sm:w-auto">
                {t.payouts.requestPayout}
              </Button>
            </motion.div>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6">
          {isLoading ? (
            <div className="flex min-h-[150px] sm:min-h-[200px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : payouts.length === 0 ? (
            <div className="flex min-h-[150px] sm:min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-accent/30">
              <div className="text-center px-4">
                <Wallet className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
                <p className="mt-4 text-base sm:text-lg font-medium text-muted-foreground">
                  {t.payouts.noPayouts}
                </p>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground/70">
                  {t.payouts.noPayoutsDescription}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Cards View */}
              <div className="block sm:hidden space-y-3">
                {payouts.map((payout, index) => (
                  <motion.div
                    key={payout.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-lg border border-border bg-card p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">${payout.amount.toFixed(2)}</p>
                      {getStatusBadge(payout.status)}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{methodLabels[payout.method] || payout.method}</span>
                      <span>{formatDate(payout.created_at)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-accent/50">
                        <TableHead className="font-semibold">{t.payouts.date}</TableHead>
                        <TableHead className="font-semibold">{t.payouts.amount}</TableHead>
                        <TableHead className="font-semibold">{t.payouts.method}</TableHead>
                        <TableHead className="font-semibold">{t.payouts.status}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payouts.map((payout, index) => (
                        <motion.tr
                          key={payout.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-accent/30 border-b border-border last:border-0"
                        >
                          <TableCell className="text-muted-foreground">{formatDate(payout.created_at)}</TableCell>
                          <TableCell className="font-medium">${payout.amount.toFixed(2)}</TableCell>
                          <TableCell className="text-muted-foreground">{methodLabels[payout.method] || payout.method}</TableCell>
                          <TableCell>{getStatusBadge(payout.status)}</TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
