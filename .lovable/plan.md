
# Plano: Corrigir Progresso de Nível com Contagem de Leads e Faturamento

## Problema Identificado
O card de Progresso de Nível está mostrando R$ 0,00 mesmo o afiliado tendo 6 leads ativos. Isso ocorre porque:

1. O cálculo atual usa `monthlyRevenue` dos leads, que depende do campo `monthly_value` de cada lead
2. Os níveis (tiers) agora são baseados em `client_count` (quantidade de clientes)
3. A estrutura atual dos tiers:
   - **Silver**: 0-5 clientes (R$ 0 - R$ 12.500)
   - **Gold**: 5-20 clientes (R$ 12.500,01 - R$ 50.000)
   - **Platinum**: 20-30 clientes (R$ 50.000,01 - R$ 75.000)
   - **Diamond**: 30-40 clientes (R$ 75.000,01 - R$ 100.000)

## Solução Proposta
Atualizar o sistema de progresso para calcular baseado na **quantidade de leads ativos** e exibir ambas as métricas (quantidade e valor).

### Alterações Necessárias

#### 1. Atualizar Hook `useTiers.tsx`
Modificar `useUserTierProgress` para:
- Receber a quantidade de leads ativos como parâmetro principal
- Usar `client_count` dos tiers para determinar nível atual e próximo
- Calcular o progresso baseado na quantidade de leads
- Retornar informações sobre faturamento calculado (leads * R$ 2.500)

#### 2. Atualizar `TierProgressCard.tsx`
Redesenhar o card para mostrar:
- Barra de progresso única baseada na quantidade de leads
- **Linha 1**: Quantidade atual de leads vs quantidade necessária para próximo nível
- **Linha 2**: Faturamento atual calculado (leads * R$ 2.500) vs faturamento do próximo nível
- Manter mensagem de bônus e comissão

### Layout Visual Proposto

```text
┌─────────────────────────────────────────────────────────┐
│  📈 Progresso de Nível                                  │
├─────────────────────────────────────────────────────────┤
│  Silver                                           Gold  │
│  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  [30%] │
│                                                         │
│  👥 6 de 20 leads ativos          Faltam 14 leads       │
│  💰 R$ 15.000,00 de R$ 50.000,00  Falta R$ 35.000,00    │
│                                                         │
│  💡 Ao atingir Gold, você receberá um bônus...          │
└─────────────────────────────────────────────────────────┘
```

---

## Detalhes Técnicos

### Modificações em `src/hooks/useTiers.tsx`

```typescript
// Nova assinatura do hook
export const useUserTierProgress = (activeLeadsCount: number) => {
  const { data: tiers, isLoading } = useTiers();

  // Encontrar tier atual baseado em client_count
  const currentTier = tiers.find(
    (tier) =>
      activeLeadsCount >= getMinClientCount(tier) &&
      (tier.client_count === null || activeLeadsCount < tier.client_count)
  );

  // Calcular progresso para próximo nível
  const progress = (activeLeadsCount - minClients) / (nextTier.client_count - minClients) * 100;

  // Calcular faturamento (leads * 2500)
  const currentRevenue = activeLeadsCount * 2500;
  const nextTierRevenue = nextTier?.min_revenue || 0;

  return { 
    currentTier, 
    nextTier, 
    progress, 
    activeLeadsCount,
    leadsToNextTier,
    currentRevenue,
    revenueToNextTier,
    isLoading 
  };
};
```

### Modificações em `src/components/dashboard/TierProgressCard.tsx`

1. Usar `metrics?.activeLeads` em vez de `monthlyRevenue`
2. Exibir duas linhas de informação:
   - Contagem de leads (atual / necessário para próximo nível)
   - Faturamento calculado (atual / necessário para próximo nível)
3. Usar ícones distintos para leads (👥) e faturamento (💰)

### Modificações em `src/components/sidebar/PartnerStatusWidget.tsx`

Atualizar para usar a mesma lógica baseada em quantidade de leads ativos.
