# Guia Completo de Integração n8n - SnapLeads Portal de Afiliados

## Visão Geral

Este documento contém **todos os endpoints disponíveis** para integração via n8n com o sistema SnapLeads. Inclui cURLs prontos para uso e JSONs para configurar nos nodes HTTP Request do n8n.

---

## Configuração Base

### URL do Webhook
```
POST https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook
```

### Headers Obrigatórios
```
Content-Type: application/json
x-webhook-secret: <SEU_SECRET_AQUI>
```

### Headers Opcionais (HMAC para segurança extra)
```
x-webhook-signature: <assinatura_hmac>
x-webhook-timestamp: <timestamp_unix>
```

---

## 1. USUÁRIOS (Gestão Completa)

### 1.1 Criar Usuário Completo

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
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

**JSON para n8n:**
```json
{
  "action": "insert",
  "table": "users",
  "data": {
    "email": "={{$json.email}}",
    "password": "={{$json.password}}",
    "full_name": "={{$json.full_name}}",
    "company_name": "={{$json.company_name}}",
    "cnpj": "={{$json.cnpj}}",
    "phone": "={{$json.phone}}",
    "affiliate_url": "={{$json.affiliate_url}}",
    "tier_level": "silver",
    "role": "user"
  }
}
```

---

### 1.2 Criar Usuário sem Senha (Senha Temporária)

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "insert",
    "table": "users",
    "data": {
      "email": "afiliado@email.com",
      "full_name": "Maria Oliveira",
      "company_name": "Oliveira ME"
    }
  }'
```

> **Nota:** Usuário receberá senha temporária "TempPass123!" e flag `must_change_password: true`

---

### 1.3 Atualizar Usuário

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "update",
    "table": "users",
    "data": {
      "full_name": "João Carlos Silva",
      "company_name": "Nova Empresa LTDA",
      "phone": "11888887777",
      "tier_level": "gold"
    },
    "match": {
      "user_id": "uuid-do-usuario"
    }
  }'
```

**Atualizar por Email (alternativa):**
```json
{
  "action": "update",
  "table": "users",
  "data": {
    "full_name": "Nome Atualizado",
    "tier_level": "platinum"
  },
  "match": {
    "email": "usuario@email.com"
  }
}
```

---

### 1.4 Buscar Usuários (Vários Filtros)

**Todos os usuários ativos:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "get",
    "table": "users",
    "filters": {
      "is_active": true,
      "limit": 100
    }
  }'
```

**Usuários Gold ativos:**
```json
{
  "action": "get",
  "table": "users",
  "filters": {
    "is_active": true,
    "tier_level": "gold",
    "limit": 50
  }
}
```

**Usuário específico por ID:**
```json
{
  "action": "get",
  "table": "users",
  "filters": {
    "user_id": "uuid-especifico"
  }
}
```

**Usuários criados em período:**
```json
{
  "action": "get",
  "table": "users",
  "filters": {
    "created_after": "2026-01-01T00:00:00Z",
    "created_before": "2026-01-31T23:59:59Z",
    "limit": 100
  }
}
```

**Paginação:**
```json
{
  "action": "get",
  "table": "users",
  "filters": {
    "is_active": true,
    "limit": 50,
    "offset": 100
  }
}
```

---

### 1.5 Desativar Usuário

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "deactivate_user",
    "data": {
      "user_id": "uuid-do-usuario",
      "deactivated_by": "uuid-do-admin",
      "reason": "Inatividade por mais de 6 meses"
    }
  }'
```

---

### 1.6 Reativar Usuário

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "activate_user",
    "data": {
      "user_id": "uuid-do-usuario"
    }
  }'
```

---

### 1.7 Resetar Senha do Usuário

**Com senha personalizada:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "reset_password",
    "data": {
      "user_id": "uuid-do-usuario",
      "new_password": "NovaSenha@123"
    }
  }'
```

**Com senha temporária padrão:**
```json
{
  "action": "reset_password",
  "data": {
    "user_id": "uuid-do-usuario"
  }
}
```

