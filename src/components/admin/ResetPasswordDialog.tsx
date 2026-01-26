import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Copy, Check, AlertCircle, KeyRound } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  affiliateName: string;
  affiliateEmail: string;
  userId: string;
}

export const ResetPasswordDialog = ({
  open,
  onOpenChange,
  affiliateName,
  affiliateEmail,
  userId,
}: ResetPasswordDialogProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async () => {
    setIsResetting(true);
    setError(null);
    setNewPassword(null);

    try {
      const { data, error } = await supabase.functions.invoke("admin-reset-password", {
        body: { userId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setNewPassword(data.temporaryPassword);
      toast({
        title: "Senha resetada",
        description: "Uma nova senha temporária foi gerada.",
      });
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.message || "Erro ao resetar senha");
      toast({
        title: "Erro",
        description: err.message || "Não foi possível resetar a senha",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const copyPassword = async () => {
    if (newPassword) {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setNewPassword(null);
    setError(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            {t.admin.resetPassword}
          </DialogTitle>
          <DialogDescription>
            Gerar uma nova senha temporária para o afiliado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="font-medium">{affiliateName || "Sem nome"}</p>
            <p className="text-sm text-muted-foreground">{affiliateEmail}</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {newPassword ? (
            <div className="space-y-2">
              <Label>Nova Senha Temporária</Label>
              <div className="flex gap-2">
                <Input
                  value={newPassword}
                  readOnly
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyPassword}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                O usuário deverá alterar a senha no próximo login.
              </p>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t.admin.confirmResetPassword}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {newPassword ? "Fechar" : t.common.cancel}
          </Button>
          {!newPassword && (
            <Button onClick={handleResetPassword} disabled={isResetting}>
              {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gerar Nova Senha
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
