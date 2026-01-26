import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAffiliates } from "@/hooks/useAdminAffiliates";
import { useAdminTiers } from "@/hooks/useAdminTiers";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AffiliateFormDialog } from "@/components/admin/AffiliateFormDialog";
import { ResetPasswordDialog } from "@/components/admin/ResetPasswordDialog";
import { Users, Search, MoreHorizontal, UserCheck, UserX, Eye, Edit, RefreshCw, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AffiliateWithStats } from "@/hooks/useAdminAffiliates";

const TIER_COLORS: Record<string, string> = {
  silver: "bg-gray-100 text-gray-700 border-gray-200",
  gold: "bg-yellow-100 text-yellow-700 border-yellow-200",
  platinum: "bg-slate-100 text-slate-700 border-slate-200",
  diamond: "bg-blue-100 text-blue-700 border-blue-200",
  titanium: "bg-purple-100 text-purple-700 border-purple-200",
  audaks: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const AdminAffiliates = () => {
  const { t } = useLanguage();
  const { affiliates, isLoading, toggleActiveStatus, updateAffiliate, isUpdating } = useAdminAffiliates();
  const { tiers } = useAdminTiers();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<AffiliateWithStats | null>(null);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [affiliateForPasswordReset, setAffiliateForPasswordReset] = useState<AffiliateWithStats | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const filteredAffiliates = affiliates.filter((affiliate) => {
    const matchesSearch =
      affiliate.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      affiliate.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      affiliate.affiliate_code?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && affiliate.is_active) ||
      (statusFilter === "inactive" && !affiliate.is_active);

    const matchesTier = tierFilter === "all" || affiliate.tier_level === tierFilter;

    return matchesSearch && matchesStatus && matchesTier;
  });

  const uniqueTiers = [...new Set(affiliates.map((a) => a.tier_level))];

  const handleEditClick = (affiliate: AffiliateWithStats) => {
    setSelectedAffiliate(affiliate);
    setEditDialogOpen(true);
  };

  const handleResetPasswordClick = (affiliate: AffiliateWithStats) => {
    setAffiliateForPasswordReset(affiliate);
    setResetPasswordDialogOpen(true);
  };

  const handleUpdateAffiliate = (userId: string, updates: any) => {
    updateAffiliate({ userId, updates });
  };

  const tiersForForm = tiers.map((tier) => ({
    id: tier.id,
    name: tier.name,
    display_name: tier.display_name,
  }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t.admin.users}</h1>
            <p className="text-muted-foreground">{t.admin.usersSubtitle}</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t.admin.search}
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
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Tiers</SelectItem>
                  {uniqueTiers.map((tier) => (
                    <SelectItem key={tier} value={tier}>
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </SelectItem>
                  ))}
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
              Afiliados ({filteredAffiliates.length})
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
                      <TableHead>{t.admin.tier}</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">{t.admin.leadsCount}</TableHead>
                      <TableHead className="text-right">{t.admin.pendingAmount}</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead className="text-right">{t.admin.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAffiliates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhum afiliado encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAffiliates.map((affiliate) => (
                        <TableRow key={affiliate.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{affiliate.full_name || "—"}</p>
                              <p className="text-sm text-muted-foreground">
                                {affiliate.company_name || "Sem empresa"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={TIER_COLORS[affiliate.tier_level] || TIER_COLORS.silver}
                            >
                              {affiliate.tier_level.charAt(0).toUpperCase() + affiliate.tier_level.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={affiliate.is_active ? "default" : "secondary"}>
                              {affiliate.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{affiliate.leadsCount}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(affiliate.pendingAmount)}
                          </TableCell>
                          <TableCell>
                            {format(new Date(affiliate.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={isUpdating}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditClick(affiliate)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  {t.admin.editUser}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => toggleActiveStatus(affiliate.user_id, affiliate.is_active)}
                                >
                                  {affiliate.is_active ? (
                                    <>
                                      <UserX className="mr-2 h-4 w-4" />
                                      {t.admin.deactivate}
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="mr-2 h-4 w-4" />
                                      {t.admin.activate}
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResetPasswordClick(affiliate)}>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  {t.admin.resetPassword}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

        {/* Edit Affiliate Dialog */}
        <AffiliateFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          affiliate={selectedAffiliate}
          tiers={tiersForForm}
          onSubmit={handleUpdateAffiliate}
          isSubmitting={isUpdating}
        />

        {/* Reset Password Dialog */}
        {affiliateForPasswordReset && (
          <ResetPasswordDialog
            open={resetPasswordDialogOpen}
            onOpenChange={setResetPasswordDialogOpen}
            affiliateName={affiliateForPasswordReset.full_name || ""}
            affiliateEmail={affiliateForPasswordReset.email || ""}
            userId={affiliateForPasswordReset.user_id}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAffiliates;