---

### 1.8 Adicionar Role (Admin/Super Admin)

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
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

---

### 1.9 Remover Role

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "delete",
    "table": "user_roles",
    "match": {
      "user_id": "uuid-do-usuario",
      "role": "admin"
    }
  }'
```

---

## 2. CLIENTES/LEADS (Gestão Completa)

### 2.1 Criar Lead/Cliente Completo

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "insert",
    "table": "leads",
    "data": {
      "user_id": "uuid-do-afiliado",
      "name": "Cliente Exemplo",
      "email": "cliente@empresa.com",
      "status": "pending",
      "commission": 0,
      "access_count": 50
    }
  }'
```

**JSON para n8n:**
```json
{
  "action": "insert",
  "table": "leads",
  "data": {
    "user_id": "={{$json.affiliate_user_id}}",
    "name": "={{$json.client_name}}",
    "email": "={{$json.client_email}}",
    "status": "pending",
    "commission": 0,
    "access_count": "={{$json.access_count}}"
  }
}
```

---

### 2.2 Ativar Lead/Cliente

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "update",
    "table": "leads",
    "data": {
      "status": "active"
    },
    "match": {
      "id": "uuid-do-lead"
    }
  }'
```

---

### 2.3 Inativar Lead/Cliente

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "update",
    "table": "leads",
    "data": {
      "status": "inactive"
    },
    "match": {
      "id": "uuid-do-lead"
    }
  }'
```

---

### 2.4 Marcar Cliente com Pagamento Atrasado

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "update",
    "table": "leads",
    "data": {
      "status": "late_payment"
    },
    "match": {
      "id": "uuid-do-lead"
    }
  }'
```

---

### 2.5 Atualizar Dados Completos do Lead

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "update",
    "table": "leads",
    "data": {
      "name": "Nome Atualizado",
      "email": "novoemail@cliente.com",
      "status": "active",
      "commission": 1500.00,
      "access_count": 120
    },
    "match": {
      "id": "uuid-do-lead"
    }
  }'
```

---

### 2.6 Buscar Leads (Vários Filtros)

**Todos os leads de um afiliado:**
```json
{
  "action": "get",
  "table": "leads",
  "filters": {
    "user_id": "uuid-do-afiliado",
    "limit": 100
  }
}
```

**Leads ativos:**
```json
{
  "action": "get",
  "table": "leads",
  "filters": {
    "status": "active",
    "limit": 100
  }
}
```

**Leads pendentes:**
```json
{
  "action": "get",
  "table": "leads",
  "filters": {
    "status": "pending",
    "limit": 100
  }
}
```

**Leads com pagamento atrasado:**
```json
{
  "action": "get",
  "table": "leads",
  "filters": {
    "status": "late_payment",
    "limit": 100
  }
}
```

**Leads de um afiliado específico por status:**
```json
{
  "action": "get",
  "table": "leads",
  "filters": {
    "user_id": "uuid-do-afiliado",
    "status": "active",
    "limit": 100
  }
}
```

---

### 2.7 Upsert Lead (Criar ou Atualizar)

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "upsert",
    "table": "leads",
    "data": {
      "user_id": "uuid-do-afiliado",
      "name": "Cliente Upsert",
      "email": "cliente@email.com",
      "status": "active",
      "commission": 1000.00,
      "access_count": 75
    }
  }'
```

---

## 3. PAGAMENTOS (Payouts)

### 3.1 Criar Solicitação de Pagamento

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "insert",
    "table": "payouts",
    "data": {
      "user_id": "uuid-do-afiliado",
      "amount": 5000.00,
      "status": "pending",
      "method": "pix"
    }
  }'
```

---

### 3.2 Marcar Pagamento como Processando

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "update",
    "table": "payouts",
    "data": {
      "status": "processing"
    },
    "match": {
      "id": "uuid-do-payout"
    }
  }'
