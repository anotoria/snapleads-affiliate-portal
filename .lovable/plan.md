
# Plano: Atualizar Simulador de Comissões com Cálculo Baseado em Leads

## Resumo
Modificar o Simulador de Comissões para calcular automaticamente o faturamento baseado na quantidade de leads, usando o valor base por lead (R$ 2.500) e os níveis de parceria cadastrados na tabela de tiers.

## Alterações no Formulário

### Campos do Simulador
1. **Qtde de Leads** - Campo editável onde o usuário informa a quantidade de leads
2. **Faturamento Mensal (R$)** - Campo somente leitura, calculado automaticamente (Qtde Leads × R$ 2.500)

### Resultados Exibidos
- Faturamento Total (Leads × Valor Base)
- Faixa/Nível do Afiliado (Silver, Gold, Platinum, Diamond)
- Comissão que o afiliado ganharia (Faturamento × % da faixa)
- Bônus do nível (se aplicável)
- Total (Comissão + Bônus)

## Layout Visual Proposto

```text
┌─────────────────────────────────────────────────────────────────┐
│  🧮 Simulador de Comissões                                      │
│  Simule seus ganhos baseado na quantidade de leads              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Qtde de Leads:          [    25    ]                           │
│                                                                 │
│  Faturamento Mensal:     R$ 62.500,00   (bloqueado)             │
│  (calculado: 25 × R$ 2.500)                                     │
│                                                                 │
│  [ Calcular Comissão ]                                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  📊 RESULTADO                                                   │
│                                                                 │
│  Faixa de Parceria:      Platinum (30% comissão)                │
│                                                                 │
│  💰 Faturamento Total:   R$ 62.500,00                           │
│  📈 Comissão Estimada:   R$ 18.750,00                           │
│  🎁 Bônus do Nível:      R$ 0,00                                │
│  ─────────────────────────────────────────────────────────────  │
│  ✅ TOTAL:               R$ 18.750,00                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Lógica de Cálculo

1. **Faturamento = Qtde Leads × R$ 2.500** (valor base por lead)
2. **Determinar Faixa**: Baseado no `client_count` de cada tier
   - Silver: até 5 leads (20%)
   - Gold: 5-20 leads (25%)
   - Platinum: 20-30 leads (30%)
   - Diamond: 30-40+ leads (40%)
3. **Comissão = Faturamento × (% da Faixa / 100)**
4. **Total = Comissão + Bônus do Nível**

---

## Detalhes Técnicos

### Arquivo: `src/pages/Commissions.tsx`

**Mudanças:**
1. Substituir estado `simulatorRevenue` por `simulatorLeads`
2. Adicionar cálculo automático de faturamento usando `BASE_VALUE_PER_LEAD = 2500`
3. Determinar faixa baseada em `client_count` dos tiers (usando `sort_order`)
4. Atualizar campos do formulário:
   - Input editável para quantidade de leads
   - Input bloqueado (disabled) para faturamento calculado
5. Expandir resultado para mostrar faturamento total e faixa detalhada

**Novo Estado:**
```typescript
const [simulatorLeads, setSimulatorLeads] = useState("");
const [simulatorResult, setSimulatorResult] = useState<{
  tier: string;
  tierColor: string;
  commissionRate: number;
  revenue: number;
  commission: number;
  bonus: number;
  total: number;
} | null>(null);
```

**Nova Lógica de Cálculo:**
```typescript
const BASE_VALUE_PER_LEAD = 2500;

const handleCalculate = () => {
  const leadsCount = parseInt(simulatorLeads) || 0;
  if (!tiers || leadsCount <= 0) return;

  const revenue = leadsCount * BASE_VALUE_PER_LEAD;

  // Encontrar tier baseado em client_count (ordenado por sort_order)
  let selectedTier = tiers[0];
  for (let i = 0; i < tiers.length; i++) {
    const prevCount = i > 0 ? tiers[i - 1].client_count : 0;
    const currCount = tiers[i].client_count;
    if (leadsCount >= prevCount && leadsCount < currCount) {
      selectedTier = tiers[i];
      break;
    }
    if (leadsCount >= currCount) {
      selectedTier = tiers[i];
    }
  }

  const commission = revenue * (selectedTier.commission_percentage / 100);
  setSimulatorResult({
    tier: selectedTier.display_name,
    tierColor: selectedTier.color,
    commissionRate: selectedTier.commission_percentage,
    revenue,
    commission,
    bonus: selectedTier.bonus_amount,
    total: commission + selectedTier.bonus_amount,
  });
};
```

### Arquivos Modificados
- `src/pages/Commissions.tsx` - Atualizar o tab do Simulador

### Constantes Utilizadas
- `BASE_VALUE_PER_LEAD = 2500` - Já definida em `useTiers.tsx`, será replicada no componente
