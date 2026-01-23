import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseAvatarUploadReturn {
  uploading: boolean;
  uploadAvatar: (file: File, userId: string) => Promise<string | null>;
  deleteAvatar: (userId: string, avatarUrl: string) => Promise<boolean>;
}

export const useAvatarUpload = (): UseAvatarUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    try {
      setUploading(true);

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload an image file.",
        });
        return null;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
        });
        return null;
      }

      // Create unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", userId);

      if (updateError) {
        throw updateError;
      }

      return publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async (userId: string, avatarUrl: string): Promise<boolean> => {
    try {
      // Extract file path from URL
      const urlParts = avatarUrl.split("/avatars/");
      if (urlParts.length < 2) return false;

      const filePath = urlParts[1];

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from("avatars")
        .remove([filePath]);

      if (deleteError) {
        throw deleteError;
      }

      // Update profile to remove avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("user_id", userId);

      if (updateError) {
        throw updateError;
      }

      return true;
    } catch (error) {
      console.error("Error deleting avatar:", error);
      return false;
    }
  };

  return { uploading, uploadAvatar, deleteAvatar };
};
