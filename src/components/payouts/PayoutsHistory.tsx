import { useMemo } from "react";
import { Wallet } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
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

type PayoutStatus = "pending" | "processing" | "completed";

interface Payout {
  id: string;
  date: string;
  amount: number;
  status: PayoutStatus;
  method: string;
}

// Mock data for payouts
const generateMockPayouts = (): Payout[] => {
  const methods = ["PayPal", "Bank Transfer", "Wise"];
  const statuses: PayoutStatus[] = ["pending", "processing", "completed"];
  const payouts: Payout[] = [];
  
  for (let i = 0; i < 8; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    
    payouts.push({
      id: `payout-${i + 1}`,
      date: date.toISOString().split("T")[0],
      amount: Math.floor(Math.random() * 400) + 50,
      status: i < 2 ? statuses[Math.floor(Math.random() * 2)] : "completed",
      method: methods[Math.floor(Math.random() * methods.length)],
    });
  }
  
  return payouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const PayoutsHistory = () => {
  const { t } = useLanguage();
  const payouts = useMemo(() => generateMockPayouts(), []);
  
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
  
  return (
    <Card className="border-border/50 shadow-card">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <Wallet className="h-5 w-5 text-success" />
            </div>
            <div>
              <CardTitle>{t.payouts.payoutHistory}</CardTitle>
              <CardDescription>{t.payouts.minimumPayout}</CardDescription>
            </div>
          </div>
          
          <Button className="bg-brand-gradient hover:opacity-90">
            {t.payouts.requestPayout}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {payouts.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-accent/30">
            <div className="text-center">
              <Wallet className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium text-muted-foreground">
                {t.payouts.noPayouts}
              </p>
              <p className="mt-2 text-sm text-muted-foreground/70">
                {t.payouts.noPayoutsDescription}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
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
                {payouts.map((payout) => (
                  <TableRow key={payout.id} className="hover:bg-accent/30">
                    <TableCell className="text-muted-foreground">{payout.date}</TableCell>
                    <TableCell className="font-medium">${payout.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground">{payout.method}</TableCell>
                    <TableCell>{getStatusBadge(payout.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
