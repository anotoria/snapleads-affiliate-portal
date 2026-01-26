

# Plano: Área Administrativa Completa

## Visao Geral

Este plano cria uma area administrativa completa (`/admin`) com dashboard, gerenciamento de afiliados, configuracao de tiers/pricing, visualizacao global de tickets e um seletor de modo (Afiliado/Admin) no header para usuarios com permissoes administrativas.

---

## Estrutura de Arquivos a Criar

```text
src/
  pages/
    admin/
      AdminDashboard.tsx       # Dashboard administrativo
      AdminAffiliates.tsx      # Gerenciamento de afiliados
      AdminTiers.tsx           # Gerenciamento de tiers
      AdminPricing.tsx         # Gerenciamento de pricing
      AdminSupport.tsx         # Visualizacao global de tickets
      AdminAdmins.tsx          # Gerenciamento de administradores
  components/
    admin/
      AdminLayout.tsx          # Layout especifico para area admin
      AdminSidebar.tsx         # Sidebar do admin
      AdminMetricCard.tsx      # Cards de metricas do admin
      AffiliatesTable.tsx      # Tabela de afiliados
      TierFormDialog.tsx       # Dialog para criar/editar tiers
      PricingFormDialog.tsx    # Dialog para criar/editar pricing
      AdminTicketsList.tsx     # Lista global de tickets
      AdminsTable.tsx          # Tabela de administradores
  hooks/
    useAdminData.tsx           # Hook para dados administrativos
    useAdminTickets.tsx        # Hook para tickets (admin)
    useAdminAffiliates.tsx     # Hook para gerenciar afiliados
```

---

## Funcionalidades Principais

### 1. Alternancia Afiliado/Admin no Header

O componente `AppHeader.tsx` sera modificado para:
- Verificar se o usuario tem role `admin` ou `super_admin` via `useAdminAccess`
- Exibir um botao de alternancia "Modo Admin" / "Modo Afiliado"
- Ao clicar, redirecionar para `/admin` ou `/` respectivamente

### 2. Admin Dashboard (`/admin`)

Metricas globais:
- Total de afiliados (ativos/inativos)
- Total de leads no sistema
- Pagamentos pendentes
- Total pago
- Tickets abertos
- Distribuicao por tier (grafico)

### 3. Gerenciamento de Afiliados (`/admin/affiliates`)

Tabela com:
- Nome, empresa, tier, status (ativo/inativo)
- Quantidade de leads
- Valor pendente
- Acoes: ativar/desativar, resetar senha, editar, excluir

### 4. Gerenciamento de Tiers (`/admin/tiers`)

Tabela editavel com:
- Nome, display name, revenue minimo/maximo
- Porcentagem de comissao, bonus
- Cor, ordem
- Acoes: adicionar, editar, excluir

### 5. Gerenciamento de Pricing (`/admin/pricing`)

Tabela editavel com:
- Min/max access, preco mensal
- Descricao
- Acoes: adicionar, editar, excluir

### 6. Suporte Global (`/admin/support`)

Lista de todos os tickets do sistema:
- Filtros por status, prioridade, categoria
- Atribuir tickets a admins
- Responder como admin (`is_admin_reply: true`)
- Resolver/fechar tickets

### 7. Gerenciamento de Admins (`/admin/admins`) - Somente Super Admin

- Lista de usuarios com roles admin/super_admin
- Promover usuario a admin
- Remover role de admin
- Promover a super_admin (apenas super_admin pode)

---

## Politicas RLS Necessarias

As politicas existentes ja cobrem a maioria dos casos. Verificacoes adicionais:

1. **profiles**: Admins precisam SELECT em todos os profiles
   - Adicionar policy: `Admins can view all profiles`

2. **leads**: Admins precisam SELECT em todos os leads
   - Adicionar policy: `Admins can view all leads`

3. **payouts**: Admins precisam SELECT e UPDATE em todos os payouts
   - Adicionar policies: `Admins can view all payouts`, `Admins can update payouts`