```

---

### 3.3 Concluir Pagamento

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "update",
    "table": "payouts",
    "data": {
      "status": "completed",
      "completed_at": "2026-01-28T15:30:00Z"
    },
    "match": {
      "id": "uuid-do-payout"
    }
  }'
```

---

### 3.4 Rejeitar Pagamento

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "update",
    "table": "payouts",
    "data": {
      "status": "rejected"
    },
    "match": {
      "id": "uuid-do-payout"
    }
  }'
```

---

### 3.5 Buscar Pagamentos

**Pagamentos pendentes:**
```json
{
  "action": "get",
  "table": "payouts",
  "filters": {
    "status": "pending",
    "limit": 100
  }
}
```

**Pagamentos de um afiliado:**
```json
{
  "action": "get",
  "table": "payouts",
  "filters": {
    "user_id": "uuid-do-afiliado",
    "limit": 50
  }
}
```

---

## 4. COMISSÕES

### 4.1 Calcular Comissão Mensal

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "calculate_commission",
    "data": {
      "user_id": "uuid-do-afiliado",
      "reference_month": "2026-01"
    }
  }'
```

---

### 4.2 Calcular Tier do Afiliado

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "calculate_tier",
    "data": {
      "user_id": "uuid-do-afiliado"
    }
  }'
```

---

### 4.3 Inserir Comissão Manual

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "insert",
    "table": "commission_history",
    "data": {
      "user_id": "uuid-do-afiliado",
      "reference_month": "2026-01",
      "client_count": 15,
      "base_revenue": 50000,
      "tier_name": "gold",
      "commission_rate": 10,
      "commission_value": 5000,
      "bonus_value": 5000,
      "total_value": 10000,
      "status": "pending"
    }
  }'
```

---

### 4.4 Atualizar Status da Comissão

**Marcar como pago:**
```json
{
  "action": "update",
  "table": "commission_history",
  "data": {
    "status": "completed",
    "paid_at": "2026-01-28T15:30:00Z"
  },
  "match": {
    "id": "uuid-da-comissao"
  }
}
```

---

### 4.5 Buscar Comissões

**Por afiliado:**
```json
{
  "action": "get",
  "table": "commission_history",
  "filters": {
    "user_id": "uuid-do-afiliado",
    "limit": 50
  }
}
```

**Por mês de referência:**
```json
{
  "action": "get",
  "table": "commission_history",
  "filters": {
    "reference_month": "2026-01",
    "limit": 100
  }
}
```

**Pendentes:**
```json
{
  "action": "get",
  "table": "commission_history",
  "filters": {
    "status": "pending",
    "limit": 100
  }
}
```

---

## 5. TIERS (Níveis de Parceria)

### 5.1 Criar Tier

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "insert",
    "table": "tiers",
    "data": {
      "name": "emerald",
      "display_name": "Emerald",
      "min_revenue": 200000,
      "max_revenue": 500000,
      "commission_percentage": 15,
      "bonus_amount": 20000,
      "color": "#50C878",
      "icon": "gem",
      "sort_order": 5,
      "is_active": true
    }
  }'
```

---

### 5.2 Atualizar Tier

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "update",
    "table": "tiers",
    "data": {
      "commission_percentage": 12,
      "bonus_amount": 8000
    },
    "match": {
      "name": "gold"
    }
  }'
```

---

### 5.3 Buscar Tiers

**Todos os tiers ativos:**
```json
{
  "action": "get",
  "table": "tiers",
  "filters": {
    "is_active": true
  }
}
```

---

## 6. PRICING TIERS (Faixas de Preço)

### 6.1 Criar Faixa de Preço

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
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
  }'
```

---

### 6.2 Buscar Faixas de Preço

```json
{
  "action": "get",
  "table": "pricing_tiers",
  "filters": {
    "is_active": true
  }
}
```

---

## 7. DOCUMENTOS

### 7.1 Criar Documento

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "insert",
    "table": "documents",
    "data": {
      "user_id": "uuid-do-afiliado",
      "name": "Contrato 2026",
      "file_url": "https://storage.example.com/contrato.pdf",
      "file_type": "pdf",
      "file_size": 1024000,
      "category": "contract",
      "uploaded_by": "uuid-do-admin",
      "is_public": true
    }
  }'
```

