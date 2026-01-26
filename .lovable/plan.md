
# Plano: Redirecionamento Super Admin + Historico Mensal de Comissoes SA

## Visao Geral

Este plano implementa duas funcionalidades principais:
1. **Redirecionamento Automatico para Super Admin**: Usuarios com role `super_admin` serao direcionados automaticamente para o ambiente administrativo (`/admin`) ao fazer login, ao inves da tela de afiliados.
2. **Historico Mensal de Comissoes SA com Snapshots Automaticos**: Sistema que salva automaticamente um snapshot das comissoes SA no final de cada mes, com interface para visualizacao do historico.

---

## Parte 1: Redirecionamento Automatico para Super Admin

### Alteracoes Necessarias

#### 1.1 Modificar Auth.tsx

Apos o login bem-sucedido, verificar se o usuario e super_admin e redirecionar para `/admin`:

```text
Fluxo atual:
Login -> Verifica must_change_password -> Redireciona para "/"

Novo fluxo:
Login -> Verifica must_change_password -> Verifica role -> 
  Se super_admin: Redireciona para "/admin"
  Senao: Redireciona para "/"
```

#### 1.2 Modificar Dashboard.tsx (Pagina Inicial)

Adicionar verificacao no componente para redirecionar super_admins:

```text
Ao montar Dashboard:
  - Verificar se usuario e super_admin via useAdminAccess
  - Se sim, redirecionar para /admin
  - Senao, exibir dashboard normal
```

#### 1.3 Modificar AppLayout.tsx

Adicionar logica de redirecionamento para super_admins que tentam acessar paginas de afiliados:

```text
No useEffect apos carregar isLoading:
  - Se isSuperAdmin e rota atual nao comeca com /admin
  - Redirecionar para /admin
```

---

## Parte 2: Historico Mensal de Comissoes SA com Snapshots Automaticos

### 2.1 Estrutura de Dados

A tabela `sa_commission_history` ja existe e sera utilizada para armazenar os snapshots:

```text
sa_commission_history:
  - id: UUID (PK)
  - sa_user_id: UUID (Super Admin)
  - affiliate_user_id: UUID (Afiliado)
  - reference_month: TEXT (YYYY-MM)
  - affiliate_name: TEXT
  - affiliate_tier: TEXT
  - affiliate_commission_rate: NUMERIC
  - sa_commission_rate: NUMERIC
  - client_count: INTEGER
  - base_value_per_client: NUMERIC
  - affiliate_commission_value: NUMERIC
  - sa_commission_value: NUMERIC
  - status: TEXT (pending/paid)
  - calculated_at: TIMESTAMPTZ
  - paid_at: TIMESTAMPTZ
  - notes: TEXT
```

### 2.2 Nova Edge Function: sa-commission-snapshot

Criar uma edge function que pode ser chamada via cron job ou manualmente para gerar snapshots:

```text
POST /functions/v1/sa-commission-snapshot

Autenticacao: x-webhook-secret (mesmo do n8n-webhook)

Parametros:
  - reference_month: string (YYYY-MM) - opcional, padrao = mes anterior
  - force: boolean - sobrescrever snapshot existente

Logica:
1. Obter configuracoes SA (teto, valor base)
2. Buscar todos os super_admins
3. Para cada super_admin:
   a. Buscar todos os afiliados ativos
   b. Para cada afiliado:
      - Obter tier e taxa de comissao
      - Contar leads ativos
      - Calcular comissao SA = teto - % afiliado
      - Calcular valores monetarios
   c. Salvar registros em sa_commission_history
4. Retornar resumo
```

### 2.3 Integracao com Webhook n8n

Adicionar nova action `generate_sa_snapshot` ao webhook existente:

```text
Payload:
{
  "action": "generate_sa_snapshot",
  "data": {
    "reference_month": "2026-01",
    "force": false
  }
}
```

### 2.4 Novos Componentes de Interface

#### SACommissionHistory.tsx

Componente para exibir historico de snapshots mensais:

```text
Funcionalidades:
- Lista de meses com snapshots salvos
- Ao clicar em um mes, exibe detalhamento
- Comparativo entre meses (grafico de tendencia)
- Filtros por periodo
- Botao para gerar snapshot manualmente (mes atual)
```

#### SAHistoryTable.tsx

Tabela detalhada do historico de um mes especifico:

```text
Colunas:
- Afiliado
- Tier
- % Afiliado / % SA
- Clientes
- Comissao Afiliado
- Comissao SA
- Status (Pendente/Pago)
- Acoes (Marcar como pago)
```

### 2.5 Hook useSACommissionHistory

```typescript
// Busca historico de snapshots
const useSACommissionHistory = () => {
  return useQuery({
    queryKey: ["sa-commission-history"],
    queryFn: async () => {
      // Buscar todos os registros agrupados por reference_month
      // Retornar lista de meses com totais
    }
  });
};

// Busca detalhes de um mes especifico
const useSACommissionHistoryDetail = (referenceMonth: string) => {
  return useQuery({
    queryKey: ["sa-commission-history", referenceMonth],
    queryFn: async () => {
      // Buscar registros do mes especificado
    }
  });
};

// Mutation para gerar snapshot
const useGenerateSASnapshot = () => {
  return useMutation({
    mutationFn: async (params: { referenceMonth: string; force?: boolean }) => {
      // Chamar edge function ou webhook
    }
  });
};
```

---

## Arquivos a Criar/Modificar

### Novos Arquivos

