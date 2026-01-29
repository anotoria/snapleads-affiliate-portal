
# Plano de Ajustes no Formulário de Níveis (Tiers)

## Resumo das Alterações Solicitadas

Baseado na tela atual de "Editar Nível", precisamos:
1. Renomear campo "Faturamento Máximo" para "Faturamento Próximo Nível"
2. Adicionar novos campos: "Qtde de Clientes Inicial" e "Qtde de Clientes Próximo Nível"
3. Adicionar checkbox "Sem limite máximo" para marcar faturamento infinito
4. Calcular automaticamente os faturamentos com base no Preço Mensal (R$ 2.500)

---

## Fase 1: Alterações no Banco de Dados

### 1.1 Adicionar novos campos na tabela `tiers`

```sql
ALTER TABLE public.tiers 
  ADD COLUMN IF NOT EXISTS min_client_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_level_client_count integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_unlimited boolean NOT NULL DEFAULT false;
```

**Campos:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `min_client_count` | integer | Qtde de Clientes Inicial para este nível |
| `next_level_client_count` | integer (nullable) | Qtde de Clientes para próximo nível |
| `is_unlimited` | boolean | Se true, não há limite máximo (infinito) |

---

## Fase 2: Alterações no Hook `useAdminTiers.tsx`

### 2.1 Atualizar Interface `TierFormData`

```typescript
export interface TierFormData {
  name: string;
  display_name: string;
  min_revenue: number;           // Calculado automaticamente
  min_client_count: number;      // NOVO: Qtde Clientes Inicial
  next_level_client_count: number | null; // NOVO: Qtde Clientes Próximo Nível
  is_unlimited: boolean;         // NOVO: Sem limite máximo
  commission_percentage: number;
  bonus_amount: number;
  color: string;
  sort_order: number;
  is_active: boolean;
}
```

### 2.2 Buscar `base_plan_value` das configurações

Adicionar query para buscar o valor base do plano (R$ 2.500) da tabela `sa_commission_settings` para uso nos cálculos.

---

## Fase 3: Alterações no Componente `AdminTiers.tsx`

### 3.1 Novo Layout do Formulário

```text
┌─────────────────────────────────────────────────────┐
│ Editar Nível                                    [X] │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Nome do Nível          Nome de Exibição            │
│ [silver             ]  [Silver              ]       │
│                                                     │
│ Qtde Clientes Inicial  Qtde Clientes Próx. Nível   │
│ [1                  ]  [5                   ]       │
│                                                     │
│ ☐ Sem limite máximo (último nível)                 │
│                                                     │
│ Faturamento Inicial (calculado)                     │
│ [R$ 2.500,00                        ] (disabled)    │
│ = Qtde Inicial × R$ 2.500                          │
│                                                     │
│ Faturamento Próximo Nível (calculado)              │
│ [R$ 12.500,00                       ] (disabled)    │
│ = Qtde Próximo Nível × R$ 2.500                    │
│ OU se checkbox marcado: "+de R$ X (∞)"             │
│                                                     │
│ % Comissão             Valor do Bônus              │
│ [8                  ]  [0                   ]       │
│                                                     │
│ Cor                    Ordem                        │
│ [🟦 #99c0ff        ]  [1                   ]       │
│                                                     │
│ 🔘 Ativo                                           │
│                                                     │
│              [Cancelar]  [Salvar]                   │
└─────────────────────────────────────────────────────┘
```

### 3.2 Lógica de Cálculo

```typescript
// Valor base do plano (buscar de sa_commission_settings)
const BASE_PLAN_VALUE = 2500; // R$ 2.500

// Faturamento Inicial
const calculatedMinRevenue = formData.min_client_count * BASE_PLAN_VALUE;
// Ex: 1 cliente × R$ 2.500 = R$ 2.500

// Faturamento Próximo Nível
const calculatedNextLevelRevenue = formData.is_unlimited 
  ? null  // Infinito
  : (formData.next_level_client_count || 0) * BASE_PLAN_VALUE;
// Ex: 5 clientes × R$ 2.500 = R$ 12.500

// Exibição quando is_unlimited = true
// "+de R$ 12.500,00 (∞)" ou apenas "∞"
```

### 3.3 Estados do Formulário

```typescript
const [formData, setFormData] = useState<TierFormData>({
  name: "",
  display_name: "",
  min_revenue: 0,
  min_client_count: 0,        // NOVO
  next_level_client_count: 0, // NOVO
  is_unlimited: false,        // NOVO
  commission_percentage: 0,
  bonus_amount: 0,
  color: "#6B7280",
  sort_order: 0,
  is_active: true,
});
```

### 3.4 Comportamento do Checkbox "Sem limite máximo"

Quando marcado:
- Campo "Qtde Clientes Próximo Nível" fica desabilitado (ou oculto)
- Campo "Faturamento Próximo Nível" exibe: `"+de {faturamento_atual} (∞)"`
- Ao salvar, `next_level_client_count` = null e `is_unlimited` = true

---

## Fase 4: Atualização da Tabela de Listagem

### 4.1 Ajustar coluna "Faixa de Receita"

**Antes:**
```
R$ 0,00 - R$ 10.000,00
R$ 10.000,00 - ∞
```

**Depois:**
```
R$ 2.500,00 - R$ 12.500,00 (1-5 clientes)
R$ 12.500,00 - ∞ (5+ clientes)
```

### 4.2 Nova coluna "Qtde Clientes"

Mostrar faixa de clientes:
```
1 - 5
5 - 20
20 - 30
30+ (∞)
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/migrations/` | Adicionar campos `min_client_count`, `next_level_client_count`, `is_unlimited` |
| `src/hooks/useAdminTiers.tsx` | Atualizar TierFormData, adicionar busca do base_plan_value |
| `src/pages/admin/AdminTiers.tsx` | Novo layout do formulário, lógica de cálculo, checkbox |

---

## Considerações Técnicas

### Migração dos Dados Existentes

Os tiers atuais têm `client_count` (único campo). A migração deverá:
1. Copiar `client_count` para `next_level_client_count`
2. Definir `min_client_count` = 0 para o primeiro tier
3. Para os demais, usar o `next_level_client_count` do tier anterior como `min_client_count`

### Relacionamento com o Campo `client_count` Existente

O campo `client_count` atual pode ser:
- **Mantido**: como campo de cálculo intermediário
- **Removido**: após migração para os novos campos

Recomendação: Manter `client_count` como sinônimo de `next_level_client_count` por compatibilidade com código existente (simulador, dashboard, etc).

---

## Fluxo de Uso

1. Admin abre modal de edição
2. Preenche "Qtde Clientes Inicial" (ex: 1)
3. Preenche "Qtde Clientes Próximo Nível" (ex: 5)
4. Sistema calcula automaticamente:
   - Faturamento Inicial: 1 × R$ 2.500 = R$ 2.500
   - Faturamento Próximo Nível: 5 × R$ 2.500 = R$ 12.500
5. Se for o último tier, marca "Sem limite máximo"
   - Faturamento Próximo Nível exibe: "+de R$ 12.500 (∞)"
6. Admin salva

---

## Resultado Esperado

O formulário será mais intuitivo, permitindo definir os níveis baseados em quantidade de clientes, com os faturamentos calculados automaticamente usando o valor base do plano (R$ 2.500).
