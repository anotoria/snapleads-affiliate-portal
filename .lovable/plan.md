
# Plano: Gestão de Afiliados por Gestor (Account Manager)

## Objetivo
Adicionar uma estrutura para que cada afiliado possa ter um gestor (account manager) designado, permitindo visualização e gestão hierárquica.

---

## Análise da Situação Atual

### Estrutura Existente
- **profiles**: Dados dos afiliados (full_name, company_name, tier_level, etc.)
- **user_roles**: Papéis dos usuários (admin, super_admin)
- **Relacionamento**: Atualmente não existe vínculo gestor-afiliado

### Cenário de Uso
- Admins/Super Admins podem ser designados como gestores de afiliados
- Um gestor pode ter múltiplos afiliados
- Um afiliado tem apenas um gestor (ou nenhum)

---

## Opções de Arquitetura

### Opção A: Campo na Tabela Profiles (Recomendada)
Adicionar `managed_by` (uuid, nullable) na tabela `profiles`.

```text
┌─────────────────────────────────────────────────────┐
│                    PROFILES                         │
├─────────────────────────────────────────────────────┤
│ user_id            │ full_name         │ managed_by│
│────────────────────┼───────────────────┼───────────│
│ affiliate_1        │ João Silva        │ admin_123 │
│ affiliate_2        │ Maria Santos      │ admin_123 │
│ affiliate_3        │ Pedro Costa       │ null      │
│ admin_123          │ Carlos Gestor     │ null      │
└─────────────────────────────────────────────────────┘
```

**Prós:**
- Simples de implementar
- Query direta: `profiles.managed_by = current_user_id`
- Fácil de filtrar e listar

**Contras:**
- Apenas um gestor por afiliado

### Opção B: Tabela Separada affiliate_managers
Criar tabela de relacionamento N:N.

```text
┌──────────────────────────────────────┐
│          AFFILIATE_MANAGERS          │
├──────────────────────────────────────┤
│ affiliate_id │ manager_id │ since    │
│──────────────┼────────────┼──────────│
│ affiliate_1  │ admin_123  │ 2026-01  │
│ affiliate_1  │ admin_456  │ 2026-01  │
└──────────────────────────────────────┘
```

**Prós:**
- Suporta múltiplos gestores por afiliado
- Histórico de transferências possível

**Contras:**
- Mais complexo
- Joins adicionais

---

## Solução Recomendada: Opção A + Melhorias

### Fase 1: Alterações no Banco de Dados

**1.1 Adicionar campo managed_by na profiles**
```sql
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS managed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_managed_by ON profiles(managed_by);
```

**1.2 Criar View para facilitar consultas**
```sql
CREATE OR REPLACE VIEW affiliate_manager_view AS
SELECT 
  p.id,
  p.user_id,
  p.full_name AS affiliate_name,
  p.company_name,
  p.tier_level,
  p.is_active,
  p.managed_by,
  mp.full_name AS manager_name
FROM profiles p
LEFT JOIN profiles mp ON mp.user_id = p.managed_by;
```

---

### Fase 2: Alterações na Interface Admin

**2.1 Lista de Afiliados (AdminAffiliates.tsx)**
- Adicionar coluna "Gestor" na tabela
- Adicionar filtro por gestor
- Mostrar nome do gestor ou "Sem gestor"

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Afiliados                                                        [+] │
├──────────────────────────────────────────────────────────────────────┤
│ [Buscar...] [Status ▼] [Tier ▼] [Gestor ▼]                          │
├──────────────────────────────────────────────────────────────────────┤
│ Nome/Empresa    │ Tier   │ Gestor        │ Leads │ Pendente │ Ações │
│─────────────────┼────────┼───────────────┼───────┼──────────┼───────│
│ João Silva      │ Gold   │ Carlos Admin  │   12  │ R$ 500   │  ...  │
│ ABC Empresa     │        │               │       │          │       │
│─────────────────┼────────┼───────────────┼───────┼──────────┼───────│
│ Maria Santos    │ Silver │ — Sem gestor  │    5  │ R$ 200   │  ...  │
│ XYZ Corp        │        │               │       │          │       │
└──────────────────────────────────────────────────────────────────────┘
```

**2.2 Formulário de Edição (AffiliateFormDialog.tsx)**
- Adicionar campo Select para escolher o gestor
- Lista apenas usuários com role admin ou super_admin

```text
┌─────────────────────────────────────────────────────┐
│ Editar Afiliado                                 [X] │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Nome Completo         Empresa                       │
│ [João Silva       ]   [ABC Empresa          ]       │
│                                                     │
│ Telefone              CNPJ                          │
│ [(11) 99999-9999  ]   [00.000.000/0001-00   ]       │
│                                                     │
│ Nível do Parceiro                                   │
│ [Gold                                      ▼]       │
│                                                     │
│ Gestor Responsável                          ← NOVO  │
│ [Carlos Admin                              ▼]       │
│  ├─ Carlos Admin (Super Admin)                      │
│  ├─ Ana Gestora (Admin)                             │
│  └─ — Sem gestor                                    │
│                                                     │
│ 🔘 Conta Ativa                                      │
│                                                     │
│              [Cancelar]  [Salvar]                   │
└─────────────────────────────────────────────────────┘
```

---

### Fase 3: Visão do Gestor (Filtro Automático)

**3.1 Hook useManagerAffiliates**
Para admins (não super_admin), filtrar automaticamente apenas seus afiliados:

```typescript
// Se admin normal: mostra apenas afiliados onde managed_by = current_user
// Se super_admin: mostra todos
const affiliates = isSuperAdmin 
  ? allAffiliates 
  : allAffiliates.filter(a => a.managed_by === currentUserId);
