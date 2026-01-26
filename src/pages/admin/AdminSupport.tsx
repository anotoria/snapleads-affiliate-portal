import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminTickets } from "@/hooks/useAdminTickets";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { HelpCircle, Search, MessageCircle, Check, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-yellow-100 text-yellow-700 border-yellow-200",
  waiting_user: "bg-purple-100 text-purple-700 border-purple-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  closed: "bg-gray-100 text-gray-700 border-gray-200",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const AdminSupport = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { tickets, isLoading, addAdminReply, resolveTicket, closeTicket, isReplying } = useAdminTickets();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
      ticket.affiliate_name?.toLowerCase().includes(search.toLowerCase()) ||
      ticket.affiliate_company?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openReplyDialog = (ticketId: string) => {
    setSelectedTicket(ticketId);
    setReplyMessage("");
    setReplyDialogOpen(true);
  };

  const handleSendReply = () => {
    if (selectedTicket && replyMessage && user) {
      addAdminReply({
        ticketId: selectedTicket,
        message: replyMessage,
        userId: user.id,
      });
      setReplyDialogOpen(false);
    }
  };

  const handleResolve = (ticketId: string) => {
    if (confirm("Deseja resolver este ticket?")) {
      resolveTicket(ticketId);
    }
  };

  const handleClose = (ticketId: string) => {
    if (confirm("Deseja fechar este ticket?")) {
      closeTicket(ticketId);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: t.support.open,
      in_progress: t.support.inProgress,
      waiting_user: t.support.waitingUser,
      resolved: t.support.resolved,
      closed: t.support.closed,
    };
    return labels[status] || status;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">{t.admin.supportManagement}</h1>
          <p className="text-muted-foreground">{t.admin.supportManagementSubtitle}</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por assunto ou afiliado..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="open">{t.support.open}</SelectItem>
                  <SelectItem value="in_progress">{t.support.inProgress}</SelectItem>
                  <SelectItem value="waiting_user">{t.support.waitingUser}</SelectItem>
                  <SelectItem value="resolved">{t.support.resolved}</SelectItem>
                  <SelectItem value="closed">{t.support.closed}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">{t.support.low}</SelectItem>
                  <SelectItem value="medium">{t.support.medium}</SelectItem>
                  <SelectItem value="high">{t.support.high}</SelectItem>
                  <SelectItem value="urgent">{t.support.urgent}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Tickets de Suporte ({filteredTickets.length})
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
                      <TableHead>Assunto</TableHead>
                      <TableHead>Afiliado</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhum ticket encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell>
                            <p className="font-medium">{ticket.subject}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {ticket.message}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{ticket.affiliate_name || "—"}</p>
                              <p className="text-xs text-muted-foreground">
                                {ticket.affiliate_company || "—"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{ticket.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={PRIORITY_COLORS[ticket.priority]}>
                              {ticket.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[ticket.status]}>
                              {getStatusLabel(ticket.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openReplyDialog(ticket.id)}
                                title="Responder"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                              {ticket.status !== "resolved" && ticket.status !== "closed" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleResolve(ticket.id)}
                                  title="Resolver"
                                >
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              {ticket.status !== "closed" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleClose(ticket.id)}
                                  title="Fechar"
                                >
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              )}
                            </div>
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

        {/* Reply Dialog */}
        <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Responder Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                placeholder="Digite sua resposta..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleSendReply} disabled={!replyMessage || isReplying}>
                {t.support.sendMessage}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminSupport;
