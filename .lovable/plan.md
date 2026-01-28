
# Plano de Atualizacao da Documentacao e Edge Function do Webhook

## Problema Identificado

A documentacao em `docs/WEBHOOK_DOCUMENTATION.md` esta **DESATUALIZADA** em relacao ao codigo da Edge Function `n8n-webhook`.

### Inconsistencia Principal

A documentacao v2.1 menciona 16 tabelas suportadas, mas a Edge Function so implementa **11 tabelas**:

| Status | Tabela | Documentada | Implementada |
|--------|--------|-------------|--------------|
| OK | profiles | Sim | Sim |
| OK | leads | Sim | Sim |
| OK | payouts | Sim | Sim |
| OK | users | Sim | Sim |
| OK | user_roles | Sim | Sim |
| OK | tiers | Sim | Sim |
| OK | pricing_tiers | Sim | Sim |
| OK | commission_history | Sim | Sim |
| OK | documents | Sim | Sim |
| OK | support_tickets | Sim | Sim |
| OK | support_messages | Sim | Sim |
| FALTA | learning_tracks | Sim | **NAO** |
| FALTA | learning_modules | Sim | **NAO** |
| FALTA | learning_contents | Sim | **NAO** |
| FALTA | media_categories | Sim | **NAO** |
| FALTA | media_items | Sim | **NAO** |

---

## Solucao Proposta

Implementar suporte completo as 5 tabelas de Materiais de Apoio na Edge Function para manter consistencia com a documentacao.

---

## Fase 1: Atualizar Edge Function

### 1.1 Adicionar Novas Tabelas ao Type

```typescript
// Linha 148 - Atualizar TableName
type TableName = "profiles" | "leads" | "payouts" | "users" | "user_roles" | 
  "tiers" | "pricing_tiers" | "commission_history" | "documents" | 
  "support_tickets" | "support_messages" |
  "learning_tracks" | "learning_modules" | "learning_contents" | 
  "media_categories" | "media_items";
```

### 1.2 Adicionar ao VALID_TABLES

```typescript
// Linha 194-198
const VALID_TABLES: TableName[] = [
  "profiles", "leads", "payouts", "users", "user_roles", 
  "tiers", "pricing_tiers", "commission_history", 
  "documents", "support_tickets", "support_messages",
  "learning_tracks", "learning_modules", "learning_contents",
  "media_categories", "media_items"
];
```

### 1.3 Adicionar Filtros para Novas Tabelas

```typescript
// Atualizar interface GetFilters
interface GetFilters {
  // ... filtros existentes ...
  track_id?: string;      // Para learning_modules
  module_id?: string;     // Para learning_contents
  category_id?: string;   // Para media_items
  type?: string;          // Para media_categories (photo/video/file)
  media_type?: string;    // Para media_items
  is_featured?: boolean;  // Para learning_tracks
}
```

### 1.4 Implementar handleGetOperation para Novas Tabelas

Adicionar cases no switch de `handleGetOperation`:

- `learning_tracks`: Buscar trilhas com filtros is_active, is_featured
- `learning_modules`: Buscar modulos por track_id
- `learning_contents`: Buscar conteudos por module_id
- `media_categories`: Buscar categorias por type (photo/video/file)
- `media_items`: Buscar itens por category_id e media_type

### 1.5 Implementar validateTableData para Novas Tabelas

Adicionar validacoes para cada tabela:

**learning_tracks:**
- title: obrigatorio, max 255 chars
- description: opcional, max 5000 chars
- cover_url: opcional, validar URL
- is_active: boolean, padrao true
- is_featured: boolean, padrao false
- sort_order: integer, padrao 0
- created_by: UUID opcional

**learning_modules:**
- track_id: UUID obrigatorio
- title: obrigatorio, max 255 chars
- description: opcional, max 2000 chars
- is_active: boolean
- sort_order: integer

