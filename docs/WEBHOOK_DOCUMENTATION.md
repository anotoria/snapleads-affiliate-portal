# SnapLeads Portal de Afiliados - Documentação do Webhook n8n v2.0

## Visão Geral

O webhook `n8n-webhook` é uma Edge Function do Supabase que permite integração externa com o sistema SnapLeads. Ele possibilita operações CRUD e ações especiais em 11 tabelas do sistema.

### Tabelas Suportadas

| Tabela | Descrição |
|--------|-----------|
| `users` | Gerenciamento de usuários (via Auth Admin API) |
| `profiles` | Perfis de afiliados |
| `leads` | Leads dos afiliados |
| `payouts` | Pagamentos aos afiliados |
| `tiers` | Níveis de parceria |
| `pricing_tiers` | Faixas de preço por acessos |
| `commission_history` | Histórico de comissões |
| `documents` | Documentos dos afiliados |
| `support_tickets` | Tickets de suporte |
| `support_messages` | Mensagens de tickets |
| `user_roles` | Papéis de usuário |

### Actions Suportadas

| Action | Descrição |
|--------|-----------|
| `insert` | Criar novo registro |
| `update` | Atualizar registro existente |
| `upsert` | Criar ou atualizar registro |
| `get` | Buscar registros |
| `delete` | Excluir registro |
| `calculate_tier` | Calcular nível do afiliado |
| `calculate_commission` | Registrar comissão mensal |
| `deactivate_user` | Desativar usuário |
| `activate_user` | Ativar usuário |
| `reset_password` | Redefinir senha |
| `get_admin_summary` | Obter resumo administrativo |

---

## Autenticação

### Autenticação Básica (Obrigatória)

Todas as requisições devem incluir o header de autenticação:

```
x-webhook-secret: <N8N_WEBHOOK_SECRET>
```

### Autenticação HMAC (Opcional)

Para maior segurança, você pode habilitar verificação HMAC adicionando os seguintes headers:

| Header | Descrição |
|--------|-----------|
| `x-webhook-signature` | Assinatura HMAC-SHA256 do payload |
| `x-webhook-timestamp` | Timestamp Unix da requisição (em segundos) |

**Secret para HMAC:** `N8N_WEBHOOK_HMAC_SECRET`

**Algoritmo de assinatura:**
```
signature = HMAC-SHA256(timestamp + "." + payload, secret)
```

**Janela de tempo:** 5 minutos (requisições com timestamp fora dessa janela serão rejeitadas)

---

## URL Base

```
POST https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook
```

---

## Estrutura da Requisição

### Headers Obrigatórios

| Header | Valor | Descrição |
|--------|-------|-----------|
| `Content-Type` | `application/json` | Tipo do conteúdo |
| `x-webhook-secret` | `<secret>` | Chave de autenticação |

### Headers Opcionais (HMAC)

| Header | Valor | Descrição |
|--------|-------|-----------|
| `x-webhook-signature` | `<signature>` | Assinatura HMAC |
| `x-webhook-timestamp` | `<unix_timestamp>` | Timestamp Unix |

### Payload Base

```json
{
  "action": "insert | update | upsert | get | delete | calculate_tier | calculate_commission | deactivate_user | activate_user | reset_password | get_admin_summary",
  "table": "users | profiles | leads | payouts | tiers | pricing_tiers | commission_history | documents | support_tickets | support_messages | user_roles",
  "data": { ... },
  "match": { ... },
  "filters": { ... }
}
```

---

## Tabelas Suportadas

### 1. Users (Usuários)

Gerencia usuários através da API de Autenticação Admin do Supabase.

#### Campos Disponíveis

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `email` | string | ✅ Sim | Email do usuário (máx. 255 caracteres) |
| `password` | string | ❌ Não | Senha (padrão: "TempPass123!") |
| `full_name` | string | ❌ Não | Nome completo (máx. 100 caracteres) |
| `company_name` | string | ❌ Não | Nome da empresa (máx. 200 caracteres) |
| `cnpj` | string | ❌ Não | CNPJ brasileiro (14 dígitos) |
| `phone` | string | ❌ Não | Telefone (10-15 dígitos) |
| `affiliate_code` | string | ❌ Não | Código de afiliado (máx. 255 caracteres) |
| `affiliate_url` | string | ❌ Não | URL de afiliado (prioridade sobre affiliate_code) |
| `tier_level` | string | ❌ Não | Nível do afiliado (silver, gold, platinum, diamond, titanium, audaks) |
| `role` | string | ❌ Não | Papel do usuário (admin, super_admin, user) |

#### Criar Usuário (insert)