```

**3.2 Dashboard do Gestor**
Card com métricas dos afiliados sob gestão:
```text
┌──────────────────────────────────────┐
│ 👥 Meus Afiliados                    │
├──────────────────────────────────────┤
│ Total: 15   Ativos: 12   Inativos: 3 │
│                                      │
│ Leads este mês: 145                  │
│ Comissões pendentes: R$ 4.500,00     │
└──────────────────────────────────────┘
```

---

### Fase 4: Página de Gestão de Carteira

**Nova rota: /admin/my-affiliates**
Para admins visualizarem apenas sua carteira:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Minha Carteira de Afiliados                                          │
│ Você gerencia 15 afiliados                                           │
├──────────────────────────────────────────────────────────────────────┤
│ [Buscar...] [Status ▼] [Tier ▼]                                      │
├──────────────────────────────────────────────────────────────────────┤
│ Afiliado         │ Tier   │ Status │ Leads │ Último Acesso   │ Ações│
│──────────────────┼────────┼────────┼───────┼─────────────────┼──────│
│ João Silva       │ Gold   │ Ativo  │   12  │ Há 2 dias       │  ... │
│ Maria Santos     │ Silver │ Ativo  │    5  │ Hoje            │  ... │
│ Pedro Costa      │ Silver │ Inativo│    0  │ Há 30 dias      │  ... │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/migrations/` | Adicionar campo `managed_by` e índice |
| `src/hooks/useAdminAffiliates.tsx` | Buscar nome do gestor, adicionar filtro |
| `src/pages/admin/AdminAffiliates.tsx` | Coluna e filtro de gestor |
| `src/components/admin/AffiliateFormDialog.tsx` | Campo Select de gestor |
| `src/hooks/useAdminRoles.tsx` | Exportar lista de admins para o Select |
| `src/pages/admin/AdminMyAffiliates.tsx` | NOVA página para visão do gestor |
| `src/components/admin/AdminSidebar.tsx` | Novo item "Minha Carteira" |
| `src/App.tsx` | Nova rota /admin/my-affiliates |
| `src/i18n/translations.ts` | Novas traduções |

---

## Regras de Negócio

1. **Apenas admins podem ser gestores** - O campo managed_by só aceita user_ids que tenham role admin ou super_admin
2. **Super Admin vê tudo** - Não é filtrado por managed_by
3. **Admin vê sua carteira** - Vê apenas afiliados onde managed_by = seu user_id
4. **Afiliado pode ficar sem gestor** - managed_by pode ser null
5. **Transferência de carteira** - Super Admin pode reatribuir o gestor de qualquer afiliado

---

## Segurança (RLS)

```sql
-- Admins podem ver afiliados que gerenciam
CREATE POLICY "Admins can view managed affiliates"
ON profiles FOR SELECT
USING (
  auth.uid() = user_id -- próprio perfil
  OR is_super_admin(auth.uid()) -- super admin vê tudo
  OR (is_admin(auth.uid()) AND managed_by = auth.uid()) -- admin vê seus afiliados
);
```

---

## Fluxo de Uso

1. Super Admin acessa Admin > Afiliados
2. Vê todos os afiliados com coluna "Gestor"
3. Clica em "Editar" em um afiliado
4. Seleciona um gestor no dropdown
5. Salva
6. O admin designado agora vê esse afiliado em "Minha Carteira"

---

## Resultado Esperado

- Visão clara de quem gerencia cada afiliado
- Admins focados apenas em suas carteiras
- Super Admins com visão global
- Facilidade para transferir afiliados entre gestores