```text
src/hooks/useSACommissionHistory.tsx       # Hook para historico
src/components/admin/SACommissionHistory.tsx  # Componente de historico
src/components/admin/SAHistoryTable.tsx    # Tabela de detalhes
supabase/functions/sa-commission-snapshot/index.ts  # Edge function
```

### Arquivos a Modificar

```text
src/pages/Auth.tsx                    # Redirecionar super_admin para /admin
src/pages/Dashboard.tsx               # Redirecionar super_admin para /admin
src/components/layout/AppLayout.tsx   # Verificacao de redirecionamento
src/pages/admin/AdminSACommissions.tsx # Adicionar aba de historico
supabase/functions/n8n-webhook/index.ts # Adicionar action generate_sa_snapshot
supabase/config.toml                  # Configurar nova edge function
```

---

## Secao Tecnica

### Logica de Redirecionamento (Auth.tsx)

```typescript
// Apos login bem-sucedido
const handleSuccessfulLogin = async () => {
  // Verificar roles do usuario
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id);
  
  const isSuperAdmin = roles?.some(r => r.role === "super_admin");
  
  if (isSuperAdmin) {
    navigate("/admin");
  } else {
    navigate("/");
  }
};
```

### Edge Function sa-commission-snapshot

```typescript
// Estrutura principal
Deno.serve(async (req) => {
  // Validar autenticacao
  // Parsear parametros
  // Gerar snapshot:
  
  const settings = await getSettings();
  const superAdmins = await getSuperAdmins();
  const affiliates = await getActiveAffiliates();
  const tiers = await getTiers();
  const leads = await getActiveLeads();
  
  for (const sa of superAdmins) {
    for (const affiliate of affiliates) {
      const tier = tiers.find(t => t.name === affiliate.tier_level);
      const affiliateRate = tier?.commission_percentage || 0;
      const saRate = settings.commission_ceiling - affiliateRate;
      const clientCount = leads.filter(l => l.user_id === affiliate.user_id).length;
      
      await supabase.from("sa_commission_history").upsert({
        sa_user_id: sa.user_id,
        affiliate_user_id: affiliate.user_id,
        reference_month: referenceMonth,
        affiliate_name: affiliate.full_name,
        affiliate_tier: affiliate.tier_level,
        affiliate_commission_rate: affiliateRate,
        sa_commission_rate: saRate,
        client_count: clientCount,
        base_value_per_client: settings.base_plan_value,
        affiliate_commission_value: settings.base_plan_value * (affiliateRate / 100) * clientCount,
        sa_commission_value: settings.base_plan_value * (saRate / 100) * clientCount,
        status: 'pending',
      }, { onConflict: 'sa_user_id,affiliate_user_id,reference_month' });
    }
  }
});
```

### Constraint para Upsert

Adicionar constraint unica para evitar duplicatas:

```sql
ALTER TABLE sa_commission_history 
ADD CONSTRAINT sa_commission_history_unique_entry 
UNIQUE (sa_user_id, affiliate_user_id, reference_month);
```

### Integracao com Cron (n8n ou Supabase)

Para automatizar a geracao de snapshots no final de cada mes:

```text
Opcao 1: n8n Workflow
- Trigger: Cron "0 0 1 * *" (primeiro dia de cada mes, meia-noite)
- Action: POST /functions/v1/n8n-webhook
- Body: { "action": "generate_sa_snapshot", "data": { "reference_month": "YYYY-MM" } }

Opcao 2: pg_cron (via SQL no banco)
- Requer habilitacao da extensao pg_cron no Supabase
```

---

## Interface Atualizada

### AdminSACommissions.tsx com Tabs

```text
+--------------------------------------------------+
| Comissoes SA                     [Configuracoes] |
+--------------------------------------------------+
|  [Atual]  [Historico]                            |
+--------------------------------------------------+
|                                                  |
|  Tab "Atual":                                    |
|    - Cards de metricas                           |
|    - Tabela de afiliados                         |
|    - Graficos                                    |
|                                                  |
|  Tab "Historico":                                |
|    - Seletor de mes                              |
|    - Botao "Gerar Snapshot"                      |
|    - Tabela historica                            |
|    - Grafico de evolucao mensal                  |
|                                                  |
+--------------------------------------------------+
```

---

## Ordem de Implementacao

1. **Migration SQL** - Adicionar constraint unica em sa_commission_history
2. **Edge Function sa-commission-snapshot** - Criar funcao de geracao de snapshots
3. **Hook useSACommissionHistory** - Buscar e gerenciar historico
4. **Componentes SACommissionHistory e SAHistoryTable** - Interface de historico
5. **Modificar AdminSACommissions.tsx** - Adicionar tabs Atual/Historico
6. **Modificar Auth.tsx** - Redirecionar super_admin apos login
7. **Modificar Dashboard.tsx e AppLayout.tsx** - Redirecionar super_admin
8. **Adicionar action generate_sa_snapshot ao n8n-webhook** - Integracao externa

---

## Consideracoes de Seguranca

1. **Acesso Restrito**: Apenas super_admins podem acessar e gerar snapshots
2. **Validacao de Mes**: Validar formato YYYY-MM antes de processar
3. **Protecao contra Sobrescrita**: Flag `force` para evitar sobrescrita acidental
4. **Auditoria**: Logs de quando snapshots foram gerados e por quem
5. **RLS**: Politicas existentes ja protegem a tabela sa_commission_history

---

## Integracao Futura

- Exportar relatorios de comissoes SA em PDF/Excel
- Notificacoes quando novos snapshots sao gerados
- Webhook para sistemas externos quando comissoes sao pagas
- Dashboard com KPIs de tendencia de comissoes ao longo do tempo
