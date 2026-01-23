# SnapLeads Portal de Afiliados - Documentação do Webhook n8n

## Visão Geral

O webhook `n8n-webhook` é uma Edge Function do Supabase que permite integração externa com o sistema SnapLeads. Ele possibilita operações CRUD (Create, Read, Update, Delete) nas tabelas `profiles`, `leads`, `payouts` e `users`.

---

## Autenticação

Todas as requisições devem incluir o header de autenticação:

```
x-webhook-secret: <N8N_WEBHOOK_SECRET>
```

**Importante:** O valor do secret deve corresponder exatamente ao configurado no ambiente do Supabase.

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
| `x-webhook-secret` | `<secret>` | Chave de autenticação do webhook |

### Payload Base

```json
{
  "action": "insert | update | upsert | get",
  "table": "profiles | leads | payouts | users",
  "data": { ... },
  "match": { ... },
  "filters": { ... }
}
```

---

## Tabelas Suportadas

### 1. Users (Usuários)

Gerencia usuários através da API de Autenticação Admin do Supabase.

#### Criar Usuário (insert)

```json
{
  "action": "insert",
  "table": "users",
  "data": {
    "email": "usuario@exemplo.com",
    "password": "SenhaSegura123!",
    "full_name": "Nome Completo",
    "affiliate_code": "codigo_afiliado",
    "affiliate_url": "https://snapleads.com/ref/codigo123"
  }
}
```

**Campos:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `email` | string | ✅ Sim | Email do usuário (máx. 255 caracteres) |
| `password` | string | ❌ Não | Senha (padrão: "TempPass123!") |
| `full_name` | string | ❌ Não | Nome completo (máx. 100 caracteres) |
| `affiliate_code` | string | ❌ Não | Código de afiliado (máx. 255 caracteres) |
| `affiliate_url` | string | ❌ Não | URL de afiliado (tem prioridade sobre affiliate_code, máx. 255 caracteres) |

**Resposta de Sucesso:**

```json
{
  "success": true,
  "result": {
    "action": "user_created",
    "user_id": "uuid-do-usuario",
    "email": "usuario@exemplo.com",
    "must_change_password": true
  }
}
```

**Notas:**
- Se `affiliate_url` for fornecido, o sistema extrai o código de afiliado da URL
- A flag `must_change_password` é automaticamente definida como `true`
- O email é auto-confirmado

#### Atualizar Usuário (update)

```json
{
  "action": "update",
  "table": "users",
  "data": {
    "email": "novoemail@exemplo.com",
    "password": "NovaSenha456!",
    "full_name": "Novo Nome",
    "affiliate_code": "novo_codigo",
    "affiliate_url": "https://snapleads.com/ref/novocod"
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

**Resposta de Sucesso:**

```json
{
  "success": true,
  "result": {
    "action": "user_updated",
    "user_id": "uuid-do-usuario"
  }
}
```

#### Buscar Usuários (get)

```json
{
  "action": "get",
  "table": "users",
  "filters": {
    "user_id": "uuid-especifico",
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
        "affiliate_code": "codigo",
        "avatar_url": "url",
        "must_change_password": false,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "email": "email@exemplo.com",
        "last_sign_in_at": "2024-01-01T00:00:00Z",
        "created_at_auth": "2024-01-01T00:00:00Z",
        "leads": [{ "count": 10 }],
        "payouts": [{ "count": 5 }]
      }
    ],
    "count": 1,
    "filters": {}
  }
}
```

---

### 2. Leads

Gerencia leads de afiliados.

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
    "commission": 1000.00
  }
}
```

**Campos:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `user_id` | UUID | ✅ Sim | ID do afiliado responsável |
| `name` | string | ✅ Sim | Nome do lead (máx. 100 caracteres) |
| `email` | string | ✅ Sim | Email do lead (máx. 255 caracteres) |
| `status` | string | ❌ Não | Status do lead (padrão: "pending") |
| `commission` | number | ❌ Não | Valor da comissão (padrão: 0) |

**Status Válidos:**

| Status | Descrição |
|--------|-----------|
| `pending` | Pendente - aguardando processamento |
| `active` | Ativo - lead convertido/ativo |
| `inactive` | Inativo - lead cancelado/inativo |
| `late_payment` | Pagamento Atrasado |

#### Atualizar Lead (update)

```json
{
  "action": "update",
  "table": "leads",
  "data": {
    "status": "active",
    "commission": 1500.00
  },
  "match": {
    "id": "uuid-do-lead"
  }
}
```

#### Upsert Lead

```json
{
  "action": "upsert",
  "table": "leads",
  "data": {
    "id": "uuid-do-lead",
    "user_id": "uuid-do-afiliado",
    "name": "Nome Atualizado",
    "email": "lead@exemplo.com",
    "status": "active",
    "commission": 2000.00
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
    "created_before": "2024-12-31T23:59:59Z",
    "limit": 100,
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
    "table": "leads",
    "data": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "name": "Nome do Lead",
        "email": "lead@exemplo.com",
        "status": "active",
        "commission": 1000.00,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "profiles": {
          "full_name": "Nome do Afiliado",
          "affiliate_code": "codigo"
        }
      }
    ],
    "count": 1,
    "filters": {}
  }
}
```

---

### 3. Payouts (Pagamentos)

Gerencia pagamentos aos afiliados.

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

**Campos:**

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

**Métodos de Pagamento Válidos:**

| Método | Descrição |
|--------|-----------|
| `pix` | PIX |
| `bank_transfer` | Transferência Bancária |
| `paypal` | PayPal |

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

#### Buscar Payouts (get)

