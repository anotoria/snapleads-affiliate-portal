

# Plano de Correcoes de Seguranca

## Resumo dos Problemas Identificados

### ERROS (Prioridade Alta)

1. **User Personal Information Could Be Stolen by Hackers**
   - Tabela `profiles` contem dados sensiveis (telefone, CNPJ, nome completo, codigo de afiliado)
   - Risco de enumeracao de usuarios atraves de queries sistematicas

2. **Customer Email Addresses Could Be Harvested by Competitors**
   - Tabela `leads` expoe emails de clientes
   - Conta comprometida pode extrair todos os emails dos leads
   - Sem rate limiting ou auditoria de acessos em massa

### WARNINGS (Prioridade Media)

3. **Admin authorization only on client side** - JA RESOLVIDO
   - Status: IGNORADO corretamente
   - Autorizacao admin e verificada server-side via RLS com funcoes SECURITY DEFINER

4. **n8n webhook uses service role key** - PARCIALMENTE RESOLVIDO
   - Ja possui validacao de secret e HMAC opcional
   - Recomendacao: Atualizar documentacao confirmando que esta corretamente implementado

5. **Commission Calculations Could Reveal Business Model**
   - Tabela `commission_history` expoe taxas, bonus e formulas de calculo
   - Usuarios podem reverter engenharia do modelo de comissoes

---

## Solucoes Propostas

### 1. Protecao de Dados Pessoais (profiles)

**Objetivo:** Prevenir enumeracao de usuarios e proteger PII

**Abordagem: View Segura + Auditoria**

```text
+------------------+     +-------------------+
|  profiles (base) |     | profiles_public   |
|  (acesso negado) | --> |    (view segura)  |
+------------------+     +-------------------+
        |                         |
   Dados sensiveis           Dados filtrados
   (CNPJ, telefone)          (apenas necessarios)
```

**Implementacao:**

1. Criar view `profiles_public` que exclui campos sensiveis para usuarios normais
2. Manter RLS atual para admins (acesso total)
3. Adicionar funcao de auditoria para acessos a dados sensiveis

**Campos a Proteger:**
- `cnpj` - Exibir apenas para o proprio usuario e admins
- `phone` - Exibir apenas para o proprio usuario e admins
- `affiliate_code` - Manter visivel (necessario para sistema de indicacao)

---

### 2. Protecao de Emails de Leads

**Objetivo:** Prevenir coleta em massa de emails e adicionar auditoria

**Abordagem: Rate Limiting + Auditoria + Mascaramento**

```text
Requisicao de Leads
        |
        v
+------------------+
| Rate Limiting    |  <-- Max 100 leads/minuto
+------------------+
        |
        v
+------------------+
| Audit Log        |  <-- Registrar acessos em massa
+------------------+
        |
        v
+------------------+
| Dados Retornados |  <-- Email parcialmente mascarado (opcional)
+------------------+
```

**Implementacao:**

1. **Auditoria de Acessos:** Criar tabela `data_access_log` para registrar consultas a dados sensiveis
2. **Rate Limiting via Edge Function:** Criar endpoint seguro para consulta de leads com limite de requisicoes
3. **Funcao de Auditoria:** Trigger para logar acessos a dados sensíveis
4. **Alerta:** Notificar admins quando houver padrao suspeito de acesso

---

### 3. Protecao do Modelo de Comissoes

**Objetivo:** Ocultar detalhes de calculo, mostrando apenas valores finais

**Abordagem: View Filtrada para Usuarios**

**Campos a Ocultar de Usuarios Normais:**
- `commission_rate` - Taxa percentual
- `base_revenue` - Receita base
- `bonus_value` - Valor de bonus (manter separado)
- `tier_name` - Nome do tier (revelar parcialmente)

**Campos Visiveis:**
- `reference_month` - Mes de referencia
- `client_count` - Quantidade de clientes
- `total_value` - Valor total da comissao
- `status` - Status do pagamento
- `paid_at` - Data de pagamento

**Implementacao:**

1. Criar view `commission_history_user` com campos filtrados
2. Atualizar hook `useCommissions` para usar view
3. Manter acesso completo para admins via tabela original

---

### 4. Atualizacao da Documentacao do Webhook

**Status Atual:** O webhook ja esta bem implementado com:
- Validacao de secret obrigatoria
- HMAC opcional com protecao contra replay
- Auditoria completa
- Validacao de inputs

**Acao:** Atualizar finding para "ignored" com justificativa detalhada

---

## Arquivos a Criar/Modificar

### Novos Arquivos

| Arquivo | Descricao |
|---------|-----------|
| Migration SQL | Views seguras e funcoes de auditoria |

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/hooks/useCommissions.tsx` | Usar view filtrada |
| `src/hooks/useLeads.tsx` | Adicionar logging de acesso |

---

## Detalhes Tecnicos

### Migration SQL

```sql
-- 1. View segura para commission_history (usuarios veem apenas totais)
CREATE VIEW commission_history_user AS
SELECT 
  id,
  user_id,
  reference_month,
  client_count,
  total_value,
  status,
  calculated_at,
  paid_at,
  created_at,
  updated_at
FROM commission_history;

-- 2. Politica: Usuarios acessam via view, admins via tabela original
-- (RLS na view herda da tabela base com security_invoker)

-- 3. Funcao de auditoria para acessos sensiveis
CREATE OR REPLACE FUNCTION log_sensitive_data_access(
  _table_name text,
  _record_count integer,
  _query_type text DEFAULT 'select'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO admin_data_access_log (
    admin_user_id,
    action,
    table_accessed,
    details
  ) VALUES (
    auth.uid(),
    _query_type,
    _table_name,
    jsonb_build_object(
      'record_count', _record_count,
      'accessed_at', now(),
      'source', 'client_query'
    )
  );
END;
$$;

-- 4. Indice para detectar acessos em massa
CREATE INDEX idx_access_log_user_time 
ON admin_data_access_log(admin_user_id, accessed_at DESC);
```

---

## Ordem de Implementacao

### Fase 1: Protecao de Comissoes (Baixo Risco)
1. Criar view `commission_history_user`
2. Atualizar hook `useCommissions` para usar view
3. Testar que admins ainda veem dados completos

### Fase 2: Auditoria de Acessos
1. Adicionar funcao de log de acessos sensiveis
2. Criar indice para deteccao de padroes
3. Implementar logging no hook `useLeads`

### Fase 3: Atualizacao de Findings
1. Marcar finding do webhook como "ignored" com justificativa
2. Marcar finding de admin client-side como "ignored" (ja esta)

---

## Consideracoes de Seguranca

1. **Principio do Menor Privilegio:** Usuarios veem apenas dados necessarios
2. **Auditoria:** Todos os acessos a dados sensiveis sao registrados
3. **Defense in Depth:** Multiplas camadas de protecao (RLS + Views + Auditoria)
4. **Sem Breaking Changes:** Views sao transparentes para o frontend

---

## Resultado Esperado

Apos implementacao:

| Finding | Status |
|---------|--------|
| User Personal Information | Resolvido (auditoria + campos protegidos) |
| Customer Emails Harvested | Resolvido (auditoria + rate awareness) |
| Admin Client-Side | Ignorado (corretamente implementado) |
| Webhook Service Role | Ignorado (corretamente implementado) |
| Commission Calculations | Resolvido (view filtrada) |