**learning_contents:**
- module_id: UUID obrigatorio
- title: obrigatorio, max 255 chars
- description: opcional, max 2000 chars
- content_type: 'video' ou 'text'
- video_url: URL opcional
- text_content: texto opcional
- duration_minutes: integer opcional
- is_active: boolean
- sort_order: integer

**media_categories:**
- name: obrigatorio, max 100 chars, unico
- display_name: obrigatorio, max 255 chars
- type: 'photo', 'video' ou 'file'
- description: opcional, max 1000 chars
- cover_url: URL opcional
- is_active: boolean
- sort_order: integer

**media_items:**
- category_id: UUID obrigatorio
- title: obrigatorio, max 255 chars
- description: opcional, max 1000 chars
- file_url: URL obrigatoria, max 1000 chars
- thumbnail_url: URL opcional
- file_type: extensao obrigatoria (jpg, png, mp4, pdf, etc)
- file_size: integer opcional
- media_type: 'photo', 'video' ou 'file'
- dimensions: JSONB opcional {width, height}
- duration_seconds: integer opcional
- is_active: boolean
- sort_order: integer
- created_by: UUID opcional

### 1.6 Atualizar getConflictColumn

```typescript
case "learning_tracks":
  return "id";
case "learning_modules":
  return "id";
case "learning_contents":
  return "id";
case "media_categories":
  return "name";  // unique
case "media_items":
  return "id";
```

### 1.7 Permitir DELETE nas Novas Tabelas (Opcional)

Adicionar ao array `deletableTables`:
```typescript
const deletableTables: TableName[] = [
  "documents", "support_tickets", "support_messages", "user_roles",
  "learning_tracks", "learning_modules", "learning_contents",
  "media_categories", "media_items"
];
```

---

## Fase 2: Ajustes na Documentacao

### 2.1 Verificar Versao

Confirmar que o changelog v2.1 esta correto apos implementacao.

### 2.2 Adicionar Exemplos de Uso

Adicionar exemplos curl para as novas tabelas:

```bash
# Criar trilha de aprendizado
curl -X POST '...' -d '{
  "action": "insert",
  "table": "learning_tracks",
  "data": {
    "title": "Introducao ao Programa",
    "description": "...",
    "is_active": true,
    "is_featured": true
  }
}'

# Buscar itens de midia por categoria
curl -X POST '...' -d '{
  "action": "get",
  "table": "media_items",
  "filters": {
    "category_id": "uuid",
    "media_type": "photo",
    "is_active": true
  }
}'
```

### 2.3 Atualizar Lista de Filtros

Adicionar novos filtros a tabela de filtros:

| Filtro | Tipo | Descricao | Tabelas |
|--------|------|-----------|---------|
| track_id | UUID | Filtrar por trilha | learning_modules |
| module_id | UUID | Filtrar por modulo | learning_contents |
| category_id | UUID | Filtrar por categoria | media_items |
| type | string | Tipo de midia | media_categories |
| media_type | string | Tipo do item | media_items |
| is_featured | boolean | Destaque | learning_tracks |

### 2.4 Atualizar Tabela de Delete

Adicionar as novas tabelas permitidas para exclusao.

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/n8n-webhook/index.ts` | Adicionar 5 tabelas e validacoes |
| `docs/WEBHOOK_DOCUMENTATION.md` | Adicionar exemplos e ajustes menores |

---

## Estimativa

- Edge Function: ~200 linhas de codigo adicional
- Documentacao: Exemplos e ajustes menores

---

## Testes

Apos implementacao, testar:

1. GET em learning_tracks com filtros
2. INSERT em learning_modules com track_id
3. GET em media_items por category_id
4. UPDATE em media_categories
5. DELETE em learning_contents

---

## Resultado Esperado

Apos implementacao:

- 16 tabelas suportadas (documentacao e codigo consistentes)
- Sistema de Materiais de Apoio totalmente integravel via n8n
- Documentacao v2.1 100% precisa
