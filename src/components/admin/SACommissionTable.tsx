import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AffiliateCommissionBreakdown } from "@/hooks/useSACommissions";
import { Users } from "lucide-react";

interface SACommissionTableProps {
  breakdown: AffiliateCommissionBreakdown[];
  isLoading?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const getTierBadgeVariant = (tier: string) => {
  const variants: Record<string, "default" | "secondary" | "outline"> = {
    silver: "secondary",
    gold: "default",
    platinum: "outline",
    diamond: "default",
    titanium: "secondary",
    audaks: "default",
  };
  return variants[tier] || "secondary";
};

export const SACommissionTable = ({ breakdown, isLoading }: SACommissionTableProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Comissões por Afiliado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            Carregando dados...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Comissões por Afiliado
        </CardTitle>
      </CardHeader>
      <CardContent>
        {breakdown.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            Nenhum afiliado ativo encontrado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead className="text-center">% Afiliado</TableHead>
                  <TableHead className="text-center">% SA</TableHead>
                  <TableHead className="text-center">Clientes</TableHead>
                  <TableHead className="text-right">Comissão Afiliado</TableHead>
                  <TableHead className="text-right">Comissão SA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {breakdown.map((item) => (
                  <TableRow key={item.affiliateId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.affiliateName}</p>
                        {item.affiliateCompany && (
                          <p className="text-xs text-muted-foreground">
                            {item.affiliateCompany}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTierBadgeVariant(item.affiliateTier)}>
                        {item.affiliateTier.charAt(0).toUpperCase() + item.affiliateTier.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">{item.affiliateCommissionRate}%</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-primary">{item.saCommissionRate}%</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">{item.activeClients}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-muted-foreground">
                        {formatCurrency(item.affiliateCommissionTotal)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(item.saCommissionTotal)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Total Row */}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={4}>TOTAL</TableCell>
                  <TableCell className="text-center">
                    {breakdown.reduce((sum, b) => sum + b.activeClients, 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(breakdown.reduce((sum, b) => sum + b.affiliateCommissionTotal, 0))}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatCurrency(breakdown.reduce((sum, b) => sum + b.saCommissionTotal, 0))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
