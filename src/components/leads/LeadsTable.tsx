import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LeadStatus = "pending" | "converted" | "expired";

interface Lead {
  id: string;
  name: string;
  email: string;
  status: LeadStatus;
  date: string;
  commission: number;
}

// Mock data for leads
const generateMockLeads = (): Lead[] => {
  const names = [
    "John Smith", "Maria Garcia", "James Wilson", "Emma Johnson", "Michael Brown",
    "Sofia Martinez", "David Lee", "Isabella Anderson", "Daniel Taylor", "Olivia Thomas"
  ];
  
  const statuses: LeadStatus[] = ["pending", "converted", "expired"];
  const leads: Lead[] = [];
  
  for (let i = 0; i < 25; i++) {
    const name = names[Math.floor(Math.random() * names.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60));
    
    leads.push({
      id: `lead-${i + 1}`,
      name: `${name} ${i + 1}`,
      email: `${name.toLowerCase().replace(" ", ".")}${i + 1}@email.com`,
      status,
      date: date.toISOString().split("T")[0],
      commission: status === "converted" ? Math.floor(Math.random() * 100) + 20 : 0,
    });
  }
  
  return leads.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const ITEMS_PER_PAGE = 10;

export const LeadsTable = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  const allLeads = useMemo(() => generateMockLeads(), []);
  
  const filteredLeads = useMemo(() => {
    return allLeads.filter((lead) => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allLeads, searchQuery, statusFilter]);
  
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const getStatusBadge = (status: LeadStatus) => {
    const variants: Record<LeadStatus, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      pending: { variant: "secondary", label: t.leads.pending },
      converted: { variant: "default", label: t.leads.converted },
      expired: { variant: "destructive", label: t.leads.expired },
    };
    
    return (
      <Badge variant={variants[status].variant} className="font-medium">
        {variants[status].label}
      </Badge>
    );
  };
  
  const totalCommission = filteredLeads.reduce((sum, lead) => sum + lead.commission, 0);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
    >
      <Card className="border-border/50 shadow-card">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Users className="h-5 w-5 text-primary" />
              </motion.div>
              <CardTitle className="text-base sm:text-lg">{t.leads.management}</CardTitle>
            </div>
            
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t.leads.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 w-full"
                />
              </div>
              
              <Select 
                value={statusFilter} 
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t.leads.filterByStatus} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.leads.allStatuses}</SelectItem>
                  <SelectItem value="pending">{t.leads.pending}</SelectItem>
                  <SelectItem value="converted">{t.leads.converted}</SelectItem>
                  <SelectItem value="expired">{t.leads.expired}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6">
          {paginatedLeads.length === 0 ? (
            <div className="flex min-h-[200px] sm:min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-accent/30">
              <div className="text-center px-4">
                <Users className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
                <p className="mt-4 text-base sm:text-lg font-medium text-muted-foreground">
                  {t.leads.noLeads}
                </p>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground/70">
                  {t.leads.noLeadsDescription}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Cards View */}
              <div className="block sm:hidden space-y-3">
                {paginatedLeads.map((lead, index) => (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-lg border border-border bg-card p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{lead.name}</p>
                      {getStatusBadge(lead.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{lead.email}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{lead.date}</span>
                      <span className="font-medium">
                        {lead.commission > 0 ? `$${lead.commission.toFixed(2)}` : "-"}
                      </span>
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
                        <TableHead className="font-semibold">{t.leads.name}</TableHead>
                        <TableHead className="font-semibold">{t.leads.email}</TableHead>
                        <TableHead className="font-semibold">{t.leads.status}</TableHead>
                        <TableHead className="font-semibold">{t.leads.date}</TableHead>
                        <TableHead className="font-semibold text-right">{t.leads.commission}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLeads.map((lead, index) => (
                        <motion.tr
                          key={lead.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-accent/30 border-b border-border last:border-0"
                        >
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell className="text-muted-foreground">{lead.email}</TableCell>
                          <TableCell>{getStatusBadge(lead.status)}</TableCell>
                          <TableCell className="text-muted-foreground">{lead.date}</TableCell>
                          <TableCell className="text-right font-medium">
                            {lead.commission > 0 ? `$${lead.commission.toFixed(2)}` : "-"}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                  {t.leads.total}: {filteredLeads.length} leads · ${totalCommission.toFixed(2)} {t.leads.commission.toLowerCase()}
                </p>
                
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    {t.leads.page} {currentPage} {t.leads.of} {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
