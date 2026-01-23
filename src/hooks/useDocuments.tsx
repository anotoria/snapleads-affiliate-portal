import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Document {
  id: string;
  user_id: string;
  name: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  category: "contract" | "report" | "invoice" | "other";
  uploaded_by: string;
  is_public: boolean;
  created_at: string;
}

export const useDocuments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["documents", user?.id],
    queryFn: async (): Promise<Document[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching documents:", error);
        throw error;
      }

      return (data as Document[]) || [];
    },
    enabled: !!user,
  });
};

export const useDocumentsByCategory = (category: Document["category"] | null) => {
  const { data: documents, isLoading } = useDocuments();

  if (isLoading || !documents) {
    return { documents: [], isLoading: true };
  }

  const filtered = category
    ? documents.filter((doc) => doc.category === category)
    : documents;

  return { documents: filtered, isLoading: false };
};

export const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return "N/A";
  
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getFileIcon = (fileType: string): string => {
  const type = fileType.toLowerCase();
  if (type === "pdf") return "file-text";
  if (["doc", "docx"].includes(type)) return "file-text";
  if (["xls", "xlsx"].includes(type)) return "file-spreadsheet";
  if (["png", "jpg", "jpeg", "gif"].includes(type)) return "image";
  return "file";
};