```json
{
  "action": "insert",
  "table": "users",
  "data": {
    "email": "usuario@exemplo.com",
    "password": "SenhaSegura123!",
    "full_name": "Nome Completo",
    "company_name": "Empresa LTDA",
    "cnpj": "12345678901234",
    "phone": "11999998888",
    "affiliate_url": "https://snapleads.com/ref/codigo123",
    "tier_level": "silver",
    "role": "user"
  }
}
```

**Resposta de Sucesso:**

```json
{
  "success": true,
  "result": {
    "action": "user_created",
    "user_id": "uuid-do-usuario",
    "email": "usuario@exemplo.com",
    "must_change_password": true,
    "role": "user"
  }
}
```

#### Atualizar Usuário (update)

```json
{
  "action": "update",
  "table": "users",
  "data": {
    "email": "novoemail@exemplo.com",
    "full_name": "Novo Nome",
    "company_name": "Nova Empresa LTDA",
    "tier_level": "gold",
    "role": "admin"
  },
  "match": {
    "user_id": "uuid-do-usuario"
  }
}
```

**Match (identificador):**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `user_id` | UUID | ID do usuário |
| `email` | string | Email do usuário (alternativa) |

#### Buscar Usuários (get)

```json
{
  "action": "get",
  "table": "users",
  "filters": {
    "user_id": "uuid-especifico",
    "is_active": true,
    "tier_level": "gold",
    "created_after": "2024-01-01T00:00:00Z",
    "created_before": "2024-12-31T23:59:59Z",
    "limit": 50,
    "offset": 0
  }
}
```

**Resposta:**

```json
{
  "success": true,
  "result": {
    "action": "get",
    "table": "users",
    "data": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "full_name": "Nome",
        "company_name": "Empresa",
        "cnpj": "12345678901234",
        "phone": "11999998888",
        "affiliate_code": "codigo",
        "tier_level": "gold",
        "is_active": true,
        "avatar_url": "url",
        "must_change_password": false,
        "created_at": "2024-01-01T00:00:00Z",
        "email": "email@exemplo.com",
        "last_sign_in_at": "2024-01-15T00:00:00Z",
        "leads_count": 10,
        "active_leads": 8,
        "total_commission": 5000,
        "pending_payouts": 1000,
        "roles": ["admin"]
      }
    ],
    "count": 1,
    "filters": {}
  }
}
```

---

### 2. Profiles (Perfis)

Gerencia perfis de usuários.

#### Campos Disponíveis

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `user_id` | UUID | ID do usuário |
| `full_name` | string | Nome completo (máx. 100 caracteres) |
| `company_name` | string | Nome da empresa (máx. 200 caracteres) |
| `cnpj` | string | CNPJ (14 dígitos) |
| `phone` | string | Telefone (10-15 dígitos) |
| `avatar_url` | string | URL do avatar (máx. 500 caracteres) |
| `affiliate_code` | string | Código de afiliado (máx. 255 caracteres) |
| `tier_level` | string | Nível do afiliado |
| `is_active` | boolean | Status ativo/inativo |
| `must_change_password` | boolean | Flag de alteração de senha obrigatória |

#### Atualizar Profile (update)

```json
{
  "action": "update",
  "table": "profiles",
  "data": {
    "full_name": "Novo Nome",
    "company_name": "Nova Empresa",
    "cnpj": "12345678901234",
    "phone": "11999998888",
    "tier_level": "gold",
    "is_active": true
  },
  "match": {
    "user_id": "uuid-do-usuario"
  }
}
```

#### Buscar Profiles (get)

```json
{
  "action": "get",
  "table": "profiles",
  "filters": {
    "user_id": "uuid-do-usuario",
    "is_active": true,
    "tier_level": "gold",
    "created_after": "2024-01-01T00:00:00Z",
    "limit": 100
  }
}
```

---

### 3. Leads

Gerencia leads de afiliados.

#### Campos Disponíveis

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `user_id` | UUID | ✅ Sim | ID do afiliado responsável |
| `name` | string | ✅ Sim | Nome do lead (máx. 100 caracteres) |
| `email` | string | ✅ Sim | Email do lead (máx. 255 caracteres) |
| `status` | string | ❌ Não | Status do lead (padrão: "pending") |
| `commission` | number | ❌ Não | Valor da comissão (padrão: 0) |
| `access_count` | integer | ❌ Não | Quantidade de acessos |

**Status Válidos:**

| Status | Descrição |
|--------|-----------|
| `pending` | Pendente - aguardando processamento |
| `active` | Ativo - lead convertido/ativo |
| `inactive` | Inativo - lead cancelado/inativo |
| `late_payment` | Pagamento Atrasado |

#### Criar Lead (insert)