```json
{
  "action": "get",
  "table": "payouts",
  "filters": {
    "user_id": "uuid-do-afiliado",
    "status": "completed",
    "created_after": "2024-01-01T00:00:00Z",
    "created_before": "2024-12-31T23:59:59Z",
    "limit": 50,
    "offset": 0
  }
}
```

---

### 4. Profiles (Perfis)

Gerencia perfis de usuários.

#### Atualizar Profile (update)

```json
{
  "action": "update",
  "table": "profiles",
  "data": {
    "full_name": "Novo Nome",
    "avatar_url": "https://exemplo.com/avatar.jpg",
    "affiliate_code": "novo_codigo",
    "must_change_password": false
  },
  "match": {
    "user_id": "uuid-do-usuario"
  }
}
```

**Campos:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `full_name` | string | Nome completo (máx. 100 caracteres) |
| `avatar_url` | string | URL do avatar (máx. 500 caracteres) |
| `affiliate_code` | string | Código de afiliado (máx. 50 caracteres) |
| `must_change_password` | boolean | Flag de alteração de senha obrigatória |

#### Buscar Profiles (get)

```json
{
  "action": "get",
  "table": "profiles",
  "filters": {
    "user_id": "uuid-do-usuario",
    "created_after": "2024-01-01T00:00:00Z",
    "created_before": "2024-12-31T23:59:59Z",
    "limit": 100,
    "offset": 0
  }
}
```

---

## Filtros Disponíveis

Todos os filtros são opcionais para a ação `get`:

| Filtro | Tipo | Descrição | Tabelas |
|--------|------|-----------|---------|
| `user_id` | UUID | Filtrar por ID do usuário | Todas |
| `status` | string | Filtrar por status | leads, payouts |
| `created_after` | timestamp | Data mínima de criação | Todas |
| `created_before` | timestamp | Data máxima de criação | Todas |
| `limit` | number | Limite de resultados (padrão: 100) | Todas |
| `offset` | number | Offset para paginação (padrão: 0) | Todas |

---

## Códigos de Resposta HTTP

| Código | Descrição |
|--------|-----------|
| `200` | Sucesso |
| `400` | Requisição inválida (dados ou parâmetros incorretos) |
| `401` | Não autorizado (webhook secret inválido) |
| `500` | Erro interno do servidor |

---

## Respostas de Erro

### Erro de Autenticação

```json
{
  "error": "Unauthorized - Invalid webhook secret"
}
```

### Erro de Validação

```json
{
  "error": "Invalid email format"
}
```

### Erro de Campo Obrigatório

```json
{
  "error": "Missing required fields: action, table"
}
```

### Erro de Status Inválido

```json
{
  "error": "Invalid status. Must be one of: pending, late_payment, active, inactive"
}
```

---

## Exemplos Completos

### Exemplo 1: Criar Novo Afiliado com URL de Afiliado

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
      "affiliate_url": "https://snapleads.com/ref/joaosilva2024"
    }
  }'
```

### Exemplo 2: Atualizar URL de Afiliado de Usuário Existente

```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: seu_secret_aqui' \
  -d '{
    "action": "update",
    "table": "users",
    "data": {
      "affiliate_url": "https://snapleads.com/ref/novocod2024"
    },
    "match": {
      "email": "afiliado@email.com"
    }
  }'
```

### Exemplo 3: Registrar Novo Lead Ativo

```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: seu_secret_aqui' \
  -d '{
    "action": "insert",
    "table": "leads",
    "data": {
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Maria Oliveira",
      "email": "maria@cliente.com",
      "status": "active",
      "commission": 1000.00
    }
  }'
```

### Exemplo 4: Marcar Lead como Inativo

```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: seu_secret_aqui' \
  -d '{
    "action": "update",
    "table": "leads",
    "data": {
      "status": "inactive"
    },
    "match": {
      "id": "lead-uuid-aqui"
    }
  }'
```

### Exemplo 5: Buscar Todos os Leads Ativos de um Afiliado

```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: seu_secret_aqui' \
  -d '{
    "action": "get",
    "table": "leads",
    "filters": {
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "status": "active",
      "limit": 50
    }
  }'
```

### Exemplo 6: Criar Pagamento para Afiliado

```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: seu_secret_aqui' \
  -d '{
    "action": "insert",
    "table": "payouts",
    "data": {
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "amount": 5000.00,
      "method": "pix",
      "status": "processing"
    }
  }'
```

### Exemplo 7: Finalizar Pagamento

```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: seu_secret_aqui' \
  -d '{
    "action": "update",
    "table": "payouts",
    "data": {
      "status": "completed",
      "completed_at": "2024-01-15T14:30:00Z"
    },
    "match": {
      "id": "payout-uuid-aqui"
    }
  }'
```

---

## Notas Importantes

1. **Affiliate URL vs Affiliate Code**: Quando `affiliate_url` é fornecido, ele tem prioridade sobre `affiliate_code`. O sistema extrai automaticamente o código da URL.

2. **Senha Temporária**: Se nenhuma senha for fornecida ao criar um usuário, uma senha temporária padrão é utilizada ("TempPass123!") e a flag `must_change_password` é definida como `true`.

3. **Email Auto-Confirmado**: Ao criar usuários, o email é automaticamente confirmado.

4. **Validação de UUIDs**: Todos os campos `user_id` e `id` devem ser UUIDs válidos.

5. **Limites de Caracteres**:
   - Email: máx. 255 caracteres
   - Nome: máx. 100 caracteres
   - Affiliate Code/URL: máx. 255 caracteres
   - Avatar URL: máx. 500 caracteres

6. **Paginação**: Use `limit` e `offset` para paginar resultados. O limite padrão é 100 registros.

---

## Suporte

Para questões relacionadas à integração, entre em contato com a equipe de desenvolvimento.

**Última atualização:** Janeiro 2026
