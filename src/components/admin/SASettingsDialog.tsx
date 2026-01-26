import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSACommissionSettings } from "@/hooks/useSACommissionSettings";
import { Settings } from "lucide-react";

interface SASettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SASettingsDialog = ({ open, onOpenChange }: SASettingsDialogProps) => {
  const { settings, updateSettings, isUpdating } = useSACommissionSettings();
  const [commissionCeiling, setCommissionCeiling] = useState("");
  const [basePlanValue, setBasePlanValue] = useState("");

  useEffect(() => {
    if (settings) {
      setCommissionCeiling(settings.commission_ceiling.toString());
      setBasePlanValue(settings.base_plan_value.toString());
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ceiling = parseFloat(commissionCeiling);
    const planValue = parseFloat(basePlanValue);

    if (isNaN(ceiling) || ceiling <= 0 || ceiling > 100) {
      return;
    }

    if (isNaN(planValue) || planValue <= 0) {
      return;
    }

    updateSettings({
      commission_ceiling: ceiling,
      base_plan_value: planValue,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Comissão SA
          </DialogTitle>
          <DialogDescription>
            Ajuste o teto de comissão e o valor base do plano para o cálculo das comissões do Super Administrador.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="commissionCeiling">Teto de Comissão (%)</Label>
              <Input
                id="commissionCeiling"
                type="number"
                min="1"
                max="100"
                step="0.1"
                value={commissionCeiling}
                onChange={(e) => setCommissionCeiling(e.target.value)}
                placeholder="45"
              />
              <p className="text-xs text-muted-foreground">
                Porcentagem máxima total de comissão (Afiliado + SA). Padrão: 45%
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="basePlanValue">Valor Base do Plano (R$)</Label>
              <Input
                id="basePlanValue"
                type="number"
                min="1"
                step="0.01"
                value={basePlanValue}
                onChange={(e) => setBasePlanValue(e.target.value)}
                placeholder="2500"
              />
              <p className="text-xs text-muted-foreground">
                Valor mensal do plano por cliente para cálculo de comissões. Padrão: R$ 2.500,00
              </p>
            </div>

            {/* Preview */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm font-medium mb-2">Exemplo de Cálculo:</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Afiliado com 20% de comissão</p>
                <p>• SA recebe: {commissionCeiling || 45}% - 20% = {(parseFloat(commissionCeiling) || 45) - 20}%</p>
                <p>• Por cliente: R$ {((parseFloat(basePlanValue) || 2500) * ((parseFloat(commissionCeiling) || 45) - 20) / 100).toFixed(2)}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
