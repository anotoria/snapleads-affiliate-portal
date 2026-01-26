
# Plano: Sistema de Comissionamento do Super Administrador

## Visao Geral

Implementar um sistema de comissionamento para o Super Administrador (SA) onde o SA recebe a diferenca entre o teto de 45% e a porcentagem de comissao do afiliado. Este modelo garante que cada venda gere exatamente 45% de comissao total, dividida entre afiliado e SA.

---

## Regra de Negocio

```text
Teto de Comissao = 45%
Valor Base do Plano = R$ 2.500,00 (configuravel)

Comissao do Afiliado = % definido no plano dele
Comissao do SA = 45% - % do Afiliado

Exemplo:
- Afiliado Plano 1 (20%): SA ganha 25%
- Afiliado Plano 2 (25%): SA ganha 20%
- Afiliado Plano 3 (30%): SA ganha 15%
- Afiliado VIP (40%): SA ganha 5%
```

---

## Alteracoes no Banco de Dados

### Nova Tabela: sa_commission_history

Armazenar o historico de comissoes do Super Administrador, calculadas automaticamente com base nas comissoes dos afiliados.

```sql
CREATE TABLE public.sa_commission_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sa_user_id UUID NOT NULL,
  affiliate_user_id UUID NOT NULL,
  reference_month TEXT NOT NULL,
  affiliate_name TEXT,
  affiliate_tier TEXT NOT NULL,
  affiliate_commission_rate NUMERIC NOT NULL,
  sa_commission_rate NUMERIC NOT NULL,
  client_count INTEGER NOT NULL DEFAULT 0,
  base_value_per_client NUMERIC NOT NULL DEFAULT 2500,
  affiliate_commission_value NUMERIC NOT NULL DEFAULT 0,
  sa_commission_value NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
CREATE POLICY "Super admins can view all SA commissions"
  ON public.sa_commission_history FOR SELECT
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can insert SA commissions"
  ON public.sa_commission_history FOR INSERT
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update SA commissions"
  ON public.sa_commission_history FOR UPDATE
  USING (is_super_admin(auth.uid()));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sa_commission_history;
```

### Nova Tabela: sa_commission_settings

Configuracoes globais do sistema de comissao SA (teto, valor base do plano).

```sql
CREATE TABLE public.sa_commission_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_ceiling NUMERIC NOT NULL DEFAULT 45,
  base_plan_value NUMERIC NOT NULL DEFAULT 2500,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.sa_commission_settings (commission_ceiling, base_plan_value)
VALUES (45, 2500);

-- RLS Policies
CREATE POLICY "Super admins can view SA settings"
  ON public.sa_commission_settings FOR SELECT
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update SA settings"
  ON public.sa_commission_settings FOR UPDATE
  USING (is_super_admin(auth.uid()));
```

---

## Novos Arquivos a Criar

### Hooks

```text
src/hooks/useSACommissions.tsx       # Hook para gerenciar comissoes do SA
src/hooks/useSACommissionSettings.tsx # Hook para configuracoes do SA
```

### Componentes

```text
src/components/admin/SACommissionCard.tsx        # Card resumo de comissoes SA
src/components/admin/SACommissionTable.tsx       # Tabela detalhada por afiliado
src/components/admin/SACommissionCharts.tsx      # Graficos de evolucao
src/components/admin/SASettingsDialog.tsx        # Dialog para config (teto, valor base)
```

### Nova Pagina

```text
src/pages/admin/AdminSACommissions.tsx  # Pagina completa de comissoes do SA
```

---

## Funcionalidades da Pagina AdminSACommissions

### Secao 1: Cards de Resumo

- Total de Comissao SA (mes atual)
- Total de Comissao SA (acumulado)
- Quantidade de Afiliados Ativos
- Media de Comissao SA por Afiliado

### Secao 2: Tabela Detalhada por Afiliado

Colunas:
- Afiliado (nome/empresa)
- Plano/Tier
- % Comissao Afiliado
- % Comissao SA
- Clientes Ativos
- Comissao Afiliado (total)
- Comissao SA (total)
- Status

### Secao 3: Grafico de Evolucao

- Linha temporal mostrando comissao SA por mes
- Comparativo com comissao total dos afiliados

### Secao 4: Configuracoes

- Botao para ajustar teto de comissao (padrao 45%)
- Botao para ajustar valor base do plano (padrao R$ 2.500)

---

## Logica de Calculo (Hook useSACommissions)

```typescript
interface AffiliateCommissionBreakdown {
  affiliateId: string;
  affiliateName: string;
  affiliateTier: string;
  affiliateCommissionRate: number;  // e.g., 20
  saCommissionRate: number;         // e.g., 25 (45 - 20)
  activeClients: number;
  baseValuePerClient: number;       // R$ 2.500
  affiliateCommissionTotal: number; // R$ 500 × clients
  saCommissionTotal: number;        // R$ 625 × clients
}

// Calculo para cada afiliado:
const saCommissionRate = settings.commissionCeiling - affiliateTier.commissionPercentage;
const saCommissionPerClient = settings.basePlanValue * (saCommissionRate / 100);
const saCommissionTotal = saCommissionPerClient * activeClientsCount;
```

---

## Integracao no AdminDashboard

Adicionar um card "Comissao do SA" no dashboard administrativo com:
- Total de comissao SA do mes
- Link para pagina completa

