import { useState } from "react";
import { User, Camera, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export const ProfileSettings = () => {
  const { profile, user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      toast({
        title: t.settings.profileUpdated,
        description: t.settings.profileUpdatedDescription,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: t.settings.updateFailed,
        description: t.settings.updateFailedDescription,
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <Card className="border-border/50 shadow-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>{t.settings.profileSettings}</CardTitle>
            <CardDescription>{t.settings.profileDescription}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-brand-gradient text-primary-foreground text-xl font-semibold">
                {getInitials(profile?.full_name)}
              </AvatarFallback>
            </Avatar>
            <button
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
              title={t.settings.changeAvatar}
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <p className="font-medium text-foreground">{profile?.full_name || "User"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        
        {/* Form Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">{t.settings.fullName}</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t.settings.fullName}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">{t.settings.email}</Label>
            <Input
              id="email"
              value={user?.email || ""}
              disabled
              className="bg-muted"
            />
          </div>
          
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="affiliateCode">{t.settings.affiliateCode}</Label>
            <Input
              id="affiliateCode"
              value={profile?.affiliate_code || ""}
              disabled
              className="bg-muted font-mono"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-brand-gradient hover:opacity-90"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.settings.saving}
              </>
            ) : (
              t.settings.saveChanges
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
