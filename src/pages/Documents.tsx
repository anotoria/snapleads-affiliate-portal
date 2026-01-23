import { FileText, FileSpreadsheet, Image, File, Download, FolderOpen } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/hooks/useLanguage";
import { useDocuments, formatFileSize, Document } from "@/hooks/useDocuments";
import { PageTransition } from "@/components/animations/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const getFileIcon = (fileType: string) => {
  const type = fileType.toLowerCase();
  if (type === "pdf") return FileText;
  if (["doc", "docx"].includes(type)) return FileText;
  if (["xls", "xlsx"].includes(type)) return FileSpreadsheet;
  if (["png", "jpg", "jpeg", "gif"].includes(type)) return Image;
  return File;
};

const getCategoryLabel = (category: Document["category"], t: any) => {
  const labels: Record<string, string> = {
    contract: t.documents.contracts,
    report: t.documents.reports,
    invoice: t.documents.invoices,
    other: t.documents.other,
  };
  return labels[category] || category;
};

const Documents = () => {
  const { t } = useLanguage();
  const { data: documents, isLoading } = useDocuments();

  const categories: (Document["category"] | "all")[] = ["all", "contract", "report", "invoice", "other"];

  const filterDocuments = (category: string) => {
    if (category === "all") return documents || [];
    return documents?.filter((doc) => doc.category === category) || [];
  };

  const DocumentCard = ({ doc }: { doc: Document }) => {
    const FileIcon = getFileIcon(doc.file_type);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <FileIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{doc.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {doc.file_type.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(doc.file_size)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t.documents.uploadedAt}: {format(new Date(doc.created_at), "dd/MM/yyyy")}
              </p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = () => (
    <div className="text-center py-12">
      <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">{t.documents.noDocuments}</h3>
      <p className="text-muted-foreground">{t.documents.noDocumentsDescription}</p>
    </div>
  );

  return (
    <AppLayout>
      <PageTransition>
        <div className="mx-auto max-w-6xl space-y-6 px-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t.documents.title}</h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              {t.documents.subtitle}
            </p>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">{t.documents.allDocuments}</TabsTrigger>
              <TabsTrigger value="contract">{t.documents.contracts}</TabsTrigger>
              <TabsTrigger value="report">{t.documents.reports}</TabsTrigger>
              <TabsTrigger value="invoice">{t.documents.invoices}</TabsTrigger>
              <TabsTrigger value="other">{t.documents.other}</TabsTrigger>
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category}>
                {isLoading ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <Skeleton className="h-16 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filterDocuments(category).length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filterDocuments(category).map((doc) => (
                      <DocumentCard key={doc.id} doc={doc} />
                    ))}
                  </div>
                ) : (
                  <EmptyState />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default Documents;