---

## Rota e Navegacao

### App.tsx

```text
/admin/sa-commissions -> AdminSACommissions
```

### AdminSidebar

Adicionar item de menu "Comissoes SA" (visivel apenas para super_admin)

---

## Fluxo de Dados

```text
1. Buscar todos os afiliados ativos (profiles)
2. Para cada afiliado:
   a. Buscar tier (tiers table)
   b. Contar leads ativos (leads table)
   c. Calcular: SA% = 45% - Afiliado%
   d. Calcular: SA$ = R$2.500 × SA% × qtd_clientes
3. Agregar totais
4. Exibir na interface
```

---

## Secao Tecnica

### Hook useSACommissions

```typescript
export const useSACommissions = () => {
  const { isSuperAdmin } = useAdminAccess();
  
  return useQuery({
    queryKey: ["sa-commissions"],
    queryFn: async () => {
      // 1. Get SA commission settings
      const { data: settings } = await supabase
        .from("sa_commission_settings")
        .select("*")
        .single();
      
      // 2. Get all active affiliates with their tiers
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, company_name, tier_level, is_active")
        .eq("is_active", true);
      
      // 3. Get tiers for commission rates
      const { data: tiers } = await supabase
        .from("tiers")
        .select("name, commission_percentage");
      
      // 4. Get active leads count per user
      const { data: leads } = await supabase
        .from("leads")
        .select("user_id, id")
        .eq("status", "active");
      
      // 5. Calculate SA commission for each affiliate
      const breakdown = profiles.map(profile => {
        const tier = tiers.find(t => t.name === profile.tier_level);
        const affiliateRate = tier?.commission_percentage || 0;
        const saRate = settings.commission_ceiling - affiliateRate;
        const clientCount = leads.filter(l => l.user_id === profile.user_id).length;
        
        return {
          affiliateId: profile.user_id,
          affiliateName: profile.full_name || profile.company_name,
          affiliateTier: profile.tier_level,
          affiliateCommissionRate: affiliateRate,
          saCommissionRate: saRate,
          activeClients: clientCount,
          baseValuePerClient: settings.base_plan_value,
          affiliateCommissionTotal: settings.base_plan_value * (affiliateRate / 100) * clientCount,
          saCommissionTotal: settings.base_plan_value * (saRate / 100) * clientCount,
        };
      });
      
      return {
        settings,
        breakdown,
        totals: {
          totalAffiliates: breakdown.length,
          totalClients: breakdown.reduce((sum, b) => sum + b.activeClients, 0),
          totalAffiliateCommission: breakdown.reduce((sum, b) => sum + b.affiliateCommissionTotal, 0),
          totalSACommission: breakdown.reduce((sum, b) => sum + b.saCommissionTotal, 0),
        }
      };
    },
    enabled: isSuperAdmin,
  });
};
```

### Componente SACommissionTable

```typescript
// Tabela com dados de cada afiliado
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Afiliado</TableHead>
      <TableHead>Plano</TableHead>
      <TableHead>% Afiliado</TableHead>
      <TableHead>% SA</TableHead>
      <TableHead>Clientes</TableHead>
      <TableHead>Comissao Afiliado</TableHead>
      <TableHead>Comissao SA</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {breakdown.map(item => (
      <TableRow key={item.affiliateId}>
        <TableCell>{item.affiliateName}</TableCell>
        <TableCell>{item.affiliateTier}</TableCell>
        <TableCell>{item.affiliateCommissionRate}%</TableCell>
        <TableCell>{item.saCommissionRate}%</TableCell>
        <TableCell>{item.activeClients}</TableCell>
        <TableCell>{formatCurrency(item.affiliateCommissionTotal)}</TableCell>
        <TableCell>{formatCurrency(item.saCommissionTotal)}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## Traducoes a Adicionar

```typescript
admin: {
  // ... existing
  saCommissions: "Comissoes SA",
  saCommissionsSubtitle: "Comissionamento do Super Administrador",
  commissionCeiling: "Teto de Comissao",
  basePlanValue: "Valor Base do Plano",
  affiliateRate: "% Afiliado",
  saRate: "% SA",
  totalSACommission: "Total Comissao SA",
  settings: "Configuracoes",
}
```

---

## Ordem de Implementacao

1. **Migration SQL** - Criar tabelas sa_commission_history e sa_commission_settings
2. **useSACommissionSettings** - Hook para configuracoes
3. **useSACommissions** - Hook para calculos e dados
4. **SACommissionCard** - Cards de resumo
5. **SACommissionTable** - Tabela detalhada
6. **SACommissionCharts** - Graficos de evolucao
7. **SASettingsDialog** - Dialog de configuracao
8. **AdminSACommissions** - Pagina completa
9. **AdminSidebar** - Adicionar menu item
10. **App.tsx** - Adicionar rota
11. **AdminDashboard** - Adicionar card resumo

---

## Consideracoes Importantes

1. **Acesso Restrito**: Apenas Super Admins podem ver as comissoes SA
2. **Valor Configuravel**: O teto (45%) e valor base (R$ 2.500) sao configuraveis
3. **Calculo em Tempo Real**: Os valores sao calculados dinamicamente
4. **Historico**: Opcional - salvar snapshots mensais para auditoria
5. **Integracao Futura**: Pode ser integrado com o webhook n8n para calculos automatizados