```json
{
  "action": "insert",
  "table": "leads",
  "data": {
    "user_id": "uuid-do-afiliado",
    "name": "Nome do Lead",
    "email": "lead@exemplo.com",
    "status": "pending",
    "commission": 1000.00,
    "access_count": 50
  }
}
```

#### Atualizar Lead (update)

```json
{
  "action": "update",
  "table": "leads",
  "data": {
    "status": "active",
    "commission": 1500.00,
    "access_count": 75
  },
  "match": {
    "id": "uuid-do-lead"
  }
}
```

#### Buscar Leads (get)

```json
{
  "action": "get",
  "table": "leads",
  "filters": {
    "user_id": "uuid-do-afiliado",
    "status": "active",
    "created_after": "2024-01-01T00:00:00Z",
    "limit": 100
  }
}
```

**Resposta:**

```json
{
  "success": true,
  "result": {
    "action": "get",
    "table": "leads",
    "data": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "name": "Nome do Lead",
        "email": "lead@exemplo.com",
        "status": "active",
        "commission": 1000.00,
        "access_count": 50,
        "monthly_value": 2500.00,
        "created_at": "2024-01-01T00:00:00Z",
        "profiles": {
          "full_name": "Nome do Afiliado",
          "affiliate_code": "codigo",
          "company_name": "Empresa",
          "tier_level": "gold"
        }
      }
    ],
    "count": 1
  }
}
```

---

### 4. Payouts (Pagamentos)

Gerencia pagamentos aos afiliados.

#### Campos Disponíveis

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `user_id` | UUID | ✅ Sim | ID do afiliado |
| `amount` | number | ✅ Sim | Valor do pagamento (deve ser > 0) |
| `status` | string | ❌ Não | Status do pagamento (padrão: "pending") |
| `method` | string | ❌ Não | Método de pagamento (padrão: "pix") |
| `completed_at` | timestamp | ❌ Não | Data de conclusão |

**Status Válidos:**

| Status | Descrição |
|--------|-----------|
| `pending` | Pendente |
| `processing` | Em processamento |
| `completed` | Concluído |
| `failed` | Falhou |
| `rejected` | Rejeitado |

**Métodos de Pagamento Válidos:**

| Método | Descrição |
|--------|-----------|
| `pix` | PIX |
| `bank_transfer` | Transferência Bancária |
| `paypal` | PayPal |

#### Criar Payout (insert)

```json
{
  "action": "insert",
  "table": "payouts",
  "data": {
    "user_id": "uuid-do-afiliado",
    "amount": 5000.00,
    "status": "pending",
    "method": "pix"
  }
}
```

#### Atualizar Payout (update)

```json
{
  "action": "update",
  "table": "payouts",
  "data": {
    "status": "completed",
    "completed_at": "2024-01-15T10:30:00Z"
  },
  "match": {
    "id": "uuid-do-payout"
  }
}
```

---

### 5. Tiers (Níveis de Parceria)

Gerencia os níveis de parceria do programa de afiliados.

#### Campos Disponíveis

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | string | ✅ Sim | Nome interno do tier (máx. 50 caracteres) |
| `display_name` | string | ✅ Sim | Nome de exibição (máx. 100 caracteres) |
| `min_revenue` | number | ✅ Sim | Receita mínima para o tier |
| `max_revenue` | number | ❌ Não | Receita máxima (null = ilimitado) |
| `commission_percentage` | number | ✅ Sim | Percentual de comissão (0-100) |
| `bonus_amount` | number | ❌ Não | Valor do bônus de tier |
| `color` | string | ✅ Sim | Cor do tier (máx. 20 caracteres) |
| `icon` | string | ❌ Não | Ícone do tier (máx. 50 caracteres) |
| `client_count` | integer | ❌ Não | Contagem de clientes |
| `sort_order` | integer | ❌ Não | Ordem de exibição |
| `is_active` | boolean | ❌ Não | Status ativo/inativo |

#### Buscar Tiers (get)

```json
{
  "action": "get",
  "table": "tiers",
  "filters": {
    "is_active": true
  }
}
```

**Resposta:**

```json
{
  "success": true,
  "result": {
    "action": "get",
    "table": "tiers",
    "data": [
      {
        "id": "uuid",
        "name": "silver",
        "display_name": "Silver",
        "min_revenue": 0,
        "max_revenue": 36000,
        "commission_percentage": 8,
        "bonus_amount": 0,
        "color": "#C0C0C0",
        "icon": "medal",
        "client_count": 0,
        "sort_order": 0,
        "is_active": true
      },
      {
        "id": "uuid",
        "name": "gold",
        "display_name": "Gold",
        "min_revenue": 36000,
        "max_revenue": 108000,
        "commission_percentage": 10,
        "bonus_amount": 5000,
        "color": "#FFD700",
        "icon": "trophy"
      }
    ],
    "count": 2
  }
}
```

