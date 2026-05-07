import { useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/hooks/useLanguage";
import { Loader2 } from "lucide-react";
import type { AffiliateWithStats } from "@/hooks/useAdminAffiliates";

import { useAdminRoles } from "@/hooks/useAdminRoles";

const NO_MANAGER = "__none__";

const affiliateFormSchema = z.object({
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  company_name: z.string().optional(),
  phone: z.string().optional(),
  cnpj: z.string().optional(),
  tier_level: z.string(),
  is_active: z.boolean(),
  managed_by: z.string().nullable().optional(),
});

type AffiliateFormValues = z.infer<typeof affiliateFormSchema>;

interface Tier {
  id: string;
  name: string;
  display_name: string;
}

interface AffiliateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  affiliate: AffiliateWithStats | null;
  tiers: Tier[];
  onSubmit: (userId: string, updates: Partial<AffiliateFormValues>) => void;
  isSubmitting?: boolean;
}

export const AffiliateFormDialog = ({
  open,
  onOpenChange,
  affiliate,
  tiers,
  onSubmit,
  isSubmitting,
}: AffiliateFormDialogProps) => {
  const { t } = useLanguage();
  const { admins } = useAdminRoles();

  const form = useForm<AffiliateFormValues>({
    resolver: zodResolver(affiliateFormSchema),
    defaultValues: {
      full_name: "",
      company_name: "",
      phone: "",
      cnpj: "",
      tier_level: "silver",
      is_active: true,
      managed_by: null,
    },
  });

  useEffect(() => {
    if (affiliate) {
      form.reset({
        full_name: affiliate.full_name || "",
        company_name: affiliate.company_name || "",
        phone: affiliate.phone || "",
        cnpj: affiliate.cnpj || "",
        tier_level: affiliate.tier_level,
        is_active: affiliate.is_active,
        managed_by: affiliate.managed_by ?? null,
      });
    }
  }, [affiliate, form, open]);

  const handleSubmit = (values: AffiliateFormValues) => {
    if (affiliate) {
      onSubmit(affiliate.user_id, {
        ...values,
        managed_by: values.managed_by === NO_MANAGER ? null : values.managed_by ?? null,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.admin.editUser}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do afiliado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000/0000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tier_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.admin.tier}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tiers.map((tier) => (
                        <SelectItem key={tier.id} value={tier.name}>
                          {tier.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="managed_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gestor Responsável</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v === NO_MANAGER ? null : v)}
                    value={field.value ?? NO_MANAGER}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um gestor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_MANAGER}>— Sem gestor</SelectItem>
                      {admins.map((admin) => (
                        <SelectItem key={admin.user_id} value={admin.user_id}>
                          {admin.full_name || "Sem nome"} ({admin.role === "super_admin" ? "Super Admin" : "Admin"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel className="text-base">Status da Conta</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {field.value ? "Conta ativa" : "Conta inativa"}
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.common.save}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
