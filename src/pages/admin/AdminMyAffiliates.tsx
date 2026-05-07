import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAffiliates } from "@/hooks/useAdminAffiliates";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Search, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const TIER_COLORS: Record<string, string> = {
  silver: "bg-gray-100 text-gray-700 border-gray-200",
  gold: "bg-yellow-100 text-yellow-700 border-yellow-200",
  platinum: "bg-slate-100 text-slate-700 border-slate-200",
  diamond: "bg-blue-100 text-blue-700 border-blue-200",
  titanium: "bg-purple-100 text-purple-700 border-purple-200",
  audaks: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const AdminMyAffiliates = () => {
  const { user } = useAuth();
  const { isSuperAdmin } = useAdminAccess();
  const { affiliates, isLoading } = useAdminAffiliates();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  // For super admin, show all; for admin, only their portfolio
  const myAffiliates = isSuperAdmin
    ? affiliates
    : affiliates.filter((a) => a.managed_by === user?.id);

  const filtered = myAffiliates.filter((a) => {
    const matchesSearch =
      a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.company_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && a.is_active) ||
      (statusFilter === "inactive" && !a.is_active);
    return matchesSearch && matchesStatus;
  });

  const totalActive = myAffiliates.filter((a) => a.is_active).length;
  const totalLeads = myAffiliates.reduce((sum, a) => sum + a.leadsCount, 0);
  const totalPending = myAffiliates.reduce((sum, a) => sum + a.pendingAmount, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Minha Carteira de Afiliados
          </h1>
          <p className="text-muted-foreground">
            Você gerencia {myAffiliates.length} afiliado{myAffiliates.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{myAffiliates.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Ativos</p>
              <p className="text-2xl font-bold">{totalActive}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total de Leads</p>
              <p className="text-2xl font-bold">{totalLeads}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Comissões Pendentes</p>
              <p className="text-2xl font-bold">{formatCurrency(totalPending)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar afiliado..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Afiliados ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome / Empresa</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Leads</TableHead>
                      <TableHead className="text-right">Pendente</TableHead>
                      <TableHead>Cadastro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhum afiliado encontrado em sua carteira
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{a.full_name || "—"}</p>
                              <p className="text-sm text-muted-foreground">
                                {a.company_name || "Sem empresa"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={TIER_COLORS[a.tier_level] || TIER_COLORS.silver}>
                              {a.tier_level.charAt(0).toUpperCase() + a.tier_level.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={a.is_active ? "default" : "secondary"}>
                              {a.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{a.leadsCount}</TableCell>
                          <TableCell className="text-right">{formatCurrency(a.pendingAmount)}</TableCell>
                          <TableCell>
                            {format(new Date(a.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminMyAffiliates;