#### Criar/Atualizar Tier (insert/update/upsert)

```json
{
  "action": "upsert",
  "table": "tiers",
  "data": {
    "name": "gold",
    "display_name": "Gold",
    "min_revenue": 36000,
    "max_revenue": 108000,
    "commission_percentage": 10,
    "bonus_amount": 5000,
    "color": "#FFD700",
    "icon": "trophy",
    "sort_order": 1,
    "is_active": true
  }
}
```

---

### 6. Pricing Tiers (Faixas de Preço)

Gerencia as faixas de preço baseadas em quantidade de acessos.

#### Campos Disponíveis

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `min_access` | integer | ✅ Sim | Mínimo de acessos |
| `max_access` | integer | ❌ Não | Máximo de acessos (null = ilimitado) |
| `monthly_price` | number | ✅ Sim | Preço mensal |
| `description` | string | ❌ Não | Descrição da faixa |
| `sort_order` | integer | ❌ Não | Ordem de exibição |
| `is_active` | boolean | ❌ Não | Status ativo/inativo |

#### Buscar Pricing Tiers (get)

```json
{
  "action": "get",
  "table": "pricing_tiers",
  "filters": {
    "is_active": true
  }
}
```

#### Criar/Atualizar Pricing Tier (insert/update)

```json
{
  "action": "insert",
  "table": "pricing_tiers",
  "data": {
    "min_access": 0,
    "max_access": 100,
    "monthly_price": 99.90,
    "description": "Plano Básico",
    "sort_order": 0,
    "is_active": true
  }
}
```

---

### 7. Commission History (Histórico de Comissões)

Gerencia o histórico de comissões calculadas.

#### Campos Disponíveis

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `user_id` | UUID | ✅ Sim | ID do afiliado |
| `reference_month` | string | ✅ Sim | Mês de referência (YYYY-MM) |
| `client_count` | integer | ❌ Não | Quantidade de clientes ativos |
| `base_revenue` | number | ❌ Não | Receita base do período |
| `tier_name` | string | ✅ Sim | Nome do tier no período |
| `commission_rate` | number | ✅ Sim | Taxa de comissão (0-100) |
| `commission_value` | number | ❌ Não | Valor da comissão |
| `bonus_value` | number | ❌ Não | Valor do bônus |
| `total_value` | number | ❌ Não | Valor total (comissão + bônus) |
| `status` | string | ❌ Não | Status (pending, processing, completed, rejected) |
| `notes` | string | ❌ Não | Observações (máx. 1000 caracteres) |
| `paid_at` | timestamp | ❌ Não | Data de pagamento |

#### Buscar Commission History (get)

```json
{
  "action": "get",
  "table": "commission_history",
  "filters": {
    "user_id": "uuid-do-afiliado",
    "status": "pending",
    "reference_month": "2024-01",
    "created_after": "2024-01-01T00:00:00Z",
    "limit": 50
  }
}
```

**Resposta:**

```json
{
  "success": true,
  "result": {
    "action": "get",
    "table": "commission_history",
    "data": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "reference_month": "2024-01",
        "client_count": 15,
        "base_revenue": 50000,
        "tier_name": "gold",
        "commission_rate": 10,
        "commission_value": 5000,
        "bonus_value": 0,
        "total_value": 5000,
        "status": "pending",
        "calculated_at": "2024-02-01T00:00:00Z",
        "profiles": {
          "full_name": "Nome do Afiliado",
          "company_name": "Empresa",
          "tier_level": "gold"
        }
      }
    ],
    "count": 1
  }
}
```

#### Inserir/Atualizar Commission History

```json
{
  "action": "insert",
  "table": "commission_history",
  "data": {
    "user_id": "uuid-do-afiliado",
    "reference_month": "2024-01",
    "client_count": 15,
    "base_revenue": 50000,
    "tier_name": "gold",
    "commission_rate": 10,
    "commission_value": 5000,
    "bonus_value": 5000,
    "total_value": 10000,
    "status": "pending"
  }
}
```

---

### 8. Documents (Documentos)

Gerencia documentos dos afiliados.

#### Campos Disponíveis

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `user_id` | UUID | ✅ Sim | ID do afiliado |
| `name` | string | ✅ Sim | Nome do documento (máx. 255 caracteres) |
| `file_url` | string | ✅ Sim | URL do arquivo (máx. 1000 caracteres) |
| `file_type` | string | ✅ Sim | Tipo do arquivo (máx. 20 caracteres) |
| `file_size` | integer | ❌ Não | Tamanho do arquivo em bytes |
| `category` | string | ❌ Não | Categoria (contract, report, invoice, other) |
| `uploaded_by` | UUID | ✅ Sim | ID do uploader |
| `is_public` | boolean | ❌ Não | Documento público (padrão: false) |