---

### 7.2 Buscar Documentos

**Por afiliado:**
```json
{
  "action": "get",
  "table": "documents",
  "filters": {
    "user_id": "uuid-do-afiliado",
    "limit": 50
  }
}
```

**Por categoria:**
```json
{
  "action": "get",
  "table": "documents",
  "filters": {
    "category": "contract",
    "limit": 50
  }
}
```

---

### 7.3 Excluir Documento

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "delete",
    "table": "documents",
    "match": {
      "id": "uuid-do-documento"
    }
  }'
```

---

## 8. SUPORTE (Tickets e Mensagens)

### 8.1 Criar Ticket de Suporte

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
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

### 8.2 Atualizar Status do Ticket

**Em progresso:**
```json
{
  "action": "update",
  "table": "support_tickets",
  "data": {
    "status": "in_progress",
    "assigned_to": "uuid-do-admin"
  },
  "match": {
    "id": "uuid-do-ticket"
  }
}
```

**Resolvido:**
```json
{
  "action": "update",
  "table": "support_tickets",
  "data": {
    "status": "resolved",
    "resolution_notes": "Pagamento processado com sucesso.",
    "resolved_at": "2026-01-28T16:00:00Z"
  },
  "match": {
    "id": "uuid-do-ticket"
  }
}
```

---

### 8.3 Buscar Tickets

**Tickets abertos:**
```json
{
  "action": "get",
  "table": "support_tickets",
  "filters": {
    "status": "open",
    "limit": 50
  }
}
```

**Tickets de alta prioridade:**
```json
{
  "action": "get",
  "table": "support_tickets",
  "filters": {
    "priority": "high",
    "status": "open",
    "limit": 50
  }
}
```

---

### 8.4 Adicionar Mensagem ao Ticket

**Resposta do Admin:**
```json
{
  "action": "insert",
  "table": "support_messages",
  "data": {
    "ticket_id": "uuid-do-ticket",
    "user_id": "uuid-do-admin",
    "message": "Estamos analisando o seu caso e retornaremos em breve.",
    "is_admin_reply": true
  }
}
```

---

### 8.5 Buscar Mensagens de um Ticket

```json
{
  "action": "get",
  "table": "support_messages",
  "filters": {
    "ticket_id": "uuid-do-ticket"
  }
}
```

---

### 8.6 Excluir Ticket

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

## 9. TRILHAS DE APRENDIZADO

### 9.1 Criar Trilha

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "insert",
    "table": "learning_tracks",
    "data": {
      "title": "Introdução ao Programa de Afiliados",
      "description": "Aprenda os conceitos básicos do programa...",
      "cover_url": "https://storage.example.com/covers/track1.jpg",
      "is_active": true,
      "is_featured": true,
      "sort_order": 1
    }
  }'
```

---

### 9.2 Buscar Trilhas

**Trilhas em destaque:**
```json
{
  "action": "get",
  "table": "learning_tracks",
  "filters": {
    "is_active": true,
    "is_featured": true
  }
}
```

---

### 9.3 Criar Módulo

```json
{
  "action": "insert",
  "table": "learning_modules",
  "data": {
    "track_id": "uuid-da-trilha",
    "title": "Módulo 1: Fundamentos",
    "description": "Neste módulo você aprenderá os fundamentos...",
    "is_active": true,
    "sort_order": 1
  }
}
```

---

### 9.4 Buscar Módulos de uma Trilha

```json
{
  "action": "get",
  "table": "learning_modules",
  "filters": {
    "track_id": "uuid-da-trilha",
    "is_active": true
  }
}
```

---

### 9.5 Criar Conteúdo de Vídeo

