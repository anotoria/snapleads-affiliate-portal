import { useState } from "react";
import { Award, Trophy, Gem, Diamond, Shield, Crown, Calculator, History, TrendingUp } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/hooks/useLanguage";
import { useTiers } from "@/hooks/useTiers";
import { useCommissions, useCommissionsSummary } from "@/hooks/useCommissions";
import { PageTransition } from "@/components/animations/PageTransition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const tierIcons: Record<string, React.ElementType> = {
  award: Award,
  trophy: Trophy,
  gem: Gem,
  diamond: Diamond,
  shield: Shield,
  crown: Crown,
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const Commissions = () => {
  const { t } = useLanguage();
  const { data: tiers, isLoading: tiersLoading } = useTiers();
  const { data: commissions, isLoading: commissionsLoading } = useCommissions();
  const { totalEarned, totalPending, totalBonuses } = useCommissionsSummary();
  
  const [simulatorRevenue, setSimulatorRevenue] = useState("");
  const [simulatorResult, setSimulatorResult] = useState<{
    tier: string;
    commission: number;
    bonus: number;
    total: number;
  } | null>(null);

  const handleCalculate = () => {
    const revenue = parseFloat(simulatorRevenue) || 0;
    if (!tiers || revenue <= 0) return;

    const tier = tiers.find(
      (t) => revenue >= t.min_revenue && (t.max_revenue === null || revenue <= t.max_revenue)
    );

    if (tier) {
      const commission = revenue * (tier.commission_percentage / 100);
      setSimulatorResult({
        tier: tier.display_name,
        commission,
        bonus: tier.bonus_amount,
        total: commission + tier.bonus_amount,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      processing: "outline",
      completed: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <AppLayout>
      <PageTransition>
        <div className="mx-auto max-w-6xl space-y-6 px-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t.commissions.title}</h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              {t.commissions.subtitle}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Recebido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-success">{formatCurrency(totalEarned)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pendente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-warning">{formatCurrency(totalPending)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Bônus Recebidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalBonuses)}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="tiers" className="space-y-4">
            <TabsList>
              <TabsTrigger value="tiers" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                {t.commissions.tierLevels}
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                {t.commissions.history}
              </TabsTrigger>
              <TabsTrigger value="simulator" className="gap-2">
                <Calculator className="h-4 w-4" />
                {t.commissions.simulator}
              </TabsTrigger>
            </TabsList>

            {/* Tier Levels Tab */}
            <TabsContent value="tiers">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {tiersLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <Skeleton className="h-32 w-full" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  tiers?.map((tier) => {
                    const TierIcon = tierIcons[tier.icon || "award"] || Award;
                    return (
                      <Card 
                        key={tier.id} 
                        className="relative overflow-hidden"
                        style={{ borderColor: `${tier.color}40` }}
                      >
                        <div 
                          className="absolute top-0 left-0 right-0 h-1"
                          style={{ backgroundColor: tier.color }}
                        />
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: `${tier.color}20` }}
                            >
                              <TierIcon 
                                className="h-6 w-6" 
                                style={{ color: tier.color }}
                              />
                            </div>
                            <div>
                              <CardTitle style={{ color: tier.color }}>
                                {tier.display_name}
                              </CardTitle>
                              <CardDescription>
                                {tier.commission_percentage}% comissão
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Faturamento:</span>
                              <span className="font-medium">
                                {formatCurrency(tier.min_revenue)} - {tier.max_revenue ? formatCurrency(tier.max_revenue) : "∞"}
                              </span>
                            </div>
                            {tier.bonus_amount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Bônus:</span>
                                <span className="font-medium text-success">
                                  {formatCurrency(tier.bonus_amount)}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <CardContent className="pt-6">
                  {commissionsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : commissions && commissions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t.commissions.referenceMonth}</TableHead>
                          <TableHead>{t.commissions.clients}</TableHead>
                          <TableHead>{t.commissions.revenue}</TableHead>
                          <TableHead>{t.commissions.rate}</TableHead>
                          <TableHead>{t.commissions.value}</TableHead>
                          <TableHead>{t.commissions.bonus}</TableHead>
                          <TableHead>{t.commissions.total}</TableHead>
                          <TableHead>{t.commissions.status}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {commissions.map((commission) => (
                          <TableRow key={commission.id}>
                            <TableCell className="font-medium">
                              {commission.reference_month}
                            </TableCell>
                            <TableCell>{commission.client_count}</TableCell>
                            <TableCell>{formatCurrency(commission.base_revenue)}</TableCell>
                            <TableCell>{commission.commission_rate}%</TableCell>
                            <TableCell>{formatCurrency(commission.commission_value)}</TableCell>
                            <TableCell className="text-success">
                              {commission.bonus_value > 0 ? formatCurrency(commission.bonus_value) : "-"}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {formatCurrency(commission.total_value)}
                            </TableCell>
                            <TableCell>{getStatusBadge(commission.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">{t.commissions.noCommissions}</h3>
                      <p className="text-muted-foreground">{t.commissions.noCommissionsDescription}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Simulator Tab */}
            <TabsContent value="simulator">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    {t.commissions.simulator}
                  </CardTitle>
                  <CardDescription>{t.commissions.simulatorDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="revenue">{t.commissions.monthlyRevenue} (R$)</Label>
                        <Input
                          id="revenue"
                          type="number"
                          placeholder="100000"
                          value={simulatorRevenue}
                          onChange={(e) => setSimulatorRevenue(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleCalculate} className="w-full">
                        {t.commissions.calculate}
                      </Button>
                    </div>

                    {simulatorResult && (
                      <Card className="bg-muted/50">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Nível</p>
                              <p className="text-2xl font-bold text-primary">{simulatorResult.tier}</p>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>{t.commissions.estimatedCommission}:</span>
                                <span className="font-medium">{formatCurrency(simulatorResult.commission)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{t.commissions.bonus}:</span>
                                <span className="font-medium text-success">{formatCurrency(simulatorResult.bonus)}</span>
                              </div>
                              <div className="border-t pt-2 flex justify-between">
                                <span className="font-semibold">{t.commissions.total}:</span>
                                <span className="font-bold text-lg">{formatCurrency(simulatorResult.total)}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default Commissions;