#### Buscar Documents (get)

```json
{
  "action": "get",
  "table": "documents",
  "filters": {
    "user_id": "uuid-do-afiliado",
    "category": "contract",
    "limit": 50
  }
}
```

#### Criar Document (insert)

```json
{
  "action": "insert",
  "table": "documents",
  "data": {
    "user_id": "uuid-do-afiliado",
    "name": "Contrato 2024",
    "file_url": "https://storage.example.com/contrato.pdf",
    "file_type": "pdf",
    "file_size": 1024000,
    "category": "contract",
    "uploaded_by": "uuid-do-admin",
    "is_public": false
  }
}
```

#### Excluir Document (delete)

```json
{
  "action": "delete",
  "table": "documents",
  "match": {
    "id": "uuid-do-documento"
  }
}
```

---

### 9. Support Tickets (Tickets de Suporte)

Gerencia tickets de suporte.

#### Campos Disponíveis

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `user_id` | UUID | ✅ Sim | ID do afiliado |
| `subject` | string | ✅ Sim | Assunto (máx. 255 caracteres) |
| `message` | string | ✅ Sim | Mensagem (máx. 5000 caracteres) |
| `priority` | string | ❌ Não | Prioridade (low, medium, high, urgent) |
| `status` | string | ❌ Não | Status (open, in_progress, waiting_user, resolved, closed) |
| `category` | string | ❌ Não | Categoria (general, technical, billing, other) |
| `assigned_to` | UUID | ❌ Não | ID do admin responsável |
| `resolution_notes` | string | ❌ Não | Notas de resolução |
| `resolved_at` | timestamp | ❌ Não | Data de resolução |

#### Buscar Support Tickets (get)

```json
{
  "action": "get",
  "table": "support_tickets",
  "filters": {
    "user_id": "uuid-do-afiliado",
    "status": "open",
    "priority": "high",
    "category": "technical",
    "limit": 50
  }
}
```

**Resposta:**

```json
{
  "success": true,
  "result": {
    "action": "get",
    "table": "support_tickets",
    "data": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "subject": "Problema com pagamento",
        "message": "Descrição do problema...",
        "priority": "high",
        "status": "open",
        "category": "billing",
        "created_at": "2024-01-15T10:00:00Z",
        "profiles": {
          "full_name": "Nome do Afiliado",
          "company_name": "Empresa"
        },
        "support_messages": [{ "count": 5 }]
      }
    ],
    "count": 1
  }
}
```

#### Criar Support Ticket (insert)

```json
{
  "action": "insert",
  "table": "support_tickets",
  "data": {
    "user_id": "uuid-do-afiliado",
    "subject": "Dúvida sobre comissões",
    "message": "Gostaria de entender melhor como funciona o cálculo de comissões.",
    "priority": "medium",
    "category": "general"
  }
}
```

#### Excluir Support Ticket (delete)

```json
{
  "action": "delete",
  "table": "support_tickets",
  "match": {
    "id": "uuid-do-ticket"
  }
}
```

---

### 10. Support Messages (Mensagens de Suporte)

Gerencia mensagens em tickets de suporte.

#### Campos Disponíveis

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `ticket_id` | UUID | ✅ Sim | ID do ticket |
| `user_id` | UUID | ✅ Sim | ID do autor |
| `message` | string | ✅ Sim | Mensagem (máx. 5000 caracteres) |
| `is_admin_reply` | boolean | ❌ Não | Se é resposta de admin |

#### Buscar Support Messages (get)

**Importante:** O filtro `ticket_id` é obrigatório para buscar mensagens.

```json
{
  "action": "get",
  "table": "support_messages",
  "filters": {
    "ticket_id": "uuid-do-ticket"
  }
}
```

**Resposta:**

```json
{
  "success": true,
  "result": {
    "action": "get",
    "table": "support_messages",
    "data": [
      {
        "id": "uuid",
        "ticket_id": "uuid",
        "user_id": "uuid",
        "message": "Mensagem do usuário...",
        "is_admin_reply": false,
        "created_at": "2024-01-15T10:00:00Z",
        "profiles": {
          "full_name": "Nome do Usuário"
        }
      }
    ],
    "count": 1
  }
}
```

#### Criar Support Message (insert)

```json
{
  "action": "insert",
  "table": "support_messages",
  "data": {
    "ticket_id": "uuid-do-ticket",
    "user_id": "uuid-do-usuario",
    "message": "Resposta ao ticket...",
    "is_admin_reply": true
  }
}
```