---

## Alteracoes no Roteamento (App.tsx)

Novas rotas protegidas:

```text
/admin            -> AdminDashboard
/admin/affiliates -> AdminAffiliates
/admin/tiers      -> AdminTiers
/admin/pricing    -> AdminPricing
/admin/support    -> AdminSupport
/admin/admins     -> AdminAdmins (apenas super_admin)
```

---

## Secao Tecnica

### Hook useAdminData

```typescript
// Busca metricas globais para o dashboard admin
const useAdminDashboardMetrics = () => {
  return useQuery({
    queryKey: ["admin-dashboard-metrics"],
    queryFn: async () => {
      // Conta afiliados, leads, payouts, tickets
      // Retorna metricas agregadas
    }
  });
};
```

### Hook useAdminAffiliates

```typescript
// CRUD de afiliados para admins
const useAdminAffiliates = () => {
  // SELECT * FROM profiles (com RLS de admin)
  // Mutations para update (ativar/desativar)
  // Supabase Admin API para reset password
};
```

### Hook useAdminTickets

```typescript
// Busca TODOS os tickets (admin view)
const useAdminTickets = () => {
  return useQuery({
    queryKey: ["admin-tickets"],
    queryFn: async () => {
      // RLS permite admins ver todos
      const { data } = await supabase
        .from("support_tickets")
        .select("*, profiles:user_id(full_name, company_name)")
        .order("created_at", { ascending: false });
      return data;
    }
  });
};
```

### Componente AdminLayout

Similar ao AppLayout, mas com:
- `AdminSidebar` em vez de `AppSidebar`
- Verificacao de `isAdmin` no mount
- Redirect para `/` se nao for admin

### Componente AdminSidebar

Menu lateral com:
- Dashboard
- Afiliados
- Tiers
- Pricing
- Suporte
- Administradores (se super_admin)
- Botao "Voltar ao Portal"

### Modificacao do AppHeader

```typescript
// Adicionar apos o seletor de idioma
{isAdmin && (
  <Button 
    variant="outline" 
    size="sm"
    onClick={() => navigate(isOnAdminRoute ? "/" : "/admin")}
  >
    {isOnAdminRoute ? t.common.affiliateMode : t.common.adminMode}
  </Button>
)}
```

---

## Migrations SQL Necessarias

```sql
-- 1. Admins podem ver todos os profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (is_admin(auth.uid()));

-- 2. Admins podem atualizar profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (is_admin(auth.uid()));

-- 3. Admins podem ver todos os leads
CREATE POLICY "Admins can view all leads"
ON public.leads FOR SELECT
USING (is_admin(auth.uid()));

-- 4. Admins podem ver todos os payouts
CREATE POLICY "Admins can view all payouts"
ON public.payouts FOR SELECT
USING (is_admin(auth.uid()));

-- 5. Admins podem atualizar payouts
CREATE POLICY "Admins can update payouts"
ON public.payouts FOR UPDATE
USING (is_admin(auth.uid()));
```

---

## Ordem de Implementacao

1. **Migrations RLS** - Adicionar policies para admins acessarem dados globais
2. **AdminLayout + AdminSidebar** - Estrutura base da area admin
3. **useAdminData hooks** - Hooks para buscar dados administrativos
4. **AdminDashboard** - Dashboard com metricas globais
5. **AdminAffiliates** - Gerenciamento de afiliados
6. **AdminTiers + AdminPricing** - Configuracao de tiers e pricing
7. **AdminSupport** - Visualizacao global de tickets
8. **AdminAdmins** - Gerenciamento de administradores
9. **AppHeader modificado** - Botao de alternancia Admin/Afiliado
10. **App.tsx rotas** - Adicionar rotas da area admin

---

## Traducoes a Adicionar

As traducoes para admin ja existem em `src/i18n/translations.ts` (linhas 247-308 e 626-687). Serao utilizadas as chaves existentes em `t.admin.*` e `t.nav.*`.