```json
{
  "action": "insert",
  "table": "learning_contents",
  "data": {
    "module_id": "uuid-do-modulo",
    "title": "Bem-vindo ao Programa",
    "description": "Vídeo de boas-vindas ao programa de afiliados",
    "content_type": "video",
    "video_url": "https://www.youtube.com/watch?v=example",
    "duration_minutes": 10,
    "is_active": true,
    "sort_order": 1
  }
}
```

---

### 9.6 Criar Conteúdo de Texto

```json
{
  "action": "insert",
  "table": "learning_contents",
  "data": {
    "module_id": "uuid-do-modulo",
    "title": "Guia de Referência",
    "description": "Material de leitura complementar",
    "content_type": "text",
    "text_content": "<h2>Introdução</h2><p>Este é o guia de referência...</p>",
    "duration_minutes": 5,
    "is_active": true,
    "sort_order": 2
  }
}
```

---

### 9.7 Buscar Conteúdos de um Módulo

```json
{
  "action": "get",
  "table": "learning_contents",
  "filters": {
    "module_id": "uuid-do-modulo",
    "is_active": true
  }
}
```

---

### 9.8 Excluir Trilha/Módulo/Conteúdo

```json
{
  "action": "delete",
  "table": "learning_tracks",
  "match": {
    "id": "uuid-da-trilha"
  }
}
```

---

## 10. BIBLIOTECA DE MÍDIAS

### 10.1 Criar Categoria de Mídia

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "insert",
    "table": "media_categories",
    "data": {
      "name": "banners-promocionais",
      "display_name": "Banners Promocionais",
      "type": "photo",
      "description": "Banners para redes sociais e anúncios",
      "cover_url": "https://storage.example.com/covers/banners.jpg",
      "is_active": true,
      "sort_order": 1
    }
  }'
```

---

### 10.2 Buscar Categorias por Tipo

**Fotos:**
```json
{
  "action": "get",
  "table": "media_categories",
  "filters": {
    "type": "photo",
    "is_active": true
  }
}
```

**Vídeos:**
```json
{
  "action": "get",
  "table": "media_categories",
  "filters": {
    "type": "video",
    "is_active": true
  }
}
```

**Arquivos:**
```json
{
  "action": "get",
  "table": "media_categories",
  "filters": {
    "type": "file",
    "is_active": true
  }
}
```

---

### 10.3 Criar Item de Mídia (Imagem)

```json
{
  "action": "insert",
  "table": "media_items",
  "data": {
    "category_id": "uuid-da-categoria",
    "title": "Banner Promocional Janeiro",
    "description": "Banner para redes sociais - Janeiro 2026",
    "file_url": "https://storage.example.com/media/banner-jan.jpg",
    "thumbnail_url": "https://storage.example.com/thumbnails/banner-jan-thumb.jpg",
    "file_type": "jpg",
    "file_size": 245000,
    "media_type": "photo",
    "dimensions": {"width": 1200, "height": 628},
    "is_active": true,
    "sort_order": 1
  }
}
```

---

### 10.4 Criar Item de Mídia (Vídeo)

```json
{
  "action": "insert",
  "table": "media_items",
  "data": {
    "category_id": "uuid-da-categoria",
    "title": "Vídeo Institucional",
    "description": "Vídeo de apresentação da empresa",
    "file_url": "https://storage.example.com/media/video.mp4",
    "thumbnail_url": "https://storage.example.com/thumbnails/video-thumb.jpg",
    "file_type": "mp4",
    "file_size": 52428800,
    "media_type": "video",
    "duration_seconds": 120,
    "is_active": true,
    "sort_order": 1
  }
}
```

---

### 10.5 Buscar Itens por Categoria

```json
{
  "action": "get",
  "table": "media_items",
  "filters": {
    "category_id": "uuid-da-categoria",
    "is_active": true,
    "limit": 50
  }
}
```

---

### 10.6 Buscar Itens por Tipo de Mídia

```json
{
  "action": "get",
  "table": "media_items",
  "filters": {
    "media_type": "photo",
    "is_active": true,
    "limit": 50
  }
}
```

---

### 10.7 Excluir Item de Mídia

```json
{
  "action": "delete",
  "table": "media_items",
  "match": {
    "id": "uuid-do-item"
  }
}
```

---

## 11. AÇÕES ADMINISTRATIVAS

### 11.1 Obter Resumo Administrativo (Dashboard)

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "get_admin_summary"
  }'
```