---

### 11. User Roles (Papéis de Usuário)

Gerencia papéis de usuário.

#### Campos Disponíveis

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `user_id` | UUID | ✅ Sim | ID do usuário |
| `role` | string | ✅ Sim | Papel (admin, super_admin, user) |
| `created_by` | UUID | ❌ Não | ID de quem criou |

#### Buscar User Roles (get)

```json
{
  "action": "get",
  "table": "user_roles",
  "filters": {
    "user_id": "uuid-do-usuario"
  }
}
```

#### Adicionar Role (insert)

```json
{
  "action": "insert",
  "table": "user_roles",
  "data": {
    "user_id": "uuid-do-usuario",
    "role": "admin",
    "created_by": "uuid-do-super-admin"
  }
}
```

#### Remover Role (delete)

```json
{
  "action": "delete",
  "table": "user_roles",
  "match": {
    "user_id": "uuid-do-usuario",
    "role": "admin"
  }
}
```

---

## Actions Especiais

### calculate_tier

Calcula e atualiza o nível do afiliado baseado na receita mensal dos leads ativos.

```json
{
  "action": "calculate_tier",
  "data": {
    "user_id": "uuid-do-afiliado"
  }
}
```

**Resposta:**

```json
{
  "success": true,
  "result": {
    "action": "tier_calculated",
    "user_id": "uuid",
    "monthly_revenue": 50000,
    "tier": "gold",
    "commission_percentage": 10,
    "bonus_eligible": false,
    "bonus_amount": 5000,
    "next_tier": {
      "name": "platinum",
      "min_revenue": 108000,
      "progress": 46.3
    }
  }
}
```

---

### calculate_commission

Registra a comissão mensal para um afiliado.

```json
{
  "action": "calculate_commission",
  "data": {
    "user_id": "uuid-do-afiliado",
    "reference_month": "2024-01"
  }
}
```

**Resposta:**

```json
{
  "success": true,
  "result": {
    "action": "commission_calculated",
    "data": {
      "id": "uuid",
      "user_id": "uuid",
      "reference_month": "2024-01",
      "client_count": 15,
      "base_revenue": 50000,
      "tier_name": "gold",
      "commission_rate": 10,
      "commission_value": 5000,
      "bonus_value": 0,
      "total_value": 5000,
      "status": "pending"
    }
  }
}
```

---

### deactivate_user

Desativa um usuário do sistema.

```json
{
  "action": "deactivate_user",
  "data": {
    "user_id": "uuid-do-usuario",
    "deactivated_by": "uuid-do-admin",
    "reason": "Motivo da desativação"
  }
}
```

**Resposta:**

```json
{
  "success": true,
  "result": {
    "action": "user_deactivated",
    "user_id": "uuid",
    "reason": "Motivo da desativação",
    "deactivated_at": "2024-01-15T10:00:00Z"
  }
}
```

---

### activate_user

Reativa um usuário desativado.

```json
{
  "action": "activate_user",
  "data": {
    "user_id": "uuid-do-usuario"
  }
}
```

**Resposta:**

```json
{
  "success": true,
  "result": {
    "action": "user_activated",
    "user_id": "uuid",
    "activated_at": "2024-01-15T10:00:00Z"
  }
}
```

---

### reset_password

Redefine a senha de um usuário.

```json
{
  "action": "reset_password",
  "data": {
    "user_id": "uuid-do-usuario",
    "new_password": "NovaSenha123!"
  }
}
```

**Nota:** Se `new_password` não for fornecido, será usada a senha temporária padrão "TempPass123!".

**Resposta:**

```json
{
  "success": true,
  "result": {
    "action": "password_reset",
    "user_id": "uuid",
    "must_change_password": true
  }
}
```

---

### get_admin_summary

Obtém um resumo administrativo com KPIs do sistema.

```json
{
  "action": "get_admin_summary"
}
```

**Resposta:**

```json
{
  "success": true,
  "result": {
    "action": "admin_summary",
    "affiliates": {
      "total": 100,
      "active": 85,
      "inactive": 15
    },
    "leads": {
      "total": 500,
      "active": 350,
      "pending": 100,
      "inactive": 50,
      "total_commission": 150000
    },
    "payouts": {
      "total": 200,
      "pending": 25,
      "processing": 10,
      "completed": 165,
      "pending_amount": 50000,
      "total_paid": 500000
    },
    "tickets": {
      "total": 150,
      "open": 20,
      "in_progress": 15,
      "resolved": 115
    },
    "commissions": {
      "total": 300,
      "pending": 30,
      "pending_value": 75000,
      "paid_value": 600000
    },
    "generated_at": "2024-01-15T10:00:00Z"
  }
}
```

