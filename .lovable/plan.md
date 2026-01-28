

# Guia Completo de Integracao n8n - SnapLeads Portal de Afiliados

## Visao Geral

Este documento contem **todos os endpoints disponiveis** para integracao via n8n com o sistema SnapLeads. Inclui cURLs prontos para uso e JSONs para configurar nos nodes HTTP Request do n8n.

---

## Configuracao Base

### URL do Webhook
```
POST https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook
```

### Headers Obrigatorios
```
Content-Type: application/json
x-webhook-secret: <SEU_SECRET_AQUI>
```

### Headers Opcionais (HMAC para seguranca extra)
```
x-webhook-signature: <assinatura_hmac>
x-webhook-timestamp: <timestamp_unix>
```

---

## 1. USUARIOS (Gestao Completa)

### 1.1 Criar Usuario Completo

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
      "full_name": "Joao Silva",
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
    "email": "{{$json.email}}",
    "password": "{{$json.password}}",
    "full_name": "{{$json.full_name}}",
    "company_name": "{{$json.company_name}}",
    "cnpj": "{{$json.cnpj}}",
    "phone": "{{$json.phone}}",
    "affiliate_url": "{{$json.affiliate_url}}",
    "tier_level": "silver",
    "role": "user"
  }
}
```

---

### 1.2 Criar Usuario sem Senha (Senha Temporaria)

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

> **Nota:** Usuario recebera senha temporaria "TempPass123!" e flag `must_change_password: true`

---

### 1.3 Atualizar Usuario

**cURL:**
```bash
curl -X POST 'https://fgrgyblddyiswdsbjrcl.supabase.co/functions/v1/n8n-webhook' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: SEU_SECRET' \
  -d '{
    "action": "update",
    "table": "users",
    "data": {
      "full_name": "Joao Carlos Silva",
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

### 1.4 Buscar Usuarios (Varios Filtros)

**Todos os usuarios ativos:**
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

**Usuarios Gold ativos:**
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

**Usuario especifico por ID:**
```json
{
  "action": "get",
  "table": "users",
  "filters": {
    "user_id": "uuid-especifico"
  }
}
```

**Usuarios criados em periodo:**
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

**Paginacao:**
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

### 1.5 Desativar Usuario

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

### 1.6 Reativar Usuario

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

### 1.7 Resetar Senha do Usuario

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

**Com senha temporaria padrao:**
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

## 2. CLIENTES/LEADS (Gestao Completa)

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
    "user_id": "{{$json.affiliate_user_id}}",
    "name": "{{$json.client_name}}",
    "email": "{{$json.client_email}}",
    "status": "pending",
    "commission": 0,
    "access_count": "{{$json.access_count}}"
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

### 2.6 Buscar Leads (Varios Filtros)

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

**Leads de um afiliado especifico por status:**
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

### 3.1 Criar Solicitacao de Pagamento

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

## 4. COMISSOES

### 4.1 Calcular Comissao Mensal

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

### 4.3 Inserir Comissao Manual

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

### 4.4 Atualizar Status da Comissao

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

### 4.5 Buscar Comissoes

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

**Por mes de referencia:**
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

## 5. TIERS (Niveis de Parceria)

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

## 6. PRICING TIERS (Faixas de Preco)

### 6.1 Criar Faixa de Preco

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
      "description": "Plano Basico",
      "sort_order": 0,
      "is_active": true
    }
  }'
