
# Plano: Atualização Completa do Webhook e Documentação

## Resumo

O webhook `n8n-webhook` está atualizado e funcional, mas a documentação está significativamente desatualizada. A documentação atual documenta apenas 4 tabelas e 4 actions, enquanto o webhook suporta 11 tabelas, 11 actions, e funcionalidades avançadas de segurança.

## Análise de Discrepâncias

### Tabelas não documentadas:
| Tabela | Status |
|--------|--------|
| user_roles | Falta na documentação |
| tiers | Falta na documentação |
| pricing_tiers | Falta na documentação |
| commission_history | Falta na documentação |
| documents | Falta na documentação |
| support_tickets | Falta na documentação |
| support_messages | Falta na documentação |

### Actions não documentadas:
| Action | Descrição |
|--------|-----------|
| delete | Excluir registros (documents, support_tickets, support_messages, user_roles) |
| calculate_tier | Calcular e atualizar nível do afiliado |
| calculate_commission | Registrar comissão mensal |
| deactivate_user | Desativar usuário |
| activate_user | Ativar usuário |
| reset_password | Redefinir senha |
| get_admin_summary | Obter resumo administrativo |

### Campos adicionais de usuário não documentados:
- `company_name` - Nome da empresa
- `cnpj` - CNPJ (14 dígitos)
- `phone` - Telefone (10-15 dígitos)
- `tier_level` - Nível do afiliado
- `role` - Papel do usuário (admin, super_admin, user)

### Funcionalidades de segurança não documentadas:
- Verificação de assinatura HMAC (headers opcionais)
- Audit logging para operações sensíveis
- Validação de CNPJ e telefone
- Sanitização de HTML/XSS

---

## Alterações Necessárias

### 1. Atualização da Documentação (`docs/WEBHOOK_DOCUMENTATION.md`)

A documentação será completamente reescrita para incluir:

1. **Visão Geral Atualizada** - Refletir todas as 11 tabelas suportadas
2. **Autenticação Avançada** - Incluir HMAC signature verification opcional
3. **Payload Base Atualizado** - Incluir todas as actions disponíveis
4. **Novas Seções de Tabelas**:
   - Tiers (Níveis de Parceria)
   - Pricing Tiers (Faixas de Preço)
   - Commission History (Histórico de Comissões)
   - Documents (Documentos)
   - Support Tickets (Tickets de Suporte)
   - Support Messages (Mensagens de Suporte)
   - User Roles (Papéis de Usuário)

5. **Seção de Actions Especiais**:
   - calculate_tier
   - calculate_commission
   - deactivate_user / activate_user
   - reset_password
   - get_admin_summary

6. **Campos de Usuário Expandidos**:
   - company_name, cnpj, phone, tier_level, role

7. **Filtros Adicionais**:
   - is_active, tier_level, category, priority, ticket_id, reference_month

8. **Exemplos Completos** para cada nova funcionalidade

---

## Detalhes Técnicos

### Arquivo Modificado
- `docs/WEBHOOK_DOCUMENTATION.md`

### Estrutura da Nova Documentação

```text
# SnapLeads Portal - Webhook n8n Documentation v2.0

## Visão Geral (atualizado)
## Autenticação
  - Header básico (x-webhook-secret)
  - HMAC Signature (opcional)
## URL Base
## Estrutura da Requisição
## Tabelas Suportadas (11 tabelas)
  1. Users
  2. Profiles
  3. Leads
  4. Payouts
  5. Tiers (NOVO)
  6. Pricing Tiers (NOVO)
  7. Commission History (NOVO)
  8. Documents (NOVO)
  9. Support Tickets (NOVO)
  10. Support Messages (NOVO)
  11. User Roles (NOVO)
## Actions Especiais (7 actions)
  - calculate_tier (NOVO)
  - calculate_commission (NOVO)
  - deactivate_user (NOVO)
  - activate_user (NOVO)
  - reset_password (NOVO)
  - get_admin_summary (NOVO)
  - delete (NOVO)
## Filtros Disponíveis (expandido)
## Validações de Dados
  - CNPJ (NOVO)
  - Phone (NOVO)
  - URL (NOVO)
## Códigos de Resposta
## Respostas de Erro
## Exemplos Completos (expandido)
## Segurança Avançada (NOVO)
  - HMAC Verification
  - Audit Logging
## Notas Importantes
## Changelog
```

### Conteúdo Principal a Adicionar

**Seção: Tiers (Níveis de Parceria)**
- GET com filtro is_active
- INSERT/UPDATE/UPSERT com campos: name, display_name, min_revenue, max_revenue, commission_percentage, bonus_amount, color, icon, sort_order, client_count

**Seção: Actions Especiais**
- calculate_tier: Atualiza tier baseado em receita
- calculate_commission: Registra comissão mensal
- deactivate_user/activate_user: Gerencia status do usuário
- reset_password: Redefine senha
- get_admin_summary: KPIs do sistema

**Seção: HMAC Signature (Segurança Avançada)**
- Headers opcionais: x-webhook-signature, x-webhook-timestamp
- Secret: N8N_WEBHOOK_HMAC_SECRET
- Janela de tempo: 5 minutos

---

## Impacto

- **Não há mudanças no código do webhook** - O código está completo e funcional
- **Apenas atualização da documentação** - Para refletir o estado atual
- **Melhor integração com n8n** - Documentação completa facilita automações