---

## Filtros Disponíveis

Todos os filtros são opcionais para a ação `get`:

| Filtro | Tipo | Descrição | Tabelas |
|--------|------|-----------|---------|
| `user_id` | UUID | Filtrar por ID do usuário | Todas |
| `status` | string | Filtrar por status | leads, payouts, tickets, commissions |
| `is_active` | boolean | Filtrar por status ativo | profiles, users, tiers, pricing_tiers |
| `tier_level` | string | Filtrar por nível | profiles, users |
| `category` | string | Filtrar por categoria | documents, tickets |
| `priority` | string | Filtrar por prioridade | tickets |
| `ticket_id` | UUID | Filtrar por ticket (obrigatório para messages) | support_messages |
| `reference_month` | string | Filtrar por mês (YYYY-MM) | commission_history |
| `created_after` | timestamp | Data mínima de criação | Todas |
| `created_before` | timestamp | Data máxima de criação | Todas |
| `limit` | number | Limite de resultados (padrão: 100, máx: 1000) | Todas |
| `offset` | number | Offset para paginação (padrão: 0) | Todas |

---

## Validações de Dados

### Email
- Formato válido de email
- Máximo 255 caracteres

### UUID
- Formato válido de UUID v4

### CNPJ
- Exatamente 14 dígitos numéricos
- Não pode ser sequência repetida (ex: 11111111111111)

### Telefone
- Mínimo 10 dígitos
- Máximo 15 dígitos
- Apenas números são considerados

### URL
- Deve ser URL válida com protocolo http:// ou https://

### Mês de Referência (reference_month)
- Formato: YYYY-MM
- Ano entre 2000 e 2100
- Mês entre 01 e 12

### Valores Numéricos
- Comissões, valores e taxas devem ser não-negativos
- Percentuais (commission_percentage, commission_rate) entre 0 e 100

---

## Códigos de Resposta HTTP

| Código | Descrição |
|--------|-----------|
| `200` | Sucesso |
| `400` | Requisição inválida (dados ou parâmetros incorretos) |
| `401` | Não autorizado (webhook secret ou HMAC inválido) |
| `500` | Erro interno do servidor |

---

## Respostas de Erro

### Erro de Autenticação

```json
{
  "success": false,
  "error": "Unauthorized - Invalid webhook secret"
}
```

### Erro de HMAC

```json
{
  "success": false,
  "error": "Unauthorized - Invalid request signature"
}
```

### Erro de Validação

```json
{
  "success": false,
  "error": "Invalid email format"
}
```

### Erro de Campo Obrigatório

```json
{
  "success": false,
  "error": "Missing required field: action"
}
```

### Erro de Status Inválido

```json
{
  "success": false,
  "error": "Invalid status. Must be one of: pending, late_payment, active, inactive"
}
```

### Erro de CNPJ

```json
{
  "success": false,
  "error": "Invalid CNPJ format (must be 14 digits)"
}
```

### Erro de Telefone

```json
{
  "success": false,
  "error": "Invalid phone format (must be 10-15 digits)"
}
```

---

## Segurança Avançada

### Audit Logging

Todas as operações sensíveis são automaticamente registradas com:
- Timestamp
- Action executada
- Tabela afetada
- IP de origem
- User-Agent
- Status de sucesso/falha
- Detalhes adicionais

**Actions com logging:**
- insert, update, delete
- deactivate_user, activate_user
- reset_password
- calculate_commission

### Sanitização de Dados

Todos os campos de texto passam por:
- Remoção de tags HTML
- Remoção de scripts JavaScript
- Prevenção de XSS
- Truncamento para limite máximo de caracteres

---

## Exemplos Completos

### Exemplo 1: Criar Novo Afiliado Completo

```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: seu_secret_aqui' \
  -d '{
    "action": "insert",
    "table": "users",
    "data": {
      "email": "novo.afiliado@email.com",
      "password": "Senha@Segura123",
      "full_name": "João Silva",
      "company_name": "Silva Empreendimentos LTDA",
      "cnpj": "12345678901234",
      "phone": "11999998888",
      "affiliate_url": "https://snapleads.com/ref/joaosilva2024",
      "tier_level": "silver",
      "role": "user"
    }
  }'
```

### Exemplo 2: Buscar Afiliados Gold Ativos

```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: seu_secret_aqui' \
  -d '{
    "action": "get",
    "table": "users",
    "filters": {
      "is_active": true,
      "tier_level": "gold",
      "limit": 50
    }
  }'
```

### Exemplo 3: Registrar Lead com Acessos

