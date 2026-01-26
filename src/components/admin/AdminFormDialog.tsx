import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useLanguage } from "@/hooks/useLanguage";
import { Loader2 } from "lucide-react";
import type { AffiliateWithStats } from "@/hooks/useAdminAffiliates";

const adminFormSchema = z.object({
  userId: z.string().min(1, "Selecione um afiliado"),
  role: z.enum(["admin", "super_admin"]),
});

type AdminFormValues = z.infer<typeof adminFormSchema>;

interface AdminFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableAffiliates: AffiliateWithStats[];
  onSubmit: (data: { userId: string; role: "admin" | "super_admin" }) => void;
  isSubmitting?: boolean;
  mode: "add" | "edit";
  editData?: {
    roleId: string;
    userId: string;
    role: "admin" | "super_admin";
  } | null;
  onUpdateRole?: (data: { roleId: string; newRole: "admin" | "super_admin" }) => void;
}

export const AdminFormDialog = ({
  open,
  onOpenChange,
  availableAffiliates,
  onSubmit,
  isSubmitting,
  mode,
  editData,
  onUpdateRole,
}: AdminFormDialogProps) => {
  const { t } = useLanguage();

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      userId: "",
      role: "admin",
    },
  });

  useEffect(() => {
    if (mode === "edit" && editData) {
      form.reset({
        userId: editData.userId,
        role: editData.role,
      });
    } else {
      form.reset({
        userId: "",
        role: "admin",
      });
    }
  }, [mode, editData, form, open]);

  const handleSubmit = (values: AdminFormValues) => {
    if (mode === "edit" && editData && onUpdateRole) {
      onUpdateRole({ roleId: editData.roleId, newRole: values.role });
    } else {
      onSubmit({ userId: values.userId, role: values.role });
    }
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar Administrador" : t.admin.addAdmin}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {mode === "add" && (
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selecione o Afiliado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha um afiliado..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableAffiliates.map((affiliate) => (
                          <SelectItem key={affiliate.user_id} value={affiliate.user_id}>
                            {affiliate.full_name || affiliate.company_name || "Sem nome"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.admin.role}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">{t.admin.adminRole}</SelectItem>
                      <SelectItem value="super_admin">{t.admin.superAdmin}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "edit" ? t.common.save : t.common.add}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
