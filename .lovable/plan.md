
# Plano de Execução: Correção de Vulnerabilidades de Segurança

## Resumo das Correções

Vou executar o plano aprovado para resolver os seguintes problemas de segurança:

| Problema | Nível | Solução |
|----------|-------|---------|
| All User Personal Data Exposed to Any Admin Account | ERROR | Criar tabela de audit log + função de logging |
| Support Ticket Contents Readable by All Admins | WARN | Atualizar RLS para acesso baseado em atribuição |
| n8n webhook uses service role key | WARN | Documentar mitigações existentes |
| Leaked Password Protection Disabled | WARN | Requer ação manual do usuário |
| Admin authorization only on client side | WARN | Já ignorado (implementado corretamente) |

---

## Alterações a Implementar

### 1. Migração SQL - Criar Sistema de Auditoria e Atualizar RLS

**Nova tabela `admin_data_access_log`:**
- `id`: UUID (primary key)
- `admin_user_id`: UUID (FK to auth.users)
- `action`: TEXT (VIEW, UPDATE, DELETE)
- `table_accessed`: TEXT
- `record_id`: UUID (opcional)
- `accessed_at`: TIMESTAMPTZ
- `details`: JSONB

**Nova função `log_admin_data_access()`:**
- SECURITY DEFINER para permitir inserção por admins
- Registra automaticamente acessos a dados sensíveis

**Atualização RLS `support_tickets`:**
- Super admins: acesso total
- Admins regulares: apenas tickets atribuídos a eles ou não atribuídos
- Usuários: apenas seus próprios tickets

**Atualização RLS `support_messages`:**
- Alinhado com a nova política de tickets

### 2. Atualização do Hook `useAdminAffiliates.tsx`

Adicionar chamada RPC para registrar acesso quando admins buscam dados de afiliados:

```typescript
// Após buscar profiles, registrar acesso
await supabase.rpc('log_admin_data_access', {
  _action: 'VIEW',
  _table_accessed: 'profiles',
  _details: { record_count: profiles?.length || 0, context: 'admin_affiliates_list' }
});
```

### 3. Atualização dos Security Findings

Após implementar as correções:
- Deletar finding `profiles_table_admin_bypass` (corrigido)
- Deletar finding `support_tickets_message_content_exposure` (corrigido)
- Atualizar finding `n8n_webhook_service_role` com mitigações documentadas

---

## Arquivos Modificados

1. **Nova migração SQL** - Criar estruturas de auditoria e atualizar RLS
2. **`src/hooks/useAdminAffiliates.tsx`** - Adicionar logging de acesso
3. **Security Findings** - Atualizar status

---

## Instruções para o Usuário (Ação Manual Necessária)

### Habilitar Leaked Password Protection

Para corrigir o warning "Leaked Password Protection Disabled":

1. Abrir o backend do projeto (Lovable Cloud)
2. Navegar para **Users → Auth Settings → Email**
3. Ativar o switch **"Password HIBP Check"**
4. Salvar as configurações

Isso habilitará a verificação automática contra o banco de dados Have I Been Pwned.

---

## Impacto das Mudanças

### Comportamento Após Implementação

**Admins regulares:**
- Continuam podendo ver dados de afiliados
- Todos os acessos são registrados em audit log
- Só podem ver tickets de suporte atribuídos a eles ou não atribuídos

**Super admins:**
- Podem ver todos os dados (sem mudança)
- Podem ver o audit log de acessos
- Acesso total a todos os tickets

**Usuários:**
- Comportamento inalterado
- Só veem seus próprios dados e tickets

### Segurança Aprimorada

- Audit trail completo para acesso a dados sensíveis
- Princípio de menor privilégio para tickets de suporte
- Capacidade de detectar acessos suspeitos via logs
- Conformidade com práticas de proteção de dados