```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: seu_secret_aqui' \
  -d '{
    "action": "insert",
    "table": "leads",
    "data": {
      "user_id": "uuid-do-afiliado",
      "name": "Maria Oliveira",
      "email": "maria@cliente.com",
      "status": "active",
      "commission": 1000.00,
      "access_count": 75
    }
  }'
```

### Exemplo 4: Calcular Comissão Mensal

```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: seu_secret_aqui' \
  -d '{
    "action": "calculate_commission",
    "data": {
      "user_id": "uuid-do-afiliado",
      "reference_month": "2024-01"
    }
  }'
```

### Exemplo 5: Obter Resumo Administrativo

```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: seu_secret_aqui' \
  -d '{
    "action": "get_admin_summary"
  }'
```

### Exemplo 6: Desativar Afiliado

```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: seu_secret_aqui' \
  -d '{
    "action": "deactivate_user",
    "data": {
      "user_id": "uuid-do-afiliado",
      "deactivated_by": "uuid-do-admin",
      "reason": "Inatividade por mais de 6 meses"
    }
  }'
```

### Exemplo 7: Adicionar Papel de Admin

```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: seu_secret_aqui' \
  -d '{
    "action": "insert",
    "table": "user_roles",
    "data": {
      "user_id": "uuid-do-usuario",
      "role": "admin",
      "created_by": "uuid-do-super-admin"
    }
  }'
```

### Exemplo 8: Criar Ticket de Suporte

```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: seu_secret_aqui' \
  -d '{
    "action": "insert",
    "table": "support_tickets",
    "data": {
      "user_id": "uuid-do-afiliado",
      "subject": "Problema com pagamento",
      "message": "Meu pagamento do mês passado ainda não foi processado.",
      "priority": "high",
      "category": "billing"
    }
  }'
```

---

## Tabelas Deletáveis

Apenas algumas tabelas permitem exclusão via webhook:

| Tabela | Pode Deletar |
|--------|--------------|
| `documents` | ✅ Sim |
| `support_tickets` | ✅ Sim |
| `support_messages` | ✅ Sim |
| `user_roles` | ✅ Sim |
| `users` | ❌ Não |
| `profiles` | ❌ Não |
| `leads` | ❌ Não |
| `payouts` | ❌ Não |
| `tiers` | ❌ Não |
| `pricing_tiers` | ❌ Não |
| `commission_history` | ❌ Não |

---

## Notas Importantes

1. **Affiliate URL vs Affiliate Code**: Quando `affiliate_url` é fornecido, ele tem prioridade sobre `affiliate_code`. O sistema extrai automaticamente o código da URL.

2. **Senha Temporária**: Se nenhuma senha for fornecida ao criar um usuário, uma senha temporária padrão é utilizada ("TempPass123!") e a flag `must_change_password` é definida como `true`.

3. **Email Auto-Confirmado**: Ao criar usuários, o email é automaticamente confirmado.

4. **Validação de UUIDs**: Todos os campos `user_id`, `id`, `ticket_id` devem ser UUIDs válidos.

5. **Limites de Caracteres**:
   - Email: máx. 255 caracteres
   - Nome: máx. 100 caracteres
   - Affiliate Code/URL: máx. 255 caracteres
   - Avatar URL: máx. 500 caracteres
   - File URL: máx. 1000 caracteres
   - Messages: máx. 5000 caracteres

6. **Paginação**: Use `limit` e `offset` para paginar resultados. O limite padrão é 100 registros, máximo é 1000.

7. **CNPJ**: Deve conter exatamente 14 dígitos numéricos.

8. **Telefone**: Deve conter entre 10 e 15 dígitos numéricos.

9. **Bônus de Tier**: O bônus é aplicado apenas na primeira vez que o afiliado atinge um novo tier.

10. **HMAC Opcional**: A verificação HMAC só é executada se os headers `x-webhook-signature` e `x-webhook-timestamp` estiverem presentes.

---

## Changelog

### v2.0 (Janeiro 2026)
- Adicionadas 7 novas tabelas: user_roles, tiers, pricing_tiers, commission_history, documents, support_tickets, support_messages
- Adicionadas 7 novas actions: delete, calculate_tier, calculate_commission, deactivate_user, activate_user, reset_password, get_admin_summary
- Novos campos de usuário: company_name, cnpj, phone, tier_level, role
- Validação de CNPJ e telefone
- Verificação de assinatura HMAC opcional
- Audit logging para operações sensíveis
- Sanitização de HTML/XSS
- Documentação expandida com exemplos

### v1.0 (Janeiro 2025)
- Versão inicial com suporte a users, profiles, leads, payouts
- Actions básicas: insert, update, upsert, get

---

## Suporte

Para questões relacionadas à integração, entre em contato com a equipe de desenvolvimento.

**Última atualização:** Janeiro 2026
