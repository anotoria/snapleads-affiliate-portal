import { useState } from "react";
import { MessageSquare, Plus, HelpCircle, Send, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/hooks/useLanguage";
import { useSupportTickets, useSupportMessages, useCreateTicket, useAddMessage, SupportTicket } from "@/hooks/useSupportTickets";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition } from "@/components/animations/PageTransition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const Support = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const { data: tickets, isLoading } = useSupportTickets();
  const createTicket = useCreateTicket();
  const addMessage = useAddMessage();

  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    message: "",
    priority: "medium" as SupportTicket["priority"],
    category: "general" as SupportTicket["category"],
  });
  const [newMessage, setNewMessage] = useState("");

  const { data: messages } = useSupportMessages(selectedTicket?.id || null);

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.message) return;
    
    await createTicket.mutateAsync(newTicket);
    setNewTicket({ subject: "", message: "", priority: "medium", category: "general" });
    setIsNewTicketOpen(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    
    await addMessage.mutateAsync({
      ticketId: selectedTicket.id,
      message: newMessage,
    });
    setNewMessage("");
  };

  const getStatusBadge = (status: SupportTicket["status"]) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
      open: { variant: "default", icon: AlertCircle },
      in_progress: { variant: "secondary", icon: Clock },
      waiting_user: { variant: "outline", icon: MessageSquare },
      resolved: { variant: "default", icon: CheckCircle },
      closed: { variant: "secondary", icon: CheckCircle },
    };
    const { variant, icon: Icon } = config[status] || { variant: "secondary", icon: MessageSquare };
    const labels: Record<string, string> = {
      open: t.support.open,
      in_progress: t.support.inProgress,
      waiting_user: t.support.waitingUser,
      resolved: t.support.resolved,
      closed: t.support.closed,
    };
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: SupportTicket["priority"]) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      low: "secondary",
      medium: "outline",
      high: "default",
      urgent: "destructive",
    };
    const labels: Record<string, string> = {
      low: t.support.low,
      medium: t.support.medium,
      high: t.support.high,
      urgent: t.support.urgent,
    };
    return <Badge variant={variants[priority]}>{labels[priority]}</Badge>;
  };

  const faqItems = [
    {
      question: "Como funciona o sistema de comissões?",
      answer: "Você recebe uma porcentagem sobre o faturamento mensal dos clientes que indicar. A porcentagem varia de 8% a 18% dependendo do seu nível de parceria."
    },
    {
      question: "Quando recebo meus pagamentos?",
      answer: "Os pagamentos são processados mensalmente, sempre no dia 15 do mês seguinte ao período de referência."
    },
    {
      question: "Como subo de nível?",
      answer: "Seu nível é calculado automaticamente com base no faturamento total dos seus clientes ativos. Quanto maior o faturamento, maior seu nível e porcentagem de comissão."
    },
  ];

  return (
    <AppLayout>
      <PageTransition>
        <div className="mx-auto max-w-6xl space-y-6 px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t.support.title}</h1>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                {t.support.subtitle}
              </p>
            </div>
            <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t.support.newTicket}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.support.newTicket}</DialogTitle>
                  <DialogDescription>
                    Preencha os detalhes do seu ticket de suporte.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">{t.support.subject}</Label>
                    <Input
                      id="subject"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t.support.category}</Label>
                      <Select
                        value={newTicket.category}
                        onValueChange={(value: SupportTicket["category"]) => 
                          setNewTicket({ ...newTicket, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="billing">{t.support.billing}</SelectItem>
                          <SelectItem value="technical">{t.support.technical}</SelectItem>
                          <SelectItem value="general">{t.support.general}</SelectItem>
                          <SelectItem value="other">{t.support.otherCategory}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t.support.priority}</Label>
                      <Select
                        value={newTicket.priority}
                        onValueChange={(value: SupportTicket["priority"]) => 
                          setNewTicket({ ...newTicket, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">{t.support.low}</SelectItem>
                          <SelectItem value="medium">{t.support.medium}</SelectItem>
                          <SelectItem value="high">{t.support.high}</SelectItem>
                          <SelectItem value="urgent">{t.support.urgent}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{t.support.message}</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      value={newTicket.message}
                      onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                    />
                  </div>
                  <Button 
                    onClick={handleCreateTicket} 
                    className="w-full"
                    disabled={createTicket.isPending}
                  >
                    {t.support.createTicket}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="tickets" className="space-y-4">
            <TabsList>
              <TabsTrigger value="tickets" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                {t.support.myTickets}
              </TabsTrigger>
              <TabsTrigger value="faq" className="gap-2">
                <HelpCircle className="h-4 w-4" />
                {t.support.faq}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tickets">
              <div className="grid gap-4 lg:grid-cols-3">
                {/* Tickets List */}
                <div className="lg:col-span-1 space-y-2">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <Skeleton className="h-16 w-full" />
                        </CardContent>
                      </Card>
                    ))
                  ) : tickets && tickets.length > 0 ? (
                    tickets.map((ticket) => (
                      <Card 
                        key={ticket.id}
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedTicket?.id === ticket.id ? "border-primary" : ""
                        }`}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                              <h4 className="font-medium truncate">{ticket.subject}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {profile?.full_name && <span>{profile.full_name} • </span>}
                                {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm")}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(ticket.status)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">{t.support.noTickets}</h3>
                        <p className="text-muted-foreground text-sm">{t.support.noTicketsDescription}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Ticket Detail */}
                <div className="lg:col-span-2">
                  {selectedTicket ? (
                    <Card className="h-[600px] flex flex-col">
                      <CardHeader className="border-b">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{selectedTicket.subject}</CardTitle>
                            <CardDescription>
                              Criado em {format(new Date(selectedTicket.created_at), "dd/MM/yyyy 'às' HH:mm")}
                              {profile?.full_name && <span className="block">por {profile.full_name}</span>}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(selectedTicket.status)}
                            {getPriorityBadge(selectedTicket.priority)}
                          </div>
                        </div>
                      </CardHeader>
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                          {/* Initial message */}
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm">{selectedTicket.message}</p>
                          </div>
                          
                          {/* Messages */}
                          {messages?.map((msg) => (
                            <div 
                              key={msg.id}
                              className={`p-4 rounded-lg ${
                                msg.is_admin_reply 
                                  ? "bg-primary/10 ml-8" 
                                  : "bg-muted mr-8"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium">
                                  {msg.is_admin_reply ? "Suporte" : "Você"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(msg.created_at), "dd/MM/yyyy HH:mm")}
                                </span>
                              </div>
                              <p className="text-sm">{msg.message}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      {selectedTicket.status !== "closed" && selectedTicket.status !== "resolved" && (
                        <div className="border-t p-4">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Digite sua mensagem..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            />
                            <Button 
                              onClick={handleSendMessage}
                              disabled={addMessage.isPending}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ) : (
                    <Card className="h-[600px] flex items-center justify-center">
                      <div className="text-center">
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          Selecione um ticket para ver os detalhes
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="faq">
              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-primary" />
                        {item.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{item.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default Support;