**Resposta esperada:**
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
    "generated_at": "2026-01-28T16:00:00Z"
  }
}
```

---

## 12. PROFILES (Perfis - Atualização Direta)

### 12.1 Atualizar Profile

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "update",
    "table": "profiles",
    "data": {
      "full_name": "Nome Atualizado",
      "company_name": "Nova Empresa",
      "cnpj": "98765432109876",
      "phone": "11888887777",
      "avatar_url": "https://storage.example.com/avatars/foto.jpg",
      "tier_level": "platinum"
    },
    "match": {
      "user_id": "uuid-do-usuario"
    }
  }'
```

---

### 12.2 Buscar Profiles

**Por tier:**
```json
{
  "action": "get",
  "table": "profiles",
  "filters": {
    "tier_level": "gold",
    "is_active": true,
    "limit": 100
  }
}
```

---

## RESUMO DE TABELAS E AÇÕES

| Tabela | insert | update | upsert | get | delete |
|--------|--------|--------|--------|-----|--------|
| users | ✅ | ✅ | ❌ | ✅ | ❌ |
| profiles | ❌ | ✅ | ✅ | ✅ | ❌ |
| leads | ✅ | ✅ | ✅ | ✅ | ❌ |
| payouts | ✅ | ✅ | ✅ | ✅ | ❌ |
| tiers | ✅ | ✅ | ✅ | ✅ | ❌ |
| pricing_tiers | ✅ | ✅ | ✅ | ✅ | ❌ |
| commission_history | ✅ | ✅ | ✅ | ✅ | ❌ |
| documents | ✅ | ✅ | ✅ | ✅ | ✅ |
| support_tickets | ✅ | ✅ | ✅ | ✅ | ✅ |
| support_messages | ✅ | ❌ | ❌ | ✅ | ✅ |
| user_roles | ✅ | ✅ | ✅ | ✅ | ✅ |
| learning_tracks | ✅ | ✅ | ✅ | ✅ | ✅ |
| learning_modules | ✅ | ✅ | ✅ | ✅ | ✅ |
| learning_contents | ✅ | ✅ | ✅ | ✅ | ✅ |
| media_categories | ✅ | ✅ | ✅ | ✅ | ✅ |
| media_items | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## AÇÕES ESPECIAIS

| Action | Descrição |
|--------|-----------|
| `calculate_tier` | Calcular tier do afiliado com base nos leads ativos |
| `calculate_commission` | Registrar comissão mensal para um afiliado |
| `deactivate_user` | Desativar usuário (marca is_active=false) |
| `activate_user` | Reativar usuário (marca is_active=true) |
| `reset_password` | Resetar senha do usuário |
| `get_admin_summary` | Dashboard administrativo com métricas gerais |
| `generate_sa_snapshot` | Gerar snapshot de comissões SA |

---

## STATUS VÁLIDOS

### Leads
- `pending` - Aguardando ativação
- `active` - Cliente ativo
- `inactive` - Cliente inativo
- `late_payment` - Pagamento atrasado

### Payouts
- `pending` - Aguardando processamento
- `processing` - Em processamento
- `completed` - Pagamento concluído
- `failed` - Falha no pagamento
- `rejected` - Pagamento rejeitado

### Tickets
- `open` - Aberto
- `in_progress` - Em andamento
- `waiting_user` - Aguardando usuário
- `resolved` - Resolvido
- `closed` - Fechado

### Commission History
- `pending` - Aguardando pagamento
- `processing` - Em processamento
- `completed` - Pago
- `rejected` - Rejeitado

---

