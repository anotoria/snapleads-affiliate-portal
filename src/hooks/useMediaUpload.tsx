import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type BucketType = "learning-covers" | "learning-videos" | "media-library" | "media-thumbnails";

interface UploadResult {
  url: string;
  path: string;
  size: number;
}

export const useMediaUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = async (
    file: File,
    bucket: BucketType,
    folder?: string
  ): Promise<UploadResult | null> => {
    try {
      setUploading(true);
      setProgress(0);

      // Validate file size based on bucket
      const maxSizes: Record<BucketType, number> = {
        "learning-covers": 10 * 1024 * 1024, // 10MB
        "learning-videos": 50 * 1024 * 1024, // 50MB
        "media-library": 50 * 1024 * 1024, // 50MB
        "media-thumbnails": 5 * 1024 * 1024, // 5MB
      };

      if (file.size > maxSizes[bucket]) {
        toast({
          title: "Arquivo muito grande",
          description: `O tamanho máximo permitido é ${maxSizes[bucket] / (1024 * 1024)}MB.`,
          variant: "destructive",
        });
        return null;
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setProgress(100);

      return {
        url: urlData.publicUrl,
        path: data.path,
        size: file.size,
      };
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (bucket: BucketType, path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Erro ao deletar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  };

  const uploadMultiple = async (
    files: File[],
    bucket: BucketType,
    folder?: string
  ): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const result = await uploadFile(files[i], bucket, folder);
      if (result) {
        results.push(result);
      }
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    return results;
  };

  return {
    uploadFile,
    uploadMultiple,
    deleteFile,
    uploading,
    progress,
  };
};

// Helper to get image dimensions
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// Helper to get video duration
export const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve(Math.round(video.duration));
    };
    video.onerror = reject;
    video.src = URL.createObjectURL(file);
  });
};
