

# Plano: Correção do Erro "Customer Contact Information Accessible Without Authentication"

## Problema Identificado

O scanner de segurança detectou que a tabela `leads` (que contém nomes e emails de clientes) não tem uma política RLS que **explicitamente bloqueie** acesso anônimo. Embora as políticas existentes usem `auth.uid() IS NOT NULL`, o padrão recomendado é adicionar uma política `RESTRICTIVE` que negue explicitamente o acesso anônimo.

### Análise das Políticas Atuais

| Tabela | Política | Tipo | Problema |
|--------|----------|------|----------|
| leads | Users can view their own leads | PERMISSIVE | Não bloqueia anônimo explicitamente |
| leads | Admins can view all leads | PERMISSIVE | Não bloqueia anônimo explicitamente |
| tiers | Authenticated users can view active tiers | PERMISSIVE | Warning: visível para todos autenticados |

### Por que isso é um problema?

Políticas `PERMISSIVE` combinam com `OR` - se uma delas permitir, o acesso é concedido. A melhor prática é ter uma política `RESTRICTIVE` base que exija autenticação, garantindo que mesmo se houver um bug em outras políticas, usuários anônimos não terão acesso.

---

## Solução Proposta

### 1. Adicionar Política RESTRICTIVE para Bloquear Anônimos (ERROR Fix)

Criar uma política `RESTRICTIVE` na tabela `leads` que exige autenticação. Políticas restrictivas combinam com `AND`, então o acesso anônimo será bloqueado mesmo que outras políticas tentem permitir.

**SQL:**
```sql
CREATE POLICY "Deny anonymous access to leads"
ON public.leads
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);
```

### 2. Tratar o Warning sobre Tiers (Opcional)

O warning indica que todos os usuários autenticados podem ver a estrutura de comissões. Isso pode ser:
- **Intencional**: O programa de afiliados é transparente sobre comissões
- **Problema**: Concorrentes podem analisar a estrutura

**Análise do uso atual:**
- `TierProgressCard.tsx`: Mostra progresso do usuário no tier
- `PartnerLevelCard.tsx`: Mostra nível atual do parceiro  
- `Commissions.tsx`: Página de comissões do usuário
- `PartnerStatusWidget.tsx`: Widget de status na sidebar

Todos esses componentes precisam que o usuário veja os tiers para entender seu progresso. **Recomendo marcar como ignorado** pois a transparência é intencional para o programa de afiliados.

---

## Alterações a Implementar

### Migração SQL

```sql
-- =====================================================
-- FIX: Customer Contact Information Security
-- =====================================================

-- 1. Adicionar política RESTRICTIVE para bloquear acesso anônimo
-- Esta política combina com AND com as outras, garantindo que
-- auth.uid() deve ser NOT NULL para qualquer operação

CREATE POLICY "Deny anonymous access to leads"
ON public.leads
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- =====================================================
-- NOTA: Não adicionando política similar para tiers porque
-- a visibilidade dos tiers para usuários autenticados é 
-- intencional para o programa de afiliados
-- =====================================================
```

### Atualização de Security Findings

Após implementar:
1. **Deletar** o finding `leads_missing_select_policy` (corrigido)
2. **Ignorar** o finding `tiers_overly_permissive` com justificativa de transparência intencional

---

## Impacto das Mudanças

### Comportamento Após Implementação

| Cenário | Antes | Depois |
|---------|-------|--------|
| Usuário anônimo tenta SELECT em leads | Bloqueado por `auth.uid() IS NOT NULL` | Bloqueado explicitamente por política RESTRICTIVE |
| Usuário autenticado vê seus leads | Permitido | Permitido (sem mudança) |
| Admin vê todos os leads | Permitido | Permitido (sem mudança) |

### Por que usar RESTRICTIVE ao invés de uma política normal?

- Políticas `PERMISSIVE` combinam com `OR` → qualquer uma que permita = acesso concedido
- Políticas `RESTRICTIVE` combinam com `AND` → TODAS devem permitir = acesso concedido
- Uma política RESTRICTIVE de base garante que **sempre** haverá verificação de autenticação

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| Nova migração SQL | Adicionar política RESTRICTIVE para leads |
| Security Findings | Deletar finding corrigido + ignorar warning de tiers |

---

## Detalhes Técnicos

### Como políticas RLS funcionam

```text
┌─────────────────────────────────────────────────────────────┐
│                   POLÍTICAS PERMISSIVE                       │
│                                                              │
│  Policy A: auth.uid() = user_id                              │
│  Policy B: is_admin(auth.uid())                              │
│                                                              │
│  Resultado: A OR B (qualquer uma permite acesso)             │
└─────────────────────────────────────────────────────────────┘
                           AND
┌─────────────────────────────────────────────────────────────┐
│                   POLÍTICAS RESTRICTIVE                      │
│                                                              │
│  Policy C: auth.uid() IS NOT NULL                            │
│                                                              │
│  Resultado: C AND (A OR B)                                   │
│  → Deve estar autenticado E (ser dono OU ser admin)          │
└─────────────────────────────────────────────────────────────┘
```

### Justificativa para ignorar warning de tiers

O programa de afiliados é baseado em transparência - os afiliados precisam ver:
- Qual tier estão atualmente
- Quais são os requisitos para próximo tier
- Quais são as comissões em cada nível

Esta é uma decisão de negócio, não uma vulnerabilidade de segurança.