```

---

### 6.2 Buscar Faixas de Preco

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
      "message": "Meu pagamento do mes passado ainda nao foi processado.",
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
      "title": "Introducao ao Programa de Afiliados",
      "description": "Aprenda os conceitos basicos do programa...",
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

### 9.3 Criar Modulo

```json
{
  "action": "insert",
  "table": "learning_modules",
  "data": {
    "track_id": "uuid-da-trilha",
    "title": "Modulo 1: Fundamentos",
    "description": "Neste modulo voce aprendera os fundamentos...",
    "is_active": true,
    "sort_order": 1
  }
}
```

---

### 9.4 Buscar Modulos de uma Trilha

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

### 9.5 Criar Conteudo de Video

```json
{
  "action": "insert",
  "table": "learning_contents",
  "data": {
    "module_id": "uuid-do-modulo",
    "title": "Bem-vindo ao Programa",
    "description": "Video de boas-vindas ao programa de afiliados",
    "content_type": "video",
    "video_url": "https://www.youtube.com/watch?v=example",
    "duration_minutes": 10,
    "is_active": true,
    "sort_order": 1
  }
}
```

---

### 9.6 Criar Conteudo de Texto

```json
{
  "action": "insert",
  "table": "learning_contents",
  "data": {
    "module_id": "uuid-do-modulo",
    "title": "Guia de Referencia",
    "description": "Material de leitura complementar",
    "content_type": "text",
    "text_content": "<h2>Introducao</h2><p>Este e o guia de referencia...</p>",
    "duration_minutes": 5,
    "is_active": true,
    "sort_order": 2
  }
}
```

---

### 9.7 Buscar Conteudos de um Modulo

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

### 9.8 Excluir Trilha/Modulo/Conteudo

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

## 10. BIBLIOTECA DE MIDIAS

### 10.1 Criar Categoria de Midia

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
      "description": "Banners para redes sociais e anuncios",
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

**Videos:**
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

### 10.3 Criar Item de Midia (Imagem)

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

### 10.4 Criar Item de Midia (Video)

```json
{
  "action": "insert",
  "table": "media_items",
  "data": {
    "category_id": "uuid-da-categoria",
    "title": "Video Institucional",
    "description": "Video de apresentacao da empresa",
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

### 10.6 Buscar Itens por Tipo de Midia

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

### 10.7 Excluir Item de Midia

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

## 11. ACOES ADMINISTRATIVAS

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

## 12. PROFILES (Perfis - Atualizacao Direta)

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

## RESUMO DE TABELAS E ACOES

| Tabela | insert | update | upsert | get | delete |
|--------|--------|--------|--------|-----|--------|
| users | Sim | Sim | - | Sim | Nao |
| profiles | - | Sim | Sim | Sim | Nao |
| leads | Sim | Sim | Sim | Sim | Nao |
| payouts | Sim | Sim | Sim | Sim | Nao |
| tiers | Sim | Sim | Sim | Sim | Nao |
| pricing_tiers | Sim | Sim | Sim | Sim | Nao |
| commission_history | Sim | Sim | Sim | Sim | Nao |
| documents | Sim | Sim | Sim | Sim | Sim |
| support_tickets | Sim | Sim | Sim | Sim | Sim |
| support_messages | Sim | - | - | Sim | Sim |
| user_roles | Sim | Sim | Sim | Sim | Sim |
| learning_tracks | Sim | Sim | Sim | Sim | Sim |
| learning_modules | Sim | Sim | Sim | Sim | Sim |
| learning_contents | Sim | Sim | Sim | Sim | Sim |
| media_categories | Sim | Sim | Sim | Sim | Sim |
| media_items | Sim | Sim | Sim | Sim | Sim |

---

## ACOES ESPECIAIS

| Action | Descricao |
|--------|-----------|
| calculate_tier | Calcular tier do afiliado |
| calculate_commission | Registrar comissao mensal |
| deactivate_user | Desativar usuario |
| activate_user | Reativar usuario |
| reset_password | Resetar senha |
| get_admin_summary | Dashboard administrativo |

---

## STATUS VALIDOS

### Leads
- pending, active, inactive, late_payment

### Payouts
- pending, processing, completed, failed, rejected

### Tickets
- open, in_progress, waiting_user, resolved, closed

### Commission History
- pending, processing, completed, rejected

---

## TIER LEVELS VALIDOS
- silver, gold, platinum, diamond, titanium, audaks

---

## METODOS DE PAGAMENTO
- pix, bank_transfer, paypal

---

## TIPOS DE MIDIA
- photo, video, file

---

## CATEGORIAS DE DOCUMENTOS
- contract, report, invoice, other

---

## CATEGORIAS DE TICKETS
- general, technical, billing, other

---

## PRIORIDADES DE TICKETS
- low, medium, high, urgent

---

## ROLES DE USUARIO
- user, admin, super_admin

---

**Documento gerado em:** Janeiro 2026
**Versao do Webhook:** v2.1