## TIER LEVELS VÁLIDOS

| Nível | Comissão | Requisito (Leads Ativos) |
|-------|----------|-------------------------|
| `silver` | 8% | 0-5 leads |
| `gold` | 10% | 5-20 leads |
| `platinum` | 12% | 20-30 leads |
| `diamond` | 14% | 30-40 leads |
| `titanium` | 16% | 40+ leads |
| `audaks` | 18% | Elite (convite) |

---

## MÉTODOS DE PAGAMENTO

- `pix` - PIX (padrão)
- `bank_transfer` - Transferência bancária
- `paypal` - PayPal

---

## TIPOS DE MÍDIA

- `photo` - Imagens (jpg, png, gif, webp)
- `video` - Vídeos (mp4, mov, avi)
- `file` - Arquivos (pdf, doc, xls, zip)

---

## CATEGORIAS DE DOCUMENTOS

- `contract` - Contratos
- `report` - Relatórios
- `invoice` - Faturas
- `other` - Outros

---

## CATEGORIAS DE TICKETS

- `general` - Geral
- `technical` - Técnico
- `billing` - Financeiro
- `other` - Outro

---

## PRIORIDADES DE TICKETS

- `low` - Baixa
- `medium` - Média
- `high` - Alta
- `urgent` - Urgente

---

## ROLES DE USUÁRIO

- `user` - Usuário comum (afiliado)
- `admin` - Administrador
- `super_admin` - Super Administrador

---

## VALIDAÇÕES IMPORTANTES

### CNPJ
- Deve conter exatamente 14 dígitos numéricos

### Telefone
- Mínimo 10 caracteres
- Máximo 20 caracteres
- Apenas números, espaços, traços e parênteses

### Email
- Deve ser um email válido
- Máximo 255 caracteres

### URL
- Deve começar com `http://` ou `https://`
- Máximo 1000 caracteres

### Valores Numéricos
- `commission`: 0 a 10.000.000
- `amount`: 0 a 100.000.000
- `access_count`: 0 a 10.000.000
- `file_size`: 0 a 10GB

---

## SEGURANÇA

### Autenticação
Todas as requisições devem incluir o header `x-webhook-secret` com o secret configurado.

### HMAC (Opcional)
Para segurança adicional, você pode usar verificação HMAC:

```
x-webhook-signature: sha256=<hmac_signature>
x-webhook-timestamp: <unix_timestamp>
```

A assinatura é calculada sobre o body da requisição + timestamp.

### Auditoria
Todas as requisições são registradas no log de auditoria com:
- IP de origem
- Ação executada
- Tabela afetada
- Resultado da operação
- Timestamp

---

## CÓDIGOS DE RESPOSTA

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 400 | Dados inválidos ou ação não suportada |
| 401 | Secret inválido |
| 404 | Registro não encontrado |
| 500 | Erro interno |

---

## EXEMPLOS DE FLUXO N8N

### Fluxo: Onboarding de Novo Afiliado

1. **Trigger**: Formulário Google / Typeform
2. **HTTP Request**: Criar usuário
3. **IF**: Verificar sucesso
4. **HTTP Request**: Enviar email de boas-vindas
5. **HTTP Request**: Criar documento de contrato

### Fluxo: Processamento Mensal de Comissões

1. **Schedule Trigger**: Todo dia 1 às 00:00
2. **HTTP Request**: GET todos afiliados ativos
3. **Split In Batches**: Processar em lotes
4. **HTTP Request**: calculate_commission para cada
5. **HTTP Request**: Notificar afiliados

### Fluxo: Sincronização de Leads

1. **Webhook**: Receber dados do CRM externo
2. **HTTP Request**: Upsert lead
3. **IF**: Lead ativou?
4. **HTTP Request**: calculate_tier do afiliado
5. **HTTP Request**: Notificar afiliado sobre upgrade

---

**Documento gerado em:** Janeiro 2026  
**Versão do Webhook:** v2.1  
**Última atualização:** 28/01/2026
